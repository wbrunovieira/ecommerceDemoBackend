import { Either, left, right } from "@/core/either";
import { IOrderRepository } from "@/domain/order/application/repositories/i-order-repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FindOrdersByBrandUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async execute(brandId: string): Promise<Either<Error, any[]>> {
        try {
            const result =
                await this.orderRepository.findOrdersByBrand(brandId);

            if (result.isLeft()) {
                return left(result.value);
            }

            const orders = result.value;

            const cleanedOrders = orders.map((order) => ({
                id: order.id,
                userId: order.userId,
                items: order.items.map((item) => ({
                    id: item.id,
                    productId: item.productId,
                    productName: item.productName,
                    imageUrl: item.imageUrl,
                    quantity: item.quantity,
                    price: item.price,
                })),
                status: order.status,
                paymentId: order.paymentId || undefined,
                paymentStatus: order.paymentStatus || undefined,
                paymentMethod: order.paymentMethod || undefined,
                paymentDate: order.paymentDate || undefined,
            }));

            return right(cleanedOrders);
        } catch (error) {
            console.error("Error finding orders by brand:", error);
            return left(new Error("Failed to find orders by brand"));
        }
    }
}
