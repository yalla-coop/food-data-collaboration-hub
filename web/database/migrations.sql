alter table sales_sessions add creator_refresh_token TEXT;

BEGIN;

DROP TABLE IF EXISTS producer_order_lines CASCADE;
CREATE TABLE IF NOT EXISTS producer_order_lines (
    id SERIAL PRIMARY KEY,
    "sales_session_id" BIGINT NOT NULL,
    "producer_order_line_id" BIGINT NOT NULL,
    "producer_product_id" BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT sales_session_id_line_id UNIQUE (sales_session_id, producer_order_line_id)
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "producer_order_lines"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMIT;