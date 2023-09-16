BEGIN;


DROP TYPE IF EXISTS "added_value_method";
CREATE TYPE "added_value_method" AS ENUM (
    'percentage',
    'fixed'
);


DROP TABLE IF EXISTS "variants" CASCADE;
CREATE TABLE IF NOT EXISTS "variants" (
    "id" SERIAL PRIMARY KEY,
    "producer_variant_id" TEXT NOT NULL,
    "hub_variant_id" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL REFERENCES "products" ("id") ON DELETE CASCADE,
    "price" DECIMAL(10, 2) NOT NULL,
    "original_price" DECIMAL(10, 2) NOT NULL,
    "added_value" DECIMAL(10, 2) NOT NULL,
    "added_value_method" "added_value_method" NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMIT;