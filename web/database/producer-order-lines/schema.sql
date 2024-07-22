BEGIN;

DROP TABLE IF EXISTS producer_order_lines CASCADE;
CREATE TABLE IF NOT EXISTS producer_order_lines (
    id SERIAL PRIMARY KEY,
    "sales_session_id" BIGINT NOT NULL,
    "producer_order_line_id" BIGINT NOT NULL,
    "producer_product_id" BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "producer_order_lines"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMIT;