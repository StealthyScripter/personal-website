# Repository context for coding agents

## Scope and active application

V4 integration now also includes three independent apps: `personal-website-v4/`
(server-rendered Next.js public site), `personal-website-admin/` (Vite admin), and
`personal-website-backend/` (Fastify/PostgreSQL). For V4 work, use their own READMEs,
manifests and the nested V4 AGENTS.md. The V3/static-export guidance below applies
only to historical V3 work. Do not copy V4 content back into local JSON or expose
account management through the web. See INTEGRATION-REPORT.md for verification.

This repository contains Brian Wendot's personal portfolio in three versions.
Work in `personal-website-v3/` by default unless the task names another version.
`personal-website-v1/` is the original HTML/CSS/JavaScript site;
`personal-website-v2/` is an earlier Next.js implementation. Preserve these
historical versions unless the requested change concerns them.

There is no root application package or npm workspace. Run application commands
inside `personal-website-v3/`; its package manifest and lockfile are authoritative.
The v2 package name also says v3, so identify applications by directory.

## Stack and source map

The active app uses Next.js 14 App Router, React 18, strict TypeScript, and custom
CSS. The `@/*` import alias maps to `src/*`.

Paths below are relative to `personal-website-v3/`:

- `src/app/page.tsx`: single-page composition: navigation, hero, about, skills,
  experience, projects, contact, footer, and animated background.
- `src/app/layout.tsx`: global CSS imports, Inter and JetBrains Mono fonts,
  metadata, and Google Analytics.
- `src/components/`: page sections and interactive components.
- `src/components/ui/`: existing reusable UI primitives; inspect before adding
  equivalent components.
- `src/hooks/useReveal.ts`: IntersectionObserver scroll-reveal hooks.
- `src/services/FetchData.ts`: static skills, projects, social links, and
  experience data. Despite its name, this file does not fetch a remote API.
  Some profile and contact content also lives directly in components.
- `src/styles/globals.css`: design tokens, layout, component styles, responsive
  rules, and reduced-motion styles.
- `src/styles/index.css`: small shared styling helpers.
- `public/`: project images, resume PDF, favicon, and custom-domain `CNAME`.

## Working conventions

- Follow the surrounding TypeScript and React conventions. Keep changes focused
  on the request and avoid unrelated formatting or dependency upgrades.
- Preserve the dark developer-console design unless a redesign is requested:
  cyan/coral/teal/indigo accents, monospace details, floating navigation, code
  editor and terminal motifs, and animated canvas elements.
- Reuse CSS variables and existing classes. Styling is primarily plain CSS even
  though Tailwind packages and a PostCSS plugin are present.
- Keep browser APIs and interactive state in client components. Access browser
  globals in appropriate effects or event handlers, and clean up observers,
  listeners, timers, and animation frames when adding them.
- Preserve section IDs used by navigation, responsive behavior, semantic markup,
  keyboard access, form labels, and reduced-motion support.
- Preserve factual portfolio content, external links, resume paths, metadata,
  and domain settings unless the task calls for changing them. Do not invent
  biographical details or project claims.
- The contact form opens a `mailto:` URL in the user's email client; it has no
  delivery backend. Do not describe this interaction as confirmed email delivery.

## Local commands and validation

Use Node.js 20 to match CI and npm with the app's committed lockfile:

```sh
cd personal-website-v3
npm ci
npm run dev
```

The default local address is `http://localhost:3000`. For the existing Replit
development setup, use `npm run dev -- -H 0.0.0.0 -p 5000`.

For relevant code changes, run from the application directory:

```sh
npx --no-install tsc --noEmit
npm run lint
npm run build
```

There is no configured automated test suite or test script. For UI changes,
also check the affected interactions at desktop and mobile sizes, navigation,
asset links, and browser console errors. Documentation-only changes need review
and a whitespace/diff check, not an application build.

Tooling caveats: the lint script uses `next lint`, while the repository contains
an `eslint.config.mjs` flat configuration. If lint fails or prompts for setup,
report the actual result and investigate compatibility rather than treating it
as a passing check. Font loading through `next/font/google` may require network
access during builds. Distinguish environment or existing configuration failures
from regressions introduced by the change.

## Build and deployment constraints

`next.config.mjs` sets `output: 'export'` and `images.unoptimized: true`.
Production output is the static `personal-website-v3/out/` directory. Keep
features compatible with static hosting; a runtime server dependency requires
an intentional deployment change. The existing `npm run start` script invokes
`next start` and is not the preview command for the static export; preview `out/`
with a static file server when needed.

`.github/workflows/nextjs.yml` builds v3 with Node.js 20 and npm ci, then deploys
`out/` to GitHub Pages on pushes to `main` or manual workflow dispatch.

The generated app README is generic. `replit.md` supplies useful design history,
but its server-deployment notes differ from the current static-export config.
`.replit` starts v3 for development but still names v2 in its deployment commands.
Use the actual app config and GitHub workflow for the current Pages deployment;
inspect these discrepancies before doing Replit deployment work.

Do not commit generated `node_modules/`, `.next/`, `out/`, or TypeScript build
artifacts. Keep intentional dependency changes and the app lockfile in sync.
Before editing, inspect git status and preserve unrelated user changes. When
finishing, summarize changes, checks performed, and any unresolved limitations.
