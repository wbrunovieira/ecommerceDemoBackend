import { Brand } from "../../enterprise/entities/brand";
import { Either, left, right } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { IBrandRepository } from "../repositories/i-brand-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface CreateBrandUseCaseRequest {
    name: string;
    imageUrl: string;
    erpId: string;
}

type CreateBrandUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        brand: Brand;
    }
>;

@Injectable()
export class CreateBrandUseCase {
    constructor(private brandRepository: IBrandRepository) {}

    async execute({
        name,
        imageUrl,
        erpId,
    }: CreateBrandUseCaseRequest): Promise<CreateBrandUseCaseResponse> {
        try {
            const trimmedName = name.trim();
            const trimmedErpId = name.trim();
            if (!trimmedName || trimmedName.length === 0) {
                return left(
                    new ResourceNotFoundError("Brand name is required")
                );
            }

            if (trimmedName.length < 3) {
                return left(
                    new ResourceNotFoundError(
                        "Brand name must be at least 3 characters long"
                    )
                );
            }

            if (trimmedName.length > 50) {
                return left(
                    new ResourceNotFoundError(
                        "Brand name must be less than 50 characters long"
                    )
                );
            }

            const existingBrand =
                await this.brandRepository.findByName(trimmedName);
            if (existingBrand.isRight()) {
                return left(
                    new ResourceNotFoundError(
                        "Brand with this name already exists"
                    )
                );
            }
            const brand = Brand.create({
                name: trimmedName,
                imageUrl,
                erpId: trimmedErpId,
            });

            await this.brandRepository.create(brand);

            return right({
                brand,
            });
        } catch (error) {
            return left(error as Error);
        }
    }
}
