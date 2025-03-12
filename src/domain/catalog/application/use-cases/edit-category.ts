import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { Injectable } from "@nestjs/common";
import { Category } from "../../enterprise/entities/category";

import { ICategoryRepository } from "../repositories/i-category-repository";

interface EditCategoryUseCaseRequest {
    categoryId: string;
    name: string;
    imageUrl: string;
}

type EditCategoryUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        category: Category;
    }
>;

@Injectable()
export class EditCategoryUseCase {
    constructor(private categoryRepository: ICategoryRepository) {}

    async execute({
        categoryId,
        name,
        imageUrl,
    }: EditCategoryUseCaseRequest): Promise<EditCategoryUseCaseResponse> {
        const categoryResult =
            await this.categoryRepository.findById(categoryId);

        if (categoryResult.isLeft()) {
            return left(new ResourceNotFoundError("Category not found"));
        }

        const category = categoryResult.value;
        category.name = name;
        category.imageUrl = imageUrl;

        const saveResult = await this.categoryRepository.save(category);

        if (saveResult.isLeft()) {
            return left(new ResourceNotFoundError("Failed to update category"));
        }

        return right({
            category,
        });
    }
}
