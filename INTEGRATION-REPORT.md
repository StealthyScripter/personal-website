# V4 integration and verification — September 25, 2026

V4, Admin and Backend are three independent applications. V1–V3 and the existing
GitHub Pages deployment workflow were not changed. No deployment or commit was
performed. The applications and documentation remain untracked in the working tree.

## Implementation

- Completed the Admin application: login/logout, overview, project/note editors,
  draft/publish/preview, ordered screenshots, optional project sections, Currently,
  inbox, media library, and safe public settings. Account management is CLI-only.
- V4 reads projects, notes, Currently and settings from PostgreSQL through the
  backend in server components. Requests are uncached across renders. Homepage,
  detail pages and sitemap share this source; there is no local JSON fallback.
- Verified migration before removing old V4 project/note JSON. Backend-owned
  `seed/` retains historical import snapshots and original images. The three
  existing projects were imported; two sample notes remain drafts. Seed is
  idempotent and never overwrites existing edited content.
- Preserved the continuous homepage, anchor navigation, minimalist typography,
  responsive layout, normal browser scrolling and reduced-motion behavior.
- Contact success requires backend acceptance after database insertion. Field
  errors are associated with controls; failure preserves the message. Successful
  submission means stored in the inbox, not delivered by email.
- Fixed optional Currently-link validation, restricted private requests by origin,
  serialized content/media-reference changes against deletion, and made missing or
  unpublished detail pages return a real HTTP 404 before response streaming.

## Brand assets

The approved geometric W is reproduced as lightweight SVG, without a new monogram,
filters, gradients or animation. Header uses a compact mark and Brian Wendot;
footer selectively uses Brian Wendot Koringo. Home has an accessible name and the
SVG internals are decorative.

In `personal-website-v4/public/brand/`:

- `logo-mark-dark.svg`, `logo-mark-light.svg`
- `logo-lockup-dark.svg`, `logo-lockup-light.svg`
- `logo-mark-monochrome-dark.svg`, `logo-mark-monochrome-light.svg`
- `social-preview.svg`, `social-preview.png` (1200 × 630)

Dark/light asset names refer to the intended background. Generic social previews
use the mark and full name; project/note images take precedence when provided.

In `personal-website-v4/public/`:

- `favicon.svg` (OS-theme-aware)
- `favicon.ico` (16px and 32px PNG entries)
- `favicon-16x16.png`, `favicon-32x32.png`
- `apple-touch-icon.png` (180px)

The Admin also uses the mark-only SVG favicon. No installable-app manifest was
introduced. `scripts/generate-brand.mjs` regenerates assets using Sharp. SVG marks
are 266 bytes each; generic social PNG is about 39 KB.

CSS anchors are `--brand-charcoal` #1A1D1B, `--brand-sage` #7F8F7A,
`--brand-cream` #F8F6EF, `--brand-sand` #C9BEA8 and `--brand-stone` #E6E2DA.
The inline mark uses `--brand-mark-foreground`, switched intentionally by
`data-theme`; it is not filter-inverted. Existing semantic UI tokens remain.

Measured contrast ratios (light/dark): body 13.06/15.72, muted text 5.28/8.08,
primary button 7.34/8.00, form boundary 3.41/3.39. This is a targeted contrast
check, not a claim of a full accessibility audit.

## Actual validation results

| Check | Result |
| --- | --- |
| TypeScript, all three applications | Passed |
| ESLint, all three applications | Passed, zero warnings |
| V4 schema tests | 5 passed |
| Backend real-PostgreSQL suite | 11 passed, including the parent test |
| Three-app Chromium integration suite | 10 passed |
| Production standalone V4 browser smoke suite | 7 passed |
| V4 production build after 404/accessibility changes | Passed |
| Admin production build | Passed |
| Backend production build | Passed |
| Local HTTP checks on 3000/4000/5173 | All returned 200 |
| Package audit at installation | Zero reported vulnerabilities for the installed app dependencies |
| Final standalone production backend-outage check | Passed: HTTP 200 fallback, intended unavailable-content message, no ECONNREFUSED/connect/fetch-failed details in HTML |
| Final prospective-commit review | 119 files reviewed; no secret-pattern, generated/private-artifact or trailing-whitespace findings; all three dependency manifests match their lockfiles |

Backend checks used a newly created disposable PostgreSQL database, then removed
it. They exercised clean/repeated migrations, repeated seed, actual CLI account
creation via stdin, Argon2id storage, generic failed login, absent/invalid/expired
sessions, enabled/disabled accounts, password change and session revocation,
logout, production Secure/HttpOnly/SameSite cookie flags, CSRF/origin checks,
login/contact limits, draft filtering, version conflicts, media upload validation,
image re-encoding, private/public media access, ranges and reference-aware deletion.
Public account-management paths returned 404. CLI list excludes hashes.

Verified endpoint families: public projects/notes/Currently/settings/messages/media;
private authentication, overview, collection CRUD, messages/status, media and
versioned settings. See the backend README for exact routes and payloads.

The browser tests used real HTTP requests and PostgreSQL, not mocked successful
content/contact APIs. Through Admin they created a draft project, uploaded a cover
and multiple screenshots, reordered/captioned them, entered features/technologies/
URLs/collaboration/status/next steps, published it, viewed its server-rendered page,
opened the gallery, edited it and unpublished it. The final public URL returned 404.

Original notes were created as drafts, given an image/body/category/tags, published,
verified in server HTML, edited and unpublished. External references were published
and verified as direct, visibly external links with personal commentary. Currently
edits persisted, appeared in V4, and could be hidden with empty text.

A real public-form message persisted with timestamp/unread status, appeared in
Admin, opened correctly and transitioned read → unread → archived. A simulated
503 response verified frontend failure feedback and preservation of text before
the real successful request. Media-library deletion and two-editor settings
conflict feedback also passed. The stale editor preserved its entered value.

Branding, navigation, media and horizontal overflow were checked at 320, 375, 430,
768, 1024 and 1440px in both themes. Production smoke checks additionally verified
theme persistence, reduced motion, server-rendered content, unpublished-note 404
and favicon/social asset URLs. Desktop light and 320px dark screenshots were
visually reviewed. These are automated real-browser workflows plus visual review;
no separate human manual acceptance session was performed.

## Storage, accounts and operations

Active development storage is local filesystem under the backend's ignored
`.local/media`. An S3-compatible private-object adapter is implemented behind the
same stable media URLs. It was not live-tested because no object-storage provider
or credentials were supplied. Local filesystem storage is not presented as a
durable production solution. Configure private S3 storage, access policy,
encryption/versioning and backups before production.

Backend-only account commands, run in `personal-website-backend/`:

```sh
npm run admin -- create your-email@example.com
npm run admin -- list
npm run admin -- disable your-email@example.com
npm run admin -- enable your-email@example.com
npm run admin -- password your-email@example.com
npm run admin -- remove your-email@example.com
```

There is no default permanent admin. Create your own account with the hidden
password prompt. Random verification accounts existed only in disposable test
databases. Inactive browser-test databases were cleaned up after testing.

The backend README documents `pg_dump` custom-format backups and `pg_restore`
into a new database, coordinated media backups, encryption/access control,
restore drills, and invalidation of restored sessions. A production backup/restore
drill has not been performed against an external service.

## Remaining production configuration and limitations

- Configure real public/admin/API HTTPS origins and a managed PostgreSQL URL.
  Admin/API must be same-site subdomains for SameSite=Strict cookies.
- Generate a deployment session secret, create the owner account through CLI,
  configure trusted proxy addresses, private S3 credentials/role and bucket, and
  run migrations as a controlled deployment step.
- Set V4 `BACKEND_URL`, `NEXT_PUBLIC_API_URL`, `SITE_URL` and Admin `VITE_API_URL`.
  Browser-exposed API variables must be set before building. Each app has its own
  safe environment example and README.
- Deploy V4 to a Next.js Node host, Admin as a separate static app, and Backend as
  a persistent Node service. The current V3 Pages workflow was not switched.
- Configure monitoring, data retention, scheduled expired-session/rate-limit
  pruning and verified database/object backups. No production deployment occurred.
- Chromium was exercised; Safari/Firefox and assistive-technology manual testing
  were not performed. Uploaded video container validation is implemented, but a
  new uploaded-video playback round trip was not included in this integration run.
- Next development emitted LCP suggestions for some lazy project-card images
  during scripted scrolling. Critical detail covers are prioritized; below-fold
  media remains lazy. Production smoke checks passed.
- The previously blocked standalone backend-unavailable check now **passed**.
  The existing production standalone build ran temporarily on port 4183 with
  BACKEND_URL pointed to an unavailable loopback endpoint. The homepage returned
  HTTP 200 with the intended fallback and no connection-error details in its HTML.
  The temporary process was stopped afterward. No production build was repeated.

Local processes were left available: public development site at
http://localhost:3000, backend at http://localhost:4000 and Admin preview at
http://localhost:5173. The production rendering preview at http://localhost:4173
was used for smoke checks; its contact origin is intentionally not authorized by
the development backend, so use port 3000 for normal local contact testing.

## Final repository review

The tracked and staged diffs are empty because the new applications are untracked.
The review therefore inspected the 119 nonignored prospective commit files
directly, including source, tests, manifests, lockfiles, migration, seed snapshots,
brand assets and documentation. No application-code changes were necessary in
this final pass. Prior successful typechecks, lint, tests and builds were not
repeated; only the previously missing outage check and repository checks ran.

Confirmed the six approved logo variants, favicons, theme-driven inline mark,
content-first social metadata, public anchor navigation, persisted contact flow,
private Admin, API authorization, PostgreSQL migration, local/S3 abstraction and
operational documentation are represented. V1–V3 and .github remain unchanged.

No actual .env files, database files, random test credentials, logs, process IDs,
node_modules, .next, dist, test-results, .tools or TypeScript build output appear
in the prospective commit inventory. Secret-pattern scanning found no matches;
this is a scoped review, not a guarantee against every possible secret format.
Localhost URLs are documented development defaults or test addresses, not
deployment configuration. Replace them via the environment before production
builds. CLI logging is intentional; no debugger statements or temporary
verification content were found in runtime source/seed data. Example notes are
intentional unpublished fixtures. Legacy public project images/CNAME/.nojekyll
are preserved; runtime content no longer reads the legacy images or JSON.

The pre-existing root package-lock.json is empty and unrelated to all three apps.
It was preserved, but exclude it from an eventual application commit. Include each
app's own lockfile. Do not use a blanket commit of ignored local artifacts. No
files were staged, committed or pushed. Whitespace checks passed for candidate
text files and git diff --check; dependency/lockfile comparisons passed using Node
after Windows PowerShell's JSON parser rejected lockfile empty-string keys.

## Owner setup and deployment checklist

### Environment values

| App | Values to provide |
| --- | --- |
| V4 | BACKEND_URL (server-reachable API origin), NEXT_PUBLIC_API_URL (browser-reachable API origin, build time), SITE_URL (canonical HTTPS public origin) |
| Admin | VITE_API_URL (browser-reachable API origin, build time) |
| Backend | NODE_ENV=production, DATABASE_URL, SECURITY_SECRET (random, at least 32 characters), PUBLIC_ORIGIN, ADMIN_ORIGIN, API_ORIGIN |
| Backend host/session | PORT, HOST appropriate to the host/container, SESSION_HOURS (default 8), TRUST_PROXY only for known proxy addresses |
| Production media | STORAGE_DRIVER=s3, S3_BUCKET, S3_REGION, optional S3_ENDPOINT; scoped workload role or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (AWS_SESSION_TOKEN for temporary credentials) |
| Local media | STORAGE_DRIVER=local, MEDIA_DIR=.local/media |

Origins have no path/trailing slash. Use HTTPS in production. Keep Admin and API
on same-site subdomains so Strict cookies work. Never put database credentials or
the session secret into NEXT_PUBLIC_* or VITE_* variables. Set production values
before building browser bundles; do not deploy the currently local-configured
build output. Configure TLS/CA verification for the database per the provider;
do not disable certificate verification to make a connection work.

### PostgreSQL and media

Provision a persistent PostgreSQL database reachable only by the backend and
administrative jobs. Local verification used the embedded PostgreSQL 18 cluster.
The migration uses JSONB, generated columns and advisory locks. The migration
role needs schema/table/index creation rights; the runtime role needs the
application-table read/write privileges. Production runtime does not need
CREATEDB; disposable integration tests do.

Run migrations from the backend directory. Do not edit already applied migration
files. Seed only when intentionally importing the initial portfolio into a new
database; it will not overwrite edited entries. Back up the database and media
together before migration; rehearse restoring into a separate database.

Provision a private S3-compatible bucket with scoped GetObject/PutObject/DeleteObject
permissions, encryption, versioning and backups. Media is served through the API,
including draft authorization, so the bucket must not be publicly readable.
For a fresh deployment, configure S3 before running seed. To move an existing
database from local media, transfer every referenced object with the same storage
key; changing STORAGE_DRIVER alone does not copy files. A live S3 round trip and
production restore rehearsal still require your actual services/credentials.

### First admin and password reset

With the backend .env configured and migrations applied, run:

```sh
cd personal-website-backend
npm run admin -- create your-email@example.com
npm run admin -- password your-email@example.com
```

The second command changes/resets an existing account's password. Both prompt
without echo and require at least 14 characters. Password changes revoke all
sessions. There is no web recovery flow or default account.

If production installs omit development dependencies, use the built CLI instead
of npm's tsx-based development scripts, from the backend directory:

```sh
node --env-file=.env dist/cli.js migrate
node --env-file=.env dist/cli.js seed
node --env-file=.env dist/cli.js admin create your-email@example.com
node --env-file=.env dist/cli.js admin password your-email@example.com
```

Omit --env-file when the host injects environment variables directly. Retain
migrations/ and seed/ for the relevant CLI operations.

### Start locally

Use the project's Node 20 runtime and run npm ci once inside each app. Preserve
existing local environment files; do not overwrite them with examples.

1. Start PostgreSQL. For the existing isolated setup, run npm run db:local from
   personal-website-backend in its own terminal. On a fresh setup this helper
   creates an ignored .env with random credentials if none exists. Alternatively
   configure your own PostgreSQL URL in a copy of .env.example.
2. From personal-website-backend, run npm run db:migrate, then npm run db:seed for
   the initial import. Create your admin as above, then npm run dev (port 4000).
3. From personal-website-admin, set .env from its example if needed and run
   npm run dev (http://localhost:5173).
4. From personal-website-v4, set .env.local from its example if needed and run
   npm run dev (http://localhost:3000).

Use localhost consistently. If a prior local server is still running, reuse it
instead of starting a second process on the same port.

### Deployment order and manual acceptance

1. Choose HTTPS public/admin/API domains; provision PostgreSQL, private object
   storage, secrets, backups and network access.
2. Build the backend, back up any existing database/media, apply migrations,
   intentionally seed/import content, and create the owner account.
3. Start the backend behind HTTPS with exact origins/trusted-proxy settings;
   verify health and a real S3 upload/read/delete with draft protection.
4. Build/deploy Admin with its production VITE_API_URL; verify login and logout.
5. Build/deploy V4 with production API/canonical URLs to a Next.js Node host.
   Use the standalone server with public/ and .next/static copied into its output.
   GitHub Pages cannot host this server-rendered V4/backend combination.
6. Before switching public DNS, manually verify contact-to-inbox, publish/edit/
   unpublish, media, canonical/social previews and both themes on real devices.
   Check Safari/Firefox, keyboard/screen-reader behavior, and uploaded video if
   you will use it. Review factual content and keep examples unpublished.
7. Rehearse database/media recovery, enable monitoring and scheduled pruning,
   define inbox/audit retention, then switch traffic deliberately. Deployment
   credentials, DNS changes and publishing remain owner-controlled manual work.
