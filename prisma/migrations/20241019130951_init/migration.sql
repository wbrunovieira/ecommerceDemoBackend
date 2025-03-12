-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cartId" TEXT;
