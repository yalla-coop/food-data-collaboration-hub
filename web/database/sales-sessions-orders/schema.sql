BEGIN;
DROP TABLE IF EXISTS sales_sessions_orders CASCADE;
CREATE TABLE IF NOT EXISTS sales_sessions_orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT,
    sales_session_id INTEGER NOT NULL REFERENCES sales_sessions (id) ON DELETE CASCADE,
    webhooks_id VARCHAR NOT NULL REFERENCES webhooks (id) ON DELETE CASCADE,
    status TEXT,
    order_type TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE
UPDATE ON "sales_sessions_orders" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
COMMIT;
