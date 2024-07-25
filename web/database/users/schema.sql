BEGIN;
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    refresh_token varchar,
    access_token varchar,
    access_token_expires_at BIGINT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE
UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
COMMIT;
