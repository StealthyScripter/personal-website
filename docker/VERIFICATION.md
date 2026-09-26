# Docker development environment: verification record

## Scope

Added root Compose configuration, per-application Node 20 Dockerfiles and ignore
files, a pinned-source MinIO image, development-only bootstrap/verification
helpers, polling configuration, and root Quick Start documentation. Each app is
still its own Node process/container. Existing backend schemas/routes/auth/media
adapter and frontend application behavior were not changed. V1–V3 were not edited.
No commit or push was performed.

## Checks actually performed

| Check | Actual result |
| --- | --- |
| Docker CLI discovery (`docker version`, `docker compose version`) | Blocked: command not installed/on PATH |
| Standard Windows Docker Desktop installation locations | Not present |
| WSL discovery (`wsl --list --quiet`) | Windows reports WSL is not installed |
| Official Compose JSON Schema 2020-12 validation | Passed using Ajv 8 and the upstream Compose schema |
| Compose dependency/environment/mount assertions | Passed: health gates, separate Node 20 images, existing S3 adapter wiring, browser/internal API origins, persistent-volume declarations, loopback ports and source/secret isolation |
| Base image tags in Docker Hub | `node:20.20.2-bookworm-slim`, `golang:1.25-bookworm`, `postgres:18-bookworm` reported active; images were not pulled/built |
| Pinned MinIO release source | Upstream release/go.mod verified; source compilation not executed |
| `node --check` on bootstrap, container verification helper, Docker-only Vite config | Passed |
| ESLint on new backend Docker helpers and Docker-only Vite config | Passed, zero warnings |
| PowerShell verification harness parse | Passed |
| `git diff --check` | Passed |

The repository's existing Ajv version did not support the current Compose
schema's 2020-12 dialect. The successful validation used Ajv 8 in an ignored
tooling directory; no application dependency or lockfile was changed. Tooling
files are not part of the deliverable.

Previous native application test/build results in INTEGRATION-REPORT.md remain
historical evidence only. They are **not** evidence that the new Docker images
build or that Docker networking, MinIO and bind-mount watchers work. No existing
application code changed, so those expensive suites were not repeated.

## Requested clean-state Docker acceptance

These require a working Docker Engine and remain **unexecuted** in this workspace:

| Requirement | Prepared check / status |
| --- | --- |
| 1. Images build | Harness runs `up --build`; not executed |
| 2. PostgreSQL healthy | `pg_isready` health check + health-gated setup; not executed |
| 3. Migrations succeed | Setup exits successfully only after migration/seed; not executed |
| 4. Admin created from backend container | Harness invokes real backend CLI with hidden stdin password; not executed |
| 5. Backend healthy | HTTP database-backed `/health`; not executed |
| 6. V4 loads on 3000 | Host HTTP check + container SSR-content check; not executed |
| 7. Admin loads on 5173 | Host HTTP check + served configuration check; not executed |
| 8. Admin authenticates | Real API login/CORS/cookie checks; not executed; browser UI acceptance also outstanding |
| 9. V4 retrieves backend content | Checks server-rendered seeded project and newly published note; not executed |
| 10. Public message reaches inbox | Public-origin POST followed by private inbox GET; not executed |
| 11. Media survives down/up | Compares uploaded object's SHA-256 before/after recreation; not executed |
| 12. PostgreSQL content survives down/up | Verifies account login, note and inbox message after recreation; not executed |
| 13. `down -v` clearly destructive | Documented in root README, with explicit loss of accounts/content/messages/objects |

The extra persistence check deletes an unpublished seed note before recreation
and verifies startup does not recreate it. Successful verification restores that
entry and removes its own message/note/upload/account. An interrupted/failed run
can leave temporary credentials/fixtures only in its isolated test project's
volumes. Those volumes are not the normal development project's volumes.

## Complete verification when Docker is available

1. Install/start Docker Desktop with Linux containers and its WSL2 backend.
2. Stop host services or another Compose project on ports 3000/5173/4000/9000/9001.
3. From the root, run `docker compose config --quiet` and
   `.\scripts\verify-docker.ps1` in PowerShell. The script requires a fresh project
   name and creates one automatically; it never targets the normal development
   project by default. No host Node installation is needed.
4. Inspect its exact results. Do not mark the runtime checks above passed until
   that run succeeds. Use the printed project name to inspect logs after failure.
5. Start the normal stack with `docker compose up -d`, create your own admin,
   manually sign in, submit a public form, inspect the inbox and confirm hot reload
   by editing/restoring an existing source file in each application.

Normal shutdown is `docker compose down`, which retains named volumes. The harness
also uses down without `-v` and leaves its test volumes after completion. It prints
an optional, explicitly destructive cleanup command scoped to its test project.

## Design details relevant to review

- PostgreSQL 18 volume mounts at `/var/lib/postgresql`, not the old pre-18 path.
- No host `node_modules`, `.env` or app root is bind-mounted. Image dependencies
  are owned by the non-root Node user, including Vite's writable dependency cache.
- Selective read-only source mounts preserve hot reload; framework caches remain
  container-local. Config/dependency changes require a rebuild.
- Browser-facing API URL is localhost:4000; V4 server fetches backend:4000.
- MinIO uses a persistent `/data` volume. Setup creates the private bucket through
  the already-installed AWS SDK; no second media adapter or new app dependency.
- A database completion marker makes automatic initial seeding restart-safe and
  does not resurrect deleted content. Explicit `npm run db:seed` remains available.
- Credentials in Compose are explicitly local development values. Every published
  port is bound to 127.0.0.1. PostgreSQL is internal and can be administered through
  `docker compose exec postgres psql -U website -d personal_site`.
- MinIO source is pinned to RELEASE.2025-10-15T17-29-55Z. Upstream is source-only
  and archived; this convenience service is not a production-storage recommendation.

References: [Compose startup dependencies](https://docs.docker.com/compose/how-tos/startup-order/),
[official Compose schema](https://github.com/compose-spec/compose-spec/blob/master/schema/compose-spec.json),
[PostgreSQL image](https://hub.docker.com/_/postgres),
[MinIO upstream source distribution](https://github.com/minio/minio#source-only-distribution).
