# Architecture decision and pre-change inventory

Before this iteration, V4 was an independent Next.js 16 / React 19 static export.
Projects and notes were filesystem JSON validated with Zod; Currently and site
copy lived in a TypeScript module. Navigation opened separate landing pages.
Contact opened an email client. There was no database, API, authentication, or
administration application. Themes used CSS variables and localStorage; fonts
were system serif/sans-serif stacks. Project detail components already supported
conditional galleries, video, features, and collaboration.

The existing CSS contains no custom scrollbar or right-hand sidebar. The new
attachment contained text only, not screenshots. The visible element cannot be
identified from that attachment. Normal browser scrolling stays in place; Next
development indicators will be disabled explicitly.

## Decisions

- Three independent applications, connected only over a documented HTTP API.
- Fastify TypeScript modular monolith, PostgreSQL, parameterized SQL repositories
  with explicit SQL migrations. JSONB stores validated rich project/note content;
  relational columns index identity, slug, publication state, and ordering.
  This small schema does not require an ORM or a microservice layer.
- Public V4 uses server rendering and uncached public API reads. Publishing or
  unpublishing takes effect without rebuilding and does not expose drafts via
  stale frontend caches. Backend errors have a deliberate public fallback UI.
- Separate React/Vite admin, cookie sessions, server-side access checks, Argon2id
  passwords, CSRF tokens, exact allowed origins, persistent rate-limit buckets.
  Account changes are CLI-only and invalidate existing sessions.
- Media uses a backend storage interface: persistent disk locally or private S3
  object storage. PostgreSQL stores metadata, never uploaded binaries. Media is
  publicly readable only when referenced by published content; otherwise an
  authorized admin session is required.
- V4 factual content is copied into a backend-owned seed snapshot. This is a
  one-time idempotent migration source, never a production fallback or an import
  from the V4 application. User-entered production content lives in PostgreSQL.

The previous static-export requirement is superseded by the explicit new brief.
Existing V1–V3 and the V3 deployment workflow remain untouched.
