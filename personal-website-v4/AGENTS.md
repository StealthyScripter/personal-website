# V4 context

This is the independent V4 application requested by the owner. V1, V2, and V3
remain historical versions. Run commands here, not at the repository root.

Read README.md for architecture and the complete authoring schema. The active
design here is warm, calm, project-focused, and mostly plain CSS. Root guidance
about the V3 console theme does not apply to this intentionally new design.

Use Node 20. `npm ci`, `npx --no-install tsc --noEmit`, `npm run lint`, `npm test`,
and `npm run build` are the basic checks. See README.md for browser suites.
The three-app browser suite lives in ../personal-website-admin/ and uses its own
disposable database and .next-integration directory.

Projects, notes, Currently and settings come from the independent backend through
server-side cache:no-store requests. PostgreSQL is authoritative. Never add a JSON
fallback. Backend seed snapshots are historical imports, not runtime data. Keep
published-only API filtering, server rendering, true missing-content 404 responses,
and rich schema validation. Missing facts stay absent; example notes stay drafts.

Public content is edited through the separate Admin. src/content/site.ts holds only
deployment identity/default metadata. Preserve the approved geometric W mark in
public/brand and semantic theme tokens. Never invent biographical/project claims.
Contact messages persist through the backend; successful submission is not email
delivery. Account management remains backend CLI-only.

Deployment is still wired to V3. Do not switch the live site as an incidental
part of a V4 code change.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
