import { Either, left, right } from "@/core/either";
import { Order } from "@/domain/order/enterprise/entities/order";
import { IOrderRepository } from "@/domain/order/application/repositories/i-order-repository";
import { OrderItem } from "@/domain/order/enterprise/entities/order-item";

export class InMemoryOrderRepository implements IOrderRepository {
    public orders: Order[] = [];

    async create(order: Order): Promise<Either<Error, void>> {
        this.orders.push(order);
        return right(undefined);
    }

    async listOrdersByUserId(userId: string): Promise<Either<Error, Order[]>> {
        const userOrders = this.orders.filter(
            (order) => order.userId === userId
        );

        if (!userOrders.length) {
            return left(new Error("Orders not found for the given user id"));
        }

        return right(userOrders);
    }

    async listAllOrders(): Promise<Either<Error, Order[]>> {
        if (!this.orders.length) {
            return left(new Error("No orders found"));
        }
        return right(this.orders);
    }

    async findOrderById(orderId: string): Promise<Either<Error, Order>> {
        const order = this.orders.find(
            (order) => order.id.toString() === orderId
        );

        if (!order) {
            return left(new Error("Order not found"));
        }

        return right(order);
    }
}
