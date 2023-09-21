BEGIN;

DROP TABLE IF EXISTS sales_sessions CASCADE;
CREATE TABLE IF NOT EXISTS sales_sessions (
    id SERIAL PRIMARY KEY,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    session_duration INTEGER NOT NULL,
    order_id TEXT,
    partially_sold_enabled BOOLEAN NOT NULL DEFAULT FALSE, 
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "sales_sessions"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();




COMMIT;