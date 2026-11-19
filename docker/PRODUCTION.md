# Portfolio deployment on the VPS

The production stack serves V4 at `https://briankoringo.com`, the admin UI at
`https://admin.briankoringo.com`, and selected API routes on those same origins.
Caddy terminates TLS. The three app ports bind to VPS loopback. PostgreSQL has
no published port. The development Compose file remains separate from production.
The backend resolves `TRUST_PROXY=docker-gateway` to its release network's IPv4
default gateway, which is the peer address for host Caddy's loopback connection.
Keep the backend port bound to loopback and let Caddy set the forwarded headers.

## One-time host setup

1. In IONOS DNS, point the `@` and `admin` A records at the VPS public IPv4
   address. Use AAAA records only if the VPS serves these hosts on public IPv6.
   Keep existing mail records and records for other subdomains. Make sure
   ports 80 and 443 reach the VPS.
2. Add the provided Caddy site blocks to the existing host Caddy configuration.
   On this VPS, the existing Caddyfile has no import directive. Give the
   fragment a stable path so later Git pulls do not alter the live routing
   configuration.

   ```sh
   sudo install -m 644 docker/portfolio.Caddyfile /etc/caddy/portfolio.Caddyfile
   sudoedit /etc/caddy/Caddyfile
   # Add at top level: import /etc/caddy/portfolio.Caddyfile
   sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
   sudo systemctl reload caddy
   sudo systemctl enable docker caddy
   ```

3. Run `~/docker/bin/deploy-portfolio.sh` from the VPS account with Docker and
   GitHub access. It generates production credentials on the first run. Keep
   `~/docker/portfolio-production/production.env` and the release metadata
   with your backups. Do not change or remove the database password file
   independently of PostgreSQL.

To create the first admin account after a successful deployment, use an
interactive terminal. The CLI prompts for a password without echoing it.

```sh
state=~/docker/portfolio-production
release=$(cat "$state/current")
export PORTFOLIO_PROJECT="$release"
PORTFOLIO_COMMIT=$(cat "$state/releases/$release/commit")
export PORTFOLIO_COMMIT
docker compose --env-file "$state/production.env" -p "$release" \
  -f "$state/releases/$release/compose.yaml" exec backend \
  node dist/cli.js admin create USER_EMAIL
unset PORTFOLIO_PROJECT PORTFOLIO_COMMIT
```

The first release seeds the backend snapshot. The reviewed GitHub project
import is a separate editorial action documented in
[the import guide](../personal-website-backend/imports/README.md).

## Releases and recovery

The deploy script requires a clean `main` checkout and a fast-forward-only
GitHub pull. It tests a committed archive against disposable PostgreSQL and
Chromium, then builds production images. It stops the old stack for an
offline, checksummed snapshot of PostgreSQL and local media. Each candidate
runs migrations on new volumes populated from that snapshot. The old release
and its volumes are retained. PostgreSQL, backend, public frontend, and admin
containers use Docker's `always` restart policy. Normal shutdowns and
container recreation retain the release's named volumes.

The deploy script marks a release current only after its local and HTTPS
checks pass. On failure it collects candidate logs, removes the candidate
containers and restarts the previous release on its original volumes. The
checkout remains at the pulled revision for diagnosis or retry. If the deploy
process is abruptly killed, the next invocation uses the pending release
record to finish recovery. A scheduled downtime window is needed for the
offline snapshot, migrations and health checks.

Backups live in `~/docker/portfolio-production/backups`. They contain
PostgreSQL data, including inbox and account records, and media uploads. The
archives are local, unencrypted physical snapshots and should be copied to
encrypted off-host storage. Restore to fresh volumes using the same
`portfolio-postgres:18` image that created the snapshot:

```sh
scripts/backup-portfolio.sh restore portfolio-RECOVERY SNAPSHOT_DIRECTORY
```

Use a lowercase release identifier for the restore command. For a standalone
backup, stop every container using both release volumes before running
`scripts/backup-portfolio.sh backup PORTFOLIO_RELEASE SNAPSHOT_DIRECTORY`.
Avoid pruning release images or volumes still needed for recovery. Old
release volumes and backup archives are retained until the operator removes
them. This installation starts with a new production data store. The
development PostgreSQL and MinIO volumes remain separate.
