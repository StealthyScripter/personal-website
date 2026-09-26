# Personal website backend

Independent Fastify / TypeScript / PostgreSQL service. V4 and Admin consume its HTTP API; a future V5 can use the same database and URLs. No runtime imports from either frontend. Node 20.20.2 and npm are used by the checked-in lockfile.

## Local setup

From this directory:

```sh
npm ci
cp .env.example .env
# Edit DATABASE_URL and SECURITY_SECRET (at least 32 random characters).
npm run db:migrate
npm run db:seed
npm run admin -- create your-email@example.com
npm run dev
```

The create command prompts for a hidden password of at least 14 characters. There is no default account/password, public signup, web account management, or password-recovery endpoint.

Without an installed PostgreSQL server, run `npm run db:local` in a separate terminal **before creating .env**. It creates an ignored .env with random local credentials and starts a persistent, loopback-only PostgreSQL cluster on 127.0.0.1:55432. It refuses to manage another address. Stop with Ctrl+C. This development helper is not a production database service. Native embedded-postgres installation must be allowed by your npm install-script policy.

Seed is explicit and idempotent: it never overwrites an existing slug/settings. It imports three existing portfolio projects and their re-encoded covers, keeps two example notes unpublished, and creates four Currently slots. Backend-owned `seed/` is an import snapshot, not a production read path. The seeded covers are illustrative previews inherited from the old portfolio, not newly verified screenshots.

## Account management (backend only)

```sh
npm run admin -- create your-email@example.com
npm run admin -- list
npm run admin -- disable your-email@example.com
npm run admin -- enable your-email@example.com
npm run admin -- password your-email@example.com
npm run admin -- remove your-email@example.com
```

Create/password prompt without echo. For controlled automation use `--password-stdin` and pipe a secret-manager value, never put a password in shell arguments or checked-in scripts. List does not return hashes. Disable, enable, remove and password changes revoke existing sessions. Removing the last admin is possible; recover by creating an account directly through this CLI.

## HTTP contract

All JSON errors have a safe `error` string; validation may include `fields`. Pagination is `?limit=1..100&offset=0..100000`. Responses and private media are not cached.

| Endpoint | Behavior |
| --- | --- |
| GET /health | Database connectivity |
| GET /api/projects, /api/notes, /api/currently | Published/visible entries only, `{items: []}` |
| GET /api/projects/:slug, /api/notes/:slug | Published entry or 404 |
| GET /api/settings | Safe public identity/copy |
| POST /api/messages | Validated contact message, 201 `{accepted:true}` only after persistence |
| GET /api/media/:id/file | Stable storage-independent URL; published references or authenticated admin; byte ranges |
| POST /api/admin/auth/login | Email/password; generic authentication failure; session cookie + CSRF token |
| GET /api/admin/auth/me | Session identity + CSRF token |
| POST /api/admin/auth/logout | Invalidate server-side session |
| GET /api/admin/overview | Content and inbox counts |
| GET/POST /api/admin/projects, /notes, /currently | List/create |
| GET/PUT/DELETE /api/admin/{collection}/:id | Read/update/delete |
| GET /api/admin/messages, /messages/:id | Inbox summary/message |
| PATCH /api/admin/messages/:id | `{status:"read"|"unread"|"archived"}` |
| GET/POST /api/admin/media | List/upload multipart file |
| DELETE /api/admin/media/:id | Reject referenced assets with 409 |
| GET/PUT /api/admin/settings | Versioned public copy |

Content create uses `{content: {...}}`; update uses `{content: {...}, version: N}`. Delete requires `?version=N`. Stale edits return 409, never silently overwrite. The Admin displays this error and preserves entered values; return to the list/reload to obtain the latest version before reapplying changes.

Authoritative schemas: `src/schemas.ts`. Project fields include title, slug, summary, description paragraphs, optional status, published, featured, order, coverImage, ordered images/captions, features, video, story, technicalDescription, technologies, liveUrl, repositoryUrl, collaboration flag/description, currentStatus, nextSteps, relatedLinks and dates. Published projects require a cover. Images require managed src, useful alt, width and height. Uploaded video requires caption and transcript; poster and WebVTT captions are optional. External video is a link, not an embedded third-party player.

Original notes have body paragraphs. External notes have source, externalUrl and personal comment; no copied article body. Both support summary, image, category, tags, date and published. Currently supports Building, Reading, Exploring and Open to, text, optional link, visibility and order. Empty hidden items are valid; empty visible items are rejected. Settings cannot edit origins, secrets or accounts.

## Security and deployment

Passwords use Argon2id (64 MiB, 3 iterations). Random session tokens are stored as SHA-256 hashes in PostgreSQL; cookies are HttpOnly, SameSite=Strict, host-only and Secure with __Host- prefix in production. Sessions default to eight hours, expire server-side, and are checked against enabled accounts for every protected request. Mutations also require the exact Admin Origin and a session-bound HMAC CSRF token. Private requests with an Origin must use ADMIN_ORIGIN; public Origin cannot read private API/draft media with a session.

Keep Admin and API on **same-site HTTPS subdomains**, e.g. admin.example.com and api.example.com, for SameSite=Strict cookies. Different unrelated hosting domains will not work with this cookie policy. Browser requests use credentials; CORS only allows the configured origins. Public form POST requires PUBLIC_ORIGIN. Configure TRUST_PROXY only with trusted proxy IP/CIDR values to preserve meaningful IP limits.

Database-backed rate limits: general 300/minute/IP, login 10/15 minutes/IP and account, contact 5/15 minutes/IP, uploads 30/5 minutes/admin. Honeypot, bounded JSON bodies, validation and file limits supplement them. Schedule `node --env-file=.env dist/cli.js prune` to delete expired rate/session records. Audit records avoid password/message bodies; set a retention policy suitable for your deployment.

Each app deploys independently. Build with `npm run build`, then `npm start` from this directory with migrations/seed retained for CLI use. Run migrations as a controlled deployment step before serving traffic. Do not run automatic seed on every startup. A reverse proxy should supply HTTPS, enforce body/time limits, and avoid caching private responses. The V3 GitHub Pages workflow is unchanged and cannot host this backend.

## Storage

Current local development uses STORAGE_DRIVER=local and MEDIA_DIR=.local/media. Treat it as development storage, not durable production hosting.

For production use STORAGE_DRIVER=s3, S3_BUCKET, S3_REGION and optionally S3_ENDPOINT for an S3-compatible provider. Credentials use the AWS SDK credential chain (prefer a scoped workload role; otherwise AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY). Bucket is private; grant only the required GetObject, PutObject and DeleteObject access to that bucket. Enable encryption, versioning, backup and lifecycle policies appropriate to the provider. Do not expose the bucket directly: draft authorization is performed by the backend proxy. Public/admin URLs remain /api/media/:id/file when storage changes.

Uploads check file signatures, MIME and extension. PNG/JPEG/WebP/GIF images are decoded, bounded to 40 megapixels, resized within 6000px and re-encoded as WebP, stripping metadata; input images max 10 MB. Video MP4/WebM max 50 MB, VTT max 1 MB, all max 50 MB. Names are server-generated UUIDs. A database lock serializes media deletion against attaching references. Failed metadata inserts remove the uploaded object. Unreferenced uploads can be deleted through Admin. No automatic garbage collection deletes potentially unfinished drafts.

Video validation checks container signatures; it is not a malware scanner or transcoder. Production object-storage credentials were not available for a live S3 round trip. Local storage and authorization were tested; S3 deployment still needs a provider-specific acceptance check.

## Backup and restore

Before deploying/migrating, take a PostgreSQL custom-format dump using the PostgreSQL tools matching your server:

```sh
pg_dump --format=custom --file=site-before-migration.dump "$DATABASE_URL"
# Restore into a NEW, empty database, never over the live database first.
pg_restore --no-owner --no-privileges --dbname="$RESTORE_DATABASE_URL" site-before-migration.dump
```

PowerShell uses `$env:DATABASE_URL` and `$env:RESTORE_DATABASE_URL`. Avoid exposing passwords in recorded shell history; use your provider's secret injection or pgpass. Encrypt dumps, restrict access (they include inbox personal data and password/session hashes), retain offsite copies, and perform restore drills. Back up media alongside database metadata. Pause writes or take a coordinated snapshot to keep them consistent; use object versioning or a volume snapshot for local media. After a recovery, invalidate restored sessions (`DELETE FROM admin_sessions;`) and rotate SECURITY_SECRET. Restore rehearsal against an external production service has not been performed.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

API tests use the .env database server to create/drop a uniquely named disposable database; the test user needs CREATEDB. They never truncate the configured content database. Tests cover clean/repeated migration, repeated seed, CLI creation, authentication, cookie flags, expiry/logout/account revocation, origin/CSRF, publication, media validation/access/deletion, conflicts, notes, Currently, inbox and rate limits. See ../personal-website-admin/README.md for the three-app Chromium suite and ../INTEGRATION-REPORT.md for actual results.
