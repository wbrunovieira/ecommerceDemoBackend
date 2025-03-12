import { Either, left, right } from "@/core/either";
import { IOrderRepository } from "@/domain/order/application/repositories/i-order-repository";
import { Order } from "@/domain/order/enterprise/entities/order";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FindOrderByIdUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async execute(orderId: string): Promise<Either<Error, Order>> {
        const result = await this.orderRepository.findOrderById(orderId);
        return result;
    }
}
