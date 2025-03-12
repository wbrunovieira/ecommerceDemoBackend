import { PrismaCartRepository } from "@/infra/database/prisma/repositories/prisma-cart-repository";
import { Injectable } from "@nestjs/common";
import { ICartRepository } from "../repositories/i-cart-repository";
import { Either } from "@/core/either";

@Injectable()
export class FindCartByPreferenceIdUseCase {
    constructor(private readonly cartRepository: ICartRepository) {}
    async execute(cartId) {
        let cart = await this.cartRepository.findById(cartId);

        return cart;
    }

    async savePreferenceId(
        cartId: string,
        preferenceId: string
    ): Promise<Either<Error, void>> {
        const preferenceIdCreated = await this.cartRepository.savePreferenceId(
            cartId,
            preferenceId,
            "pending"
        );
        console.log("preferenceIdCreated", preferenceIdCreated);
        return preferenceIdCreated;
    }

    async saveCollectionId(
        cartId: string,
        collection_id: string,
        merchant_order_id: string
    ): Promise<Either<Error, void>> {
        console.log(
            "saveCollectionId cartId, collection_id, merchant_order_id",
            cartId,
            collection_id,
            merchant_order_id
        );
        return await this.cartRepository.saveCollectionId(
            cartId,
            collection_id,
            merchant_order_id
        );
    }
}
