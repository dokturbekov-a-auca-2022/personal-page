CREATE TABLE IF NOT EXISTS mm_content (
 id integer PRIMARY KEY CHECK (id=1), version integer NOT NULL DEFAULT 1,
 draft jsonb NOT NULL, published jsonb NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS mm_editors (
 email text PRIMARY KEY CHECK(email=lower(email)), role text NOT NULL CHECK(role IN ('owner','editor')),
 active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS mm_history (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, version integer NOT NULL,
 action text NOT NULL, actor text NOT NULL, document jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS mm_media (
 id uuid PRIMARY KEY, data bytea NOT NULL, type text NOT NULL, alt text NOT NULL,
 created_by text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
