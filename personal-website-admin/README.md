# Personal website Admin

Independent React/Vite/TypeScript application. It consumes only the backend API and contains no database credentials. There is no signup, password recovery or account-management UI. Create/enable/reset accounts using the backend CLI.

## Run

Use Node 20.20.2. From this directory:

```sh
npm ci
cp .env.example .env
npm run dev
```

VITE_API_URL defaults to http://localhost:4000. Open http://localhost:5173. Start the backend and migrate/seed first. Use localhost consistently for browser origins. Login is a server-enforced HttpOnly session; CSRF tokens stay in memory. Expired sessions return to login.

Projects and notes support draft/publish, previews, ordered screenshots, media uploads, captions, optional sections, and deletion with confirmation. The editor keeps form values on failure and displays stale-version conflicts. Currently manages all four slots. Inbox supports read/unread/archive. Media rejects deletion while referenced by content. Settings edits safe public copy only. Enter truthful content; optional project facts can remain absent.

## Build/deploy

```sh
npm run typecheck
npm run lint
npm run build
npm run preview
```

Serve dist/ behind HTTPS. Set VITE_API_URL **before building**. Admin and API must be on same-site subdomains to use the backend's SameSite=Strict cookie policy. Configure the exact ADMIN_ORIGIN on the backend. The static Admin site itself contains no privileged content; every data endpoint independently authenticates. robots.txt and page metadata discourage indexing but are not security controls. The public website does not link here.

## Three-app browser verification

Install dependencies in all three apps and start the backend's local PostgreSQL helper. Its .env database user needs CREATEDB. Install Playwright Chromium (`npx playwright install chromium`) or set PLAYWRIGHT_CHROMIUM_EXECUTABLE to an existing compatible executable.

```sh
npx playwright test
```

This starts a disposable PostgreSQL-backed API on 4100, V4 on 3100 and Admin on 5183. No React/JSON edits seed the tested editor workflows. Random test credentials are written only under the ignored backend .local directory. Tests cover project publishing/edit/unpublish, cover/screenshots/reordering/gallery/features/collaboration, original/external notes, Currently, contact-to-inbox, signout, and six responsive widths in both themes.

The V4 build directory for this suite is .next-integration, separate from normal builds. On Windows, force-stopping the suite can bypass process signal cleanup. Run `npm run test:cleanup` in the backend directory after the suite; it removes only inactive databases with the integration suite's random-name format. Never delete the configured portfolio database. Test output and screenshots are ignored.
