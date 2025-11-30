-- Add SKU column to products and backfill existing rows
ALTER TABLE "Producto" ADD COLUMN "sku" TEXT;

UPDATE "Producto"
SET "sku" = CONCAT('SKU-', "id")
WHERE "sku" IS NULL;

ALTER TABLE "Producto" ALTER COLUMN "sku" SET NOT NULL;

CREATE UNIQUE INDEX "Producto_sku_key" ON "Producto"("sku");
