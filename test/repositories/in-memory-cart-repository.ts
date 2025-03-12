import { Either, right, left } from "@/core/either";
import { Cart } from "@/domain/order/enterprise/entities/cart";
import { ICartRepository } from "@/domain/order/application/repositories/i-cart-repository";

export class InMemoryCartRepository implements ICartRepository {
    private carts: Cart[] = [];

    async create(cart: Cart): Promise<Either<Error, void>> {
        this.carts.push(cart);
        return right(undefined);
    }
}
