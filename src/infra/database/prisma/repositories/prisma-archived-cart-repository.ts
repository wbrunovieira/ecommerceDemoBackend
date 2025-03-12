import { Either, left, right } from "@/core/either";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ArchivedCart } from "@/domain/order/enterprise/entities/archived-cart";
import { IArchivedCartRepository } from "@/domain/order/application/repositories/i-archived-cart";

@Injectable()
export class PrismaArchivedCartRepository implements IArchivedCartRepository {
    constructor(private prisma: PrismaService) {}

    async archive(cart: ArchivedCart): Promise<Either<Error, void>> {
        try {
            const cartData = cart.toObject();

            console.log("PrismaArchivedCartRepository cartData", cartData);
            console.log(
                "PrismaArchivedCartRepository cartData.id",
                cartData.id
            );

            const cartArchievd = await this.prisma.archivedCart.create({
                data: {
                    id: cartData.id.toString(),
                    userId: cartData.userId,
                    cartId: cartData.id,
                    paymentIntentId: cartData.paymentIntentId,
                    paymentStatus: cartData.paymentStatus,
                    collection_id: cartData.collection_id,
                    merchant_order_id: cartData.merchant_order_id,
                    archivedAt: new Date(),
                    items: {
                        create: cartData.items.map((item) => ({
                            id: item.id?.toString(),
                            productName: item.productName,
                            imageUrl: item.imageUrl,
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            height: item.height,
                            width: item.width,
                            length: item.length,
                            weight: item.weight,
                            colorId: item.colorId?.toString(),
                            sizeId: item.sizeId?.toString(),
                            hasVariants: item.hasVariants,
                        })),
                    },
                },
            });

            console.log(
                "PrismaArchivedCartRepository cartArchievd",
                cartArchievd
            );

            return right(undefined);
        } catch (error) {
            console.error("Failed to archive cart:", error);
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "P2025") {
                    return left(new Error("Cart not found"));
                }
            }
            return left(new Error("Failed to archive cart"));
        }
    }
}
