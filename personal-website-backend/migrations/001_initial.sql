CREATE TABLE admin_users (
  id uuid PRIMARY KEY, email text NOT NULL UNIQUE, password_hash text NOT NULL,
  enabled boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE admin_sessions (
  token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_expiry ON admin_sessions(expires_at);
CREATE TABLE content_items (
  id uuid PRIMARY KEY, kind text NOT NULL CHECK (kind IN ('project','note','currently')),
  content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object'),
  slug text GENERATED ALWAYS AS (coalesce(content->>'slug', content->>'label')) STORED,
  published boolean GENERATED ALWAYS AS (coalesce((content->>'published')::boolean, (content->>'visible')::boolean, false)) STORED,
  sort_order integer GENERATED ALWAYS AS (coalesce((content->>'order')::integer, 100)) STORED,
  version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(kind, slug)
);
CREATE INDEX content_public_order ON content_items(kind, published, sort_order);
CREATE TABLE messages (
  id uuid PRIMARY KEY, name text NOT NULL, email text NOT NULL, subject text,
  message text NOT NULL, status text NOT NULL DEFAULT 'unread' CHECK(status IN ('unread','read','archived')),
  created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz
);
CREATE INDEX messages_inbox ON messages(status, created_at DESC);
CREATE TABLE media_assets (
  id uuid PRIMARY KEY, storage_key text NOT NULL UNIQUE, mime_type text NOT NULL,
  bytes integer NOT NULL CHECK(bytes > 0), width integer, height integer,
  original_name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE site_settings (
  id integer PRIMARY KEY CHECK(id = 1), content jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rate_limits (
  key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE INDEX rate_limits_expiry ON rate_limits(expires_at);
CREATE TABLE audit_events (
  id uuid PRIMARY KEY, actor_id uuid, action text NOT NULL, entity_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
