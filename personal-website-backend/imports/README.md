# Reviewed GitHub portfolio import

`github-projects.json` is an explicit, backend-only editorial import manifest.
It is not read by the API or either frontend at runtime. PostgreSQL remains the
content source and every resulting record is editable through the existing Admin.

From the backend directory, preview the plan:

```sh
node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/import-projects.ts imports/github-projects.json
```

Apply it explicitly:

```sh
node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/import-projects.ts imports/github-projects.json --apply
```

The importer validates the manifest with the existing project schema, matches by
slug, normalized title or repository URL, and refuses ambiguous matches before
writing. It fills missing fields and retains curated descriptions, media and
optional facts. Conflicting retained fields are listed in the plan for review.
Title, requested order and featured selection are intentional updates. Existing
public publication states are retained; private-source imports are always drafts
and have no source link. Newly imported records are drafts.

The seven requested records occupy positions 1–7. Unrelated records are retained,
appended in their previous relative order, and unfeatured so they cannot displace
the requested featured trio. Their other content and publication states stay
unchanged. Subsequent import runs continue to enforce these ordering decisions.

Before applying, the runner saves the existing project records under ignored
`.local/imports/`. This is a project-record snapshot, not a full database/media
backup or an automatic restore procedure. Writes use `saveContent`, its media
reference validation/lock and optimistic versions. Changes are audited. Concurrent
import runners are serialized; a concurrent Admin edit can still produce a version
conflict. An interrupted run can be reviewed and rerun without duplicate records;
the whole import is not one transaction. No schema or API changes are required.

## Publication review

The owner selected draft import for projects without suitable screenshots. No
images were imported and no fictional screenshots were generated. The current
schema requires a managed cover image before publication. Upload approved covers
through Admin; the existing storage abstraction validates and re-encodes them.
All seven also need an editorial pass before publication. In particular, private
source summaries require the owner's explicit public-content review.

| Order | Project | Repository identification | Evidence and boundaries | Media / demo review |
| --- | --- | --- | --- | --- |
| 1 | Jenga | Private `Jenga`, not public `Jenga-Legal` | Construction project UI, TypeScript/React/Express/PostgreSQL manifests, backend sync contracts and mobile API documentation. No customer, testimonial, deployment or separate-mobile-implementation claims imported. | Private assets not imported. Documented landing returned 404. |
| 2 | Jukwaa | Private `Jukwaa` | Current V2 README, architecture, strategy schema and execution service. Describes configuration approval and mock-only execution, not retired autonomous trading functionality. | Historical screenshots show a retired interface; current approved V2 images needed. No verified demo. |
| 3 | Companion | Private `Companion` | Metadata, React/Vite/Node/PostgreSQL manifests, deterministic task priority and queued cloud-sync source. Describes academic planning without personal educational or professional claims. | No private academic documents, schedules, credentials or assets imported. No verified demo. |
| 4 | Smart Inventory System | Public `StealthyScripter/smart-inventory-system` | Rails/SQLite manifests, inventory controller and stock movement model. README scope differs from broader routes; case study is restricted to verified inventory operations. | No suitable screenshots found. Repository homepage returned 404 and was omitted. |
| 5 | PesaFlow | Public `StealthyScripter/PesaFlow` | Next.js/Express/Mongoose manifests, account/transaction services, transaction schema and auth routes. README auth limitations are stale; no production/security claims imported. | No suitable screenshots or verified live demo found. |
| 6 | WiBuddy | Public `StealthyScripter/WiBuddy` | Angular routes, Flask task services and provider-backed study endpoints. Provider functionality is described as configuration-dependent and was not run. | Candidate images inspected: small icons, not screenshots. No verified demo. |
| 7 | Sauti Tamu | Public `StealthyScripter/Sauti-tamu` | Expo/React Native manifests and call lifecycle/notification source. README calls it SmartConnect AI; preferred display name follows the request. No cost-saving metrics, AI routing or production claims imported. | No authentic product screenshots or verified demo found. Naming needs review. |

Source revision identifiers and file evidence are recorded in the manifest, outside
the public content payload. Raw research clones and extracted private files remain
in ignored `.tools/github-import/` and are never frontend assets.

## Verification commands

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

The backend regression test uses a disposable PostgreSQL database and checks repeat
imports, private draft filtering, duplicate detection, order, featured selection,
and curated-field/media preservation.

The Admin import browser test requires the separate disposable fixture. In
PowerShell from `personal-website-admin`:

```powershell
$env:PORTFOLIO_IMPORT_FIXTURE = '1'
# Optional: set PLAYWRIGHT_CHROMIUM_EXECUTABLE to an installed Chromium executable.
npx --no-install playwright test tests/imported-projects.spec.ts
```

This fixture uses the actual importer against its temporary database. Its browser
test uploads test-only covers and publishes test copies to verify all seven routes,
featured and expanded-list order, Admin edits/reordering/unpublish/delete, private
source-link omission and responsive rendering. These test publications are not
approval or publication of the real portfolio records.

### Results from this import

- Actual local database: seven new drafts at orders 1–7; three existing records
  retained at orders 8–10, with only order/featured fields changed.
- Rerun plan: all ten records unchanged. Backend tests also applied a second
  import and verified that IDs, versions and content stayed unchanged.
- All seven actual public detail routes returned 404 while in draft. Public API
  still returned the original three published projects; unauthenticated Admin
  access returned 401. No cover/gallery assets were added to the actual records.
- Backend typecheck, lint, build and PostgreSQL suite: passed (13 reported tests).
- Admin typecheck, lint and build: passed.
- Isolated imported-project browser workflow: passed. Verified seven detail
  routes after test-only publication, featured/expanded-list order, technologies,
  features, image alt text, private source-link omission, edits, order changes,
  unpublication, deletion, and no overflow at 375px/1440px. No browser exceptions
  were observed.
- Runs used installed Node 24 and existing Chromium. Project guidance recommends
  Node 20. Source repositories themselves were inspected, not built or tested.
- No database schema, public UI or Admin application implementation changed.
  No Docker volumes were modified and no Git commits or pushes were made.
