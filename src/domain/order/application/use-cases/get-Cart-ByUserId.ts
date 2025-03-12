import { Either, left, right } from "@/core/either";
import { ICartRepository } from "../repositories/i-cart-repository";
import { Injectable } from "@nestjs/common";
import { Cart } from "../../enterprise/entities/cart";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface GetCartByUserRequest {
    userId: string;
}

type GetCartByUserResponse = Either<ResourceNotFoundError, Cart>;

@Injectable()
export class GetCartByUserUseCase {
    constructor(private cartRepository: ICartRepository) {}

    async execute({
        userId,
    }: GetCartByUserRequest): Promise<GetCartByUserResponse> {
        const cartResult = await this.cartRepository.findCartByUser(userId);
        console.log("cartResult", cartResult);

        if (cartResult.isLeft()) {
            return left(new ResourceNotFoundError("Cart not found"));
        }
        console.log("cartResult.value", cartResult.value);

        return right(cartResult.value);
    }
}
