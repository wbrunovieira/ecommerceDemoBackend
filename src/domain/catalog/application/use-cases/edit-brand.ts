import { Brand } from "../../enterprise/entities/brand";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { Injectable } from "@nestjs/common";
import { IBrandRepository } from "../repositories/i-brand-repository";

interface EditBrandUseCaseRequest {
    brandId: string;
    name: string;
    imageUrl: string;
}

type EditBrandUseCaseResponse = Either<ResourceNotFoundError, { brand: Brand }>;

@Injectable()
export class EditBrandUseCase {
    constructor(private brandsRepository: IBrandRepository) {}

    async execute({
        brandId,
        name,
        imageUrl,
    }: EditBrandUseCaseRequest): Promise<EditBrandUseCaseResponse> {
        const brandResult = await this.brandsRepository.findById(brandId);

        if (brandResult.isLeft()) {
            return left(new ResourceNotFoundError("Brand not found"));
        }

        const brand = brandResult.value;
        brand.name = name;
        brand.imageUrl = imageUrl;
        const saveResult = await this.brandsRepository.save(brand);

        if (saveResult.isLeft()) {
            return left(new ResourceNotFoundError("Failed to update brand"));
        }

        return right({
            brand,
        });
    }
}
