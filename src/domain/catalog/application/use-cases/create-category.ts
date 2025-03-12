import { Either, left, right } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { Category } from "../../enterprise/entities/category";

import { ICategoryRepository } from "../repositories/i-category-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface CreateCategoryUseCaseRequest {
    name: string;
    imageUrl: string;
    erpId: string;
}

type CreateCategoryUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        category: Category;
    }
>;
@Injectable()
export class CreateCategoryUseCase {
    constructor(private categoryRepository: ICategoryRepository) {}

    async execute({
        name,
        imageUrl,
        erpId,
    }: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
        try {
            const trimmedName = name.trim();
            if (!trimmedName || trimmedName.length === 0) {
                return left(
                    new ResourceNotFoundError("Category name is required")
                );
            }

            if (trimmedName.length < 3) {
                return left(
                    new ResourceNotFoundError(
                        "Category name must be at least 3 characters long"
                    )
                );
            }

            if (trimmedName.length > 20) {
                return left(
                    new ResourceNotFoundError(
                        "Category name must be less than 20 characters long"
                    )
                );
            }

            const existingCAtegory =
                await this.categoryRepository.findByName(trimmedName);
            if (existingCAtegory.isRight()) {
                return left(
                    new ResourceNotFoundError(
                        "Category with this name already exists"
                    )
                );
            }

            const category = Category.create({
                name: trimmedName,
                imageUrl,
                erpId,
            });

            await this.categoryRepository.create(category);

            return right({
                category,
            });
        } catch (error) {
            return left(error as Error);
        }
    }
}
