CREATE TABLE IF NOT EXISTS waitlist_subscribers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email = lower(btrim(email)) AND length(email) <= 254),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS waitlist_subscribers_created_at_idx
  ON waitlist_subscribers (created_at DESC, id DESC);
