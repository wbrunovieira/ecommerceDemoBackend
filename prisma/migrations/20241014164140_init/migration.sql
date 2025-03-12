/*
  Warnings:

  - Added the required column `customerId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "brands" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isCustomer" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstOrderDate" TIMESTAMP(3),
    "customerSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_userId_key" ON "customer"("userId");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
