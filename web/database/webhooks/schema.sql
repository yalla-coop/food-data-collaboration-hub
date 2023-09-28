BEGIN;
DROP TABLE IF EXISTS webhooks;
CREATE TABLE IF NOT EXISTS webhooks (
  "id" VARCHAR(255) NOT NULL UNIQUE,
  topic TEXT,
  data JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "webhooks"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE INDEX IF NOT EXISTS webhooks_id_idx ON webhooks (id);

COMMIT;