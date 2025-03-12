import { Either, left, right } from "@/core/either";
import { IOrderRepository } from "@/domain/order/application/repositories/i-order-repository";
import { Order, OrderDTO } from "@/domain/order/enterprise/entities/order";
import { Injectable } from "@nestjs/common";

type ListAllOrdersResponse = Either<Error, OrderDTO[]>;

@Injectable()
export class ListAllOrdersUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async execute(): Promise<ListAllOrdersResponse> {
        return this.orderRepository.listAllOrders();
    }
}
