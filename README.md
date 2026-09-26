# Brian Wendot personal website

The active environment has three independent applications:

- `personal-website-v4/`: Next.js public website.
- `personal-website-admin/`: private React/Vite administration interface.
- `personal-website-backend/`: TypeScript/Fastify API with PostgreSQL and an
  existing local/S3-compatible media adapter.

V1, V2 and V3 are historical applications. Their code and existing deployment
workflow are unchanged. Docker Compose below is for **local development**, not
a production deployment configuration.

## Quick Start with Docker

Install Docker Desktop with **Linux containers** and Docker Compose v2 (a recent
version supporting `up --wait` is recommended). On Windows, enable Docker's WSL2
backend when prompted. Start Docker Desktop and confirm `docker info` works.
Your host Node version is irrelevant: each application runs in its own
`node:20.20.2-bookworm-slim` container. No host npm install is required.

Stop existing host servers occupying ports 3000, 5173, 4000, 9000 or 9001 first.
From this repository root:

```sh
docker compose up -d
docker compose ps -a
docker compose logs -f
```

The first start builds the images, including MinIO from a pinned upstream source
release, so allow time and internet access for npm/Go downloads. Later starts
reuse those images. To wait explicitly for startup, use:

```sh
docker compose up -d --wait --wait-timeout 300
```

| Service | Local address |
| --- | --- |
| V4 | http://localhost:3000 |
| Admin | http://localhost:5173 |
| Backend | http://localhost:4000 (health: `/health`) |
| MinIO S3 API | http://localhost:9000 |
| MinIO console | http://localhost:9001 |
| PostgreSQL | `postgres:5432` inside Compose; no host port published |

All published ports bind to host loopback only. Use **localhost**, rather than
127.0.0.1 or a container hostname, in your browser so origin checks match.

Compose supplies all required development variables automatically. No `.env`
copying or production credentials are required. The checked-in database, MinIO
and session values are deliberately public **development-only** values. Never
deploy this Compose configuration or reuse those values in production.

MinIO console credentials for this local environment:

- User: `local-minio-admin`
- Password: `local-minio-password-never-use-in-production`

PostgreSQL and MinIO must pass health checks before the one-shot `setup` service
creates the private `portfolio-development` bucket, runs migrations and imports
the initial portfolio. The backend waits for setup to finish successfully;
V4/Admin wait for backend health. `setup` showing `Exited (0)` is expected.
Setup failure stops dependent apps from starting; inspect `docker compose logs setup`.

Initial seed runs only for a fresh database. A development-only database marker
records completion, including resumable interrupted imports. Later starts run
migrations without restoring intentionally deleted seed content or overwriting
edits. Existing populated databases are not automatically seeded.

### Create the first admin / reset its password

There is no default Admin account and no public signup. After startup:

```sh
docker compose exec backend npm run admin -- create your-email@example.com
```

Enter a password of at least 14 characters at the hidden prompt, then sign in at
http://localhost:5173. To change/reset it directly through the backend:

```sh
docker compose exec backend npm run admin -- password your-email@example.com
docker compose exec backend npm run admin -- list
```

Password changes revoke existing sessions. Keep the interactive terminal enabled
for hidden password entry; do not use `-T` for these interactive commands or put
passwords on the command line. Account management remains backend-only.

## Daily commands

Run these from the repository root:

```sh
docker compose up -d
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose down
```

**`docker compose down` preserves PostgreSQL content, accounts, messages and MinIO
objects in named volumes.** Start again with `docker compose up -d`. Keep using
the same Compose project name (`bw-personal-website` by default), otherwise Docker
will select different volumes and the environment will appear fresh.

Useful operations:

```sh
# Apply new migrations explicitly to a running environment.
docker compose exec backend npm run db:migrate

# Rerun bucket/migration setup after fixing a failed setup or adding migrations.
docker compose run --rm setup
docker compose up -d

# Open a backend shell (Node 20 and app dependencies are already installed).
docker compose exec backend sh

# Administer PostgreSQL without installing psql on the host or exposing port 5432.
docker compose exec postgres psql -U website -d personal_site

# Rebuild after changing package manifests/lockfiles, Dockerfiles or app config.
docker compose up -d --build
```

Explicit `docker compose exec backend npm run db:seed` is available if you
intentionally want to reimport missing seed entries. Unlike normal startup,
explicit seed can recreate entries you previously deleted.

### Hot reload and dependencies

Compose mounts the three `src/` directories and frontend `public/` directories;
backend migrations/seed/Docker helpers and Admin `index.html` are also mounted.
Mounts are read-only to container processes; edit files normally on the host.
No host application root or `node_modules` is mounted. Linux dependencies live
inside each image, so host Node 22/Windows native binaries cannot replace them.
Framework caches/build output stay inside their respective containers.

V4's Docker command uses Next's Webpack development mode with Watchpack polling;
Admin uses a Docker-only Vite config with polling; backend tsx uses Chokidar
polling. Native-host commands and application behavior are unchanged. Polling can
use more CPU than native file notifications. If changes do not appear, inspect
service logs and confirm Docker Desktop can access the repository directory.

Config files/manifests are copied into images. Rebuild after editing those;
ordinary source edits hot reload. Installation scripts are skipped globally at
image build, then esbuild is explicitly rebuilt. The backend additionally checks
Sharp/Argon2 native bindings during build. The host-only embedded PostgreSQL
helper is not hydrated because PostgreSQL runs as a separate service.

## Persistent storage and intentional reset

Named volumes are project-scoped:

- `postgres_data`: PostgreSQL 18 database under `/var/lib/postgresql`.
- `minio_data`: private S3-compatible object data under `/data`.
- `verification_state`: normally empty; only the opt-in verification script uses
  it to carry temporary test credentials/IDs across container recreation.

The backend uses its **existing** S3 adapter with `S3_ENDPOINT=http://minio:9000`.
Frontends still request stable `/api/media/:id/file` URLs from the backend;
they do not access the bucket. Anonymous bucket access is disabled during setup.
Draft media remains subject to backend session authorization. This is not a new
media implementation. Existing host `.local/media` and embedded databases are
not automatically migrated into Docker and remain untouched.

To intentionally reset **all LOCAL Docker development data**, including the
database, admins, inbox, uploads and verification state:

```sh
docker compose down -v
docker compose up -d
docker compose exec backend npm run admin -- create your-email@example.com
```

**DESTRUCTIVE: `docker compose down -v` deletes the named volumes and their data.**
Only use it when you explicitly want a fresh local environment. Normal daily
shutdown is `docker compose down` without `-v`. Rebuilding images does not reset
content. Back up PostgreSQL and objects together before intentional resets or
database image-major changes. Do not change the PostgreSQL major version against
an existing data volume without following PostgreSQL's upgrade procedure.

## Clean-state verification

Windows PowerShell (from the repository root, with the normal stack stopped):

```powershell
.\scripts\verify-docker.ps1
```

The script chooses a fresh `bw-verify-*` Compose project, refuses pre-existing
containers/volumes for that name, checks required ports, builds images and waits
for health. It checks host frontend/API access and Node 20 in every application,
then runs the verification helper **inside the backend container**. It creates a
temporary admin through the CLI, verifies authentication/CORS, V4 server-rendered
content, public-message persistence/inbox visibility, and private MinIO uploads.
It runs `down` and `up -d` without deleting volumes, then verifies the account,
message, note and byte-identical uploaded media survived. It also confirms a
deleted seed entry was not restored by startup. Test fixtures/credentials are
removed on success, containers stopped, and test-project volumes left intact.
The script prints an explicitly destructive cleanup command for that test project.

If interrupted, inspect/clean up only the printed `bw-verify-*` project. Failed
runs may retain temporary verification credentials inside that project's volume.
There is no host Node requirement for this test. Authentication/inbox checks use
the actual backend API with browser Origin/CORS semantics; a manual browser login,
form submission and hot-reload check should complement it.

### Actual verification in this workspace

See [docker/VERIFICATION.md](docker/VERIFICATION.md). Docker CLI/Desktop and WSL
were unavailable during implementation. Consequently **image builds and all live
Docker startup/authentication/persistence checks remain unexecuted**, not passed.
Static checks cover the official Compose schema, dependency graph, source/secret
isolation, volume declarations, JS/PowerShell syntax and helper lint. Base-image
tags were confirmed active in Docker Hub. Run the script above after Docker is
installed to complete runtime acceptance.

## Deployment and application documentation

This setup deliberately uses local credentials, development servers, polling and
loopback bindings. It is not the production deployment. MinIO community is now
source-only and its upstream repository is archived; this local image builds
`RELEASE.2025-10-15T17-29-55Z` from upstream. The source release/license is retained
in the image. Use your chosen maintained object-storage service for production.

- [V4 documentation](personal-website-v4/README.md)
- [Admin documentation](personal-website-admin/README.md)
- [Backend, account commands and backups](personal-website-backend/README.md)
- [Previous application integration results](INTEGRATION-REPORT.md)
- [Compose health/dependency semantics](https://docs.docker.com/compose/how-tos/startup-order/)
- [MinIO source distribution](https://github.com/minio/minio#source-only-distribution)
- [PostgreSQL image and volume guidance](https://hub.docker.com/_/postgres)
