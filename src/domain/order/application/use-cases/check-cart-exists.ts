import { Either, left, right } from "@/core/either";
import { ICartRepository } from "../repositories/i-cart-repository";
import { Injectable } from "@nestjs/common";

interface CheckCartExistsRequest {
    userId: string;
}

type CheckCartExistsResponse = Either<Error, boolean>;

@Injectable()
export class CheckCartExistsUseCase {
    constructor(private cartRepository: ICartRepository) {}

    async execute({
        userId,
    }: CheckCartExistsRequest): Promise<CheckCartExistsResponse> {
        return this.cartRepository.cartExists(userId);
    }
}
