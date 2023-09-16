BEGIN;
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  producer_product_id VARCHAR(255) NOT NULL,
  hub_product_id VARCHAR(255) NOT NULL,
  "updated_product_json_data" JSONB,
  is_updated_on_producer_side BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "products"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


COMMIT;