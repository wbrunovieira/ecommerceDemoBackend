import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { IBrandRepository } from "../repositories/i-brand-repository";
import { Brand } from "../../enterprise/entities/brand";
import { PaginationParams } from "@/core/repositories/pagination-params";

type GetAllBrandsUseCaseResponse = Either<Error, Brand[]>;

@Injectable()
export class GetAllBrandsUseCase {
    constructor(private brandsRepository: IBrandRepository) {}

    async execute(
        params: PaginationParams
    ): Promise<GetAllBrandsUseCaseResponse> {
        try {
            const brandsResult = await this.brandsRepository.findAll(params);
            if (brandsResult.isLeft()) {
                return left(new Error("Failed to find brands"));
            }
            return right(brandsResult.value);
        } catch (error) {
            return left(new Error("Repository error"));
        }
    }
}
