# Brian Wendot — V4

Independent Next.js 16 App Router / React 19 / TypeScript public site. V1–V3 are untouched. V4 is now server-rendered and requires the separate backend; it is no longer a static export.

## Run

Use Node 20.20.2. From this directory:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Start personal-website-backend and its PostgreSQL database first; migrate and seed using that app's README. Default V4 address is http://localhost:3000.

BACKEND_URL is the server-to-server API origin. NEXT_PUBLIC_API_URL is the browser-visible API origin and is embedded at build time (contact and media). SITE_URL is the canonical public origin. Optional NEXT_PUBLIC_BASE_PATH supports a subpath. Backend PUBLIC_ORIGIN must match the browser origin exactly. No secret belongs in NEXT_PUBLIC_* variables.

## Data and rendering

Projects, notes, Currently and public settings come from PostgreSQL through the backend. Server components fetch with cache:no-store; React cache deduplicates within a render. There is no local JSON fallback or browser-only content loading. Published changes appear on the next request. Drafts are excluded by the API independently of the frontend.

The old project/note JSON has been removed from src/content after a verified import. Historical import snapshots and original preview images are intentionally retained under personal-website-backend/seed. src/content/site.ts contains only deployment identity and safe default metadata, not a content collection.

Homepage is one continuous page: Projects, Notes, About and Contact use anchors. Old landing-page URLs redirect to their homepage anchors. Project detail and original note pages are server-rendered; external notes link directly to their source. Rich optional sections render only when supplied. No fabricated statuses, links or biographical claims are added.

Missing unpublished content returns 404; metadata is resolved before streaming to preserve status codes. Homepage collection failures show a quiet unavailable message, and route errors offer retry. The contact form reports success only after backend persistence, preserves entries on failure and associates field errors with controls. It does not promise email delivery.

## Brand and interface

The supplied geometric W mark is reproduced in SVG, with sage on the left and cream/charcoal primary strokes. Header uses a compact decorative mark with an accessible Home link; footer selectively uses Brian Wendot Koringo. No filter inversion, constant motion or raster logo is used.

Assets in public/brand: logo-mark-dark/light.svg (background context in the name), logo-lockup-dark/light.svg, logo-mark-monochrome-dark/light.svg, social-preview.svg/png. Favicons in public/: favicon.svg, favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png. The SVG favicon adapts to OS theme; raster fallback uses a charcoal tile. Small icons retain the two strong diagonals. No web manifest is added because this is not an installable app.

Semantic CSS uses --brand-charcoal, --brand-sage, --brand-cream, --brand-sand, --brand-stone and --brand-mark-foreground. Existing paper/ink/surface/muted/green tokens remain the UI palette with accessible darker/lighter accents. Brand foreground changes via the root data-theme. Shared type scale: serif display/headings, sans body/UI, mono small metadata. Existing minimalist layout and native scrolling remain.

Regenerate committed brand assets with `node scripts/generate-brand.mjs` (Sharp development dependency). Generic social preview is used only when a project/note has no image; actual content images take precedence. Below-fold images are lazy; critical project cover is prioritized; video uses controls/preload=none with transcript and optional captions.

## Build/deploy

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

Deploy to a Next.js-capable Node host, not GitHub Pages. output:standalone is configured. With the standalone server, copy public/ and .next/static/ into the standalone output according to Next deployment documentation; alternatively npm start runs the standard production build. npm run preview starts it on 4173. Backend/media must remain reachable from the server and browser. Existing .github workflow still deploys V3 and was intentionally not switched.

The admin is a separately deployed application, not a public navigation destination. Recommended hosts are www.example.com, admin.example.com and api.example.com with managed PostgreSQL/private object storage.

Browser verification across all three apps lives in ../personal-website-admin/tests. Run `npm run test:browser` there as documented in its README; V4's own browser command can target a running public server through PLAYWRIGHT_BASE_URL. See ../INTEGRATION-REPORT.md for results and remaining production configuration.
