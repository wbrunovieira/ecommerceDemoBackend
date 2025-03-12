

CREATE OR REPLACE FUNCTION update_product_stock() RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM product_variants WHERE "productId" = NEW."productId") > 0 THEN
    UPDATE products
    SET stock = (
      SELECT COALESCE(SUM(stock), 0)
      FROM product_variants
      WHERE product_variants."productId" = NEW."productId"
    )
    WHERE id = NEW."productId";
  ELSE
    UPDATE products
    SET stock = products.stock
    WHERE id = NEW."productId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for INSERT
CREATE TRIGGER trigger_update_product_stock_insert
AFTER INSERT ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Trigger for UPDATE
CREATE TRIGGER trigger_update_product_stock_update
AFTER UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Trigger for DELETE
CREATE TRIGGER trigger_update_product_stock_delete
AFTER DELETE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();
