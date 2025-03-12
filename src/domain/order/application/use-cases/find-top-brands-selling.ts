import { Either, left, right } from "@/core/either";
import { IOrderRepository } from "@/domain/order/application/repositories/i-order-repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FindTopSellingBrandsByTotalValueUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async execute(): Promise<Either<Error, any>> {
        try {
            const result =
                await this.orderRepository.findTopSellingBrandsByTotalValue();
            if (result.isLeft()) {
                return left(result.value);
            }
            return right(result.value);
        } catch (error) {
            console.error(
                "Error fetching top selling brands by total value:",
                error
            );
            return left(
                new Error("Failed to fetch top selling brands by total value")
            );
        }
    }
}
