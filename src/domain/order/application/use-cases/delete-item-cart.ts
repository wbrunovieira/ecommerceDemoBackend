import { Either, left, right } from "@/core/either";
import { ICartRepository } from "../repositories/i-cart-repository";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface DeleteItemFromCartRequest {
    cartId: string;
    itemId: string;
}

type DeleteItemFromCartResponse = Either<ResourceNotFoundError, void>;

@Injectable()
export class DeleteItemFromCartUseCase {
    constructor(private cartRepository: ICartRepository) {}

    async execute({
        cartId,
        itemId,
    }: DeleteItemFromCartRequest): Promise<DeleteItemFromCartResponse> {
        console.log("chamou delete cart id use case");
        console.log("chamou delete cart id use case cartId", cartId);
        console.log("chamou delete cart id use case itemId", itemId);
        const cartResult = await this.cartRepository.findById(cartId);
        console.log("chamou delete cart id use case cartResult", cartResult);

        if (cartResult.isLeft()) {
            return left(new ResourceNotFoundError("Cart not found"));
        }

        const cart = cartResult.value;
        console.log("chamou delete cart id use case cart", cart);

        const itemExists = cart.items.some(
            (item) => item.id.toString() === itemId
        );
        console.log("chamou delete cart id use case itemExists", itemExists);

        if (!itemExists) {
            return left(new ResourceNotFoundError("Item not found in cart"));
        }

        const result = await this.cartRepository.removeItemFromCart(
            cartId,
            itemId
        );
        console.log("chamou delete cart id use case result", result);

        if (result.isLeft()) {
            return left(new Error("Failed to remove item from cart"));
        }

        return right(undefined);
    }
}
