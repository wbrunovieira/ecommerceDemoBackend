import { Either, left, right } from "@/core/either";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { Injectable } from "@nestjs/common";
import { IBrandRepository } from "../repositories/i-brand-repository";

interface DeleteBrandUseCaseRequest {
    brandId: string;
}

type DeleteBrandUseCaseResponse = Either<ResourceNotFoundError, {}>;

@Injectable()
export class DeleteBrandUseCase {
    constructor(private brandsRepository: IBrandRepository) {}

    async execute({
        brandId,
    }: DeleteBrandUseCaseRequest): Promise<DeleteBrandUseCaseResponse> {
        const brandResult = await this.brandsRepository.findById(brandId);

        if (brandResult.isLeft()) {
            return left(new ResourceNotFoundError("Brand not found"));
        }

        const brand = brandResult.value;

        await this.brandsRepository.delete(brand);

        return right({});
    }
}
