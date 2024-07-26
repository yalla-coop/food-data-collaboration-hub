BEGIN;

DROP TABLE IF EXISTS sales_sessions CASCADE;
CREATE TABLE IF NOT EXISTS sales_sessions (
    id SERIAL PRIMARY KEY,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    session_duration INTEGER NOT NULL,
    order_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    creator_user_id TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "sales_sessions"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();




COMMIT;