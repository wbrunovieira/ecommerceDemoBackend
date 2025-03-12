import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ICartRepository } from "../repositories/i-cart-repository";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { Cart } from "../../enterprise/entities/cart";

interface UpdateItemQuantityInCartUseCaseRequest {
    userId: string;
    itemId: string;
    quantity: number;
}

type UpdateItemQuantityInCartUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        cart: Cart;
    }
>;

@Injectable()
export class UpdateItemQuantityInCartUseCase {
    constructor(private cartRepository: ICartRepository) {}

    async execute({
        userId,
        itemId,
        quantity,
    }: UpdateItemQuantityInCartUseCaseRequest): Promise<UpdateItemQuantityInCartUseCaseResponse> {
        const cartOrError = await this.cartRepository.findCartByUser(userId);
        if (cartOrError.isLeft()) {
            return left(
                new ResourceNotFoundError(`Cart not found for user: ${userId}`)
            );
        }

        const cart = cartOrError.value;
        const itemIndex = cart.items.findIndex(
            (item) => item.id.toString() === itemId
        );
        if (itemIndex === -1) {
            return left(
                new ResourceNotFoundError(`Item not found in cart: ${itemId}`)
            );
        }

        const item = cart.items[itemIndex];
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            item.setQuantity(quantity);
        }

        const saveResult = await this.cartRepository.save(cart);
        if (saveResult.isLeft()) {
            return left(saveResult.value);
        }

        return right({ cart: saveResult.value });
    }
}
