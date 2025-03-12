import { Either, left, right } from "@/core/either";
import { IOrderRepository } from "../repositories/i-order-repository";
import { Order } from "../../enterprise/entities/order";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ListOrdersByUserUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async execute(userId: string): Promise<Either<Error, Order[]>> {
        const result = await this.orderRepository.listOrdersByUserId(userId);
        return result;
    }
}
