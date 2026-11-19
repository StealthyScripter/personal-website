#!/usr/bin/env bash
set -Eeuo pipefail

(
    cd personal-website-backend
    # The suites read a dotenv file, with the disposable database supplied by Docker.
    touch .env
    npm run lint
    npm run typecheck
    npm test
)
(
    cd personal-website-v4
    npm run lint
    npm test
)
unset NODE_ENV
(
    cd personal-website-admin
    npm run lint
    npm run test:browser
    PORTFOLIO_IMPORT_FIXTURE=1 npm run test:browser -- imported-projects.spec.ts
)

pushd personal-website-backend >/dev/null
node --import tsx --env-file=.env scripts/browser-fixture.ts &
fixture_pid=$!
popd >/dev/null
pushd personal-website-v4 >/dev/null
BACKEND_URL=http://localhost:4100 NEXT_PUBLIC_API_URL=http://localhost:4100 \
    node node_modules/next/dist/bin/next dev -p 3100 &
site_pid=$!
trap 'kill "$site_pid" "$fixture_pid" 2>/dev/null || true' EXIT
node --input-type=module <<'JS'
for (const url of ['http://localhost:4100/health', 'http://localhost:3100/']) {
    let ready = false;
    for (let attempt = 0; attempt < 90 && !ready; attempt++) {
        try { ready = (await fetch(url, { signal: AbortSignal.timeout(4000) })).ok; } catch {}
        if (!ready) await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!ready) throw new Error(`Browser fixture failed to start at ${url}`);
}
JS
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_API_URL=http://localhost:4100 npm run test:browser
