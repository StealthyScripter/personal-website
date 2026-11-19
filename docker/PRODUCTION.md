# Portfolio production deployment

Run the production Compose commands from the repository root. Compose builds
the Backend, V4, and Admin images from this checkout as one project named
`portfolio`. PostgreSQL 18 is attached only to the internal database network.
The Backend joins that network and the app network. V4 calls the Backend via
`http://backend:4000`. Admin's browser requests use its HTTPS origin.

The VPS's existing Caddy instance terminates TLS and proxies to loopback ports
8410 (Backend), 8411 (V4), and 8412 (Admin). It serves only the public API
allowlist on the public site and routes Admin API requests on the Admin
hostname. Admin's container Caddy serves the static bundle on port 8080. Only
the app bridge gateway is trusted for forwarded headers at the Backend. The
four Docker health checks use internal connections and work before Caddy
obtains public certificates. Media files are stored on the Backend's persistent
volume. Neither runtime claims a host listen port for PostgreSQL or another
media service.

## One-time environment setup

On a fresh host:

```sh
install -m 600 .env.production.example .env.production
openssl rand -hex 32  # Put this value in PORTFOLIO_DB_PASSWORD.
openssl rand -hex 48  # Put this value in PORTFOLIO_SECURITY_SECRET.
```

Edit the ignored `.env.production` and keep it with your secure backups.
Use a hex password because Compose interpolates it into the PostgreSQL URL.
The checked-in Backend env file supplies the nonsecret runtime settings.
Compose creates `portfolio_postgres_data` and `portfolio_media_data` on the
first startup.

### Adopting data from the previous deployer

Before the first Compose startup, identify the authoritative PostgreSQL and
media volume pair and stop the old portfolio containers if they are running.
If the old deployment had a successful release, its
`~/docker/portfolio-production/current` file identifies the pair to use. If
only failed releases exist, check the old release logs and confirm which pair
contains the data you want to carry forward. Inspect the names with:

```sh
docker volume ls --filter name=portfolio
docker ps -a --filter name=portfolio
```

Keep the original password and security secret from the legacy
`~/docker/portfolio-production/production.env`. Put them in the new
`.env.production`, set `PORTFOLIO_EXTERNAL_VOLUMES=true`, and set
`PORTFOLIO_POSTGRES_VOLUME` and `PORTFOLIO_MEDIA_VOLUME` to the exact Docker
volume names. Compose will attach those volumes in place and fail if either
is missing. This setting survives all subsequent updates. Keep the original
PostgreSQL credentials when reusing initialized data. Back up the pair offline
before the first startup with new images.

### Configuring the existing VPS reverse proxy

For the current VPS, set the apex and `admin` A records in IONOS DNS to
`74.208.152.56`. Remove any stale AAAA record for either hostname if there is
no corresponding working IPv6 listener on this VPS. Keep other subdomain and
mail records. Make sure public ports 80 and 443 can reach the existing Caddy.

Install the repository's Caddy fragment and add its import once at the top
level of the host Caddyfile. Keep the other site blocks in place.

```sh
sudo install -m 644 docker/portfolio.Caddyfile /etc/caddy/portfolio.Caddyfile
sudoedit /etc/caddy/Caddyfile
# Add: import /etc/caddy/portfolio.Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl reload caddy
```

Reinstall the fragment and reload Caddy only if the routing file changes.
If loopback responds while HTTPS fails, inspect DNS and the host Caddy log:

```sh
dig +short briankoringo.com A
dig +short briankoringo.com AAAA
dig +short admin.briankoringo.com A
dig +short admin.briankoringo.com AAAA
sudo journalctl -u caddy -n 100 --no-pager
curl --fail --show-error https://briankoringo.com/api/settings
curl --fail --show-error https://admin.briankoringo.com/
```

Expected route checks after certificate issuance are HTTP 200 on both home
pages and on the public `/api/settings` route, HTTP 401 on
`https://admin.briankoringo.com/api/admin/auth/me` before login, and HTTP 404
on that API path on the public hostname.

## First deployment

```sh
docker compose --env-file .env.production -f compose.production.yaml config --quiet
docker compose --env-file .env.production -f compose.production.yaml up -d --build
docker compose --env-file .env.production -f compose.production.yaml ps
```

The Backend waits for a healthy database, applies pending migrations with its
migration lock, and seeds an uninitialized database before starting the API.
The bootstrap checks for the settings row, which is written last by the seed.
Established databases skip the bootstrap to respect editorial deletions.
V4 waits for the Backend to become healthy. Wait for all four services to
report healthy before checking Caddy or creating the first admin account:

```sh
docker compose --env-file .env.production -f compose.production.yaml up -d --wait --wait-timeout 180
docker compose --env-file .env.production -f compose.production.yaml exec backend node dist/cli.js admin create USER_EMAIL
```

The account command prompts for the password in the terminal.

### Staged initialization and explicit imports

For a manually staged first start, run these commands in order. The migration
and bootstrap commands can be rerun after an interruption.

```sh
docker compose --env-file .env.production -f compose.production.yaml up -d --wait postgres
docker compose --env-file .env.production -f compose.production.yaml build backend
docker compose --env-file .env.production -f compose.production.yaml run --rm backend node dist/cli.js migrate
docker compose --env-file .env.production -f compose.production.yaml run --rm backend node dist/cli.js seed --if-uninitialized
docker compose --env-file .env.production -f compose.production.yaml up -d --build
```

Use the explicit `seed` command without the flag only when deliberately
restoring missing records from the baseline snapshot. It preserves existing
records but can reintroduce deleted seed records. The
[reviewed portfolio import](../personal-website-backend/imports/README.md)
is a separate editorial operation. Preview it and review the planned ordering
and draft changes before applying it. The mount retains its pre-import snapshot
in a private directory owned by the regular VPS deploy account (UID 1000).

```sh
docker compose --env-file .env.production -f compose.production.yaml run --rm backend node --import tsx scripts/import-projects.ts imports/github-projects.json
mkdir -p -m 700 "$HOME/portfolio-import-backups"
docker compose --env-file .env.production -f compose.production.yaml run --rm -v "$HOME/portfolio-import-backups:/app/.local/imports" backend node --import tsx scripts/import-projects.ts imports/github-projects.json --apply
```

## Subsequent updates

```sh
git pull --ff-only origin main
docker compose --env-file .env.production -f compose.production.yaml config --quiet
docker compose --env-file .env.production -f compose.production.yaml up -d --build
docker compose --env-file .env.production -f compose.production.yaml ps
```

Compose recreates changed services and reattaches the same volumes. Allow for
brief downtime during recreation. Startup applies pending migrations before
serving traffic. Take an offline backup before schema changes. An in-place
Compose update does not automatically revert migrations or restore prior images.

## Logs and safe shutdown

```sh
docker compose --env-file .env.production -f compose.production.yaml logs --tail=150 -f postgres backend v4 admin
docker compose --env-file .env.production -f compose.production.yaml down
```

Ordinary `down` keeps the database and media volumes. Avoid `down --volumes`
and volume pruning. For an offline backup, stop the stack, then run:

```sh
scripts/backup-portfolio.sh backup portfolio /path/to/new-snapshot-directory
```

For adopted legacy volumes, use their shared prefix (everything before
`_postgres_data` or `_media_data`) instead of `portfolio`. The backup contains
physical PostgreSQL data and media, including private data. Store it securely.
Restore to a fresh pair and review it before pointing the stack at it:

```sh
scripts/backup-portfolio.sh restore portfolio-recovery /path/to/snapshot-directory
```
