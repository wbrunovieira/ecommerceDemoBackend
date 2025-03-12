import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ICartRepository } from "../repositories/i-cart-repository";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface DeleteCartUseCaseRequest {
    cartId: string;
}

type DeleteCartUseCaseResponse = Either<
    ResourceNotFoundError | Error,
    {
        success: boolean;
    }
>;

@Injectable()
export class DeleteCartUseCase {
    constructor(private cartRepository: ICartRepository) {}

    async execute({
        cartId,
    }: DeleteCartUseCaseRequest): Promise<DeleteCartUseCaseResponse> {
        try {
            console.log("Attempting to delete cart with ID:", cartId);

            const cartResult = await this.cartRepository.findById(cartId);

            if (cartResult.isLeft()) {
                return left(new ResourceNotFoundError("Cart not found"));
            }

            const deleteResult =
                await this.cartRepository.deleteCartById(cartId);

            if (deleteResult.isLeft()) {
                return left(new Error("Failed to delete cart"));
            }

            console.log("Cart deleted successfully:", cartId);
            return right({ success: true });
        } catch (error) {
            console.error("Error deleting cart:", error);
            return left(error as Error);
        }
    }
}
