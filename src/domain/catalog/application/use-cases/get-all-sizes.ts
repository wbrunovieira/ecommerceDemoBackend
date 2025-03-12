import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { Size } from "../../enterprise/entities/size";
import { ISizeRepository } from "../repositories/i-size-repository";

type GetAllSizesUseCaseResponse = Either<Error, Size[]>;

@Injectable()
export class GetAllSizesUseCase {
    constructor(private sizeRepository: ISizeRepository) {}

    async execute(
        params: PaginationParams
    ): Promise<GetAllSizesUseCaseResponse> {
        try {
            const sizesResult = await this.sizeRepository.findAll(params);
            if (sizesResult.isLeft()) {
                return left(new Error("Failed to find sizes"));
            }
            return right(sizesResult.value);
        } catch (error) {
            return left(new Error("Repository error"));
        }
    }
}
