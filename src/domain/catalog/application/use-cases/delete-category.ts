import { Either, left, right } from "@/core/either";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { Injectable } from "@nestjs/common";

import { ICategoryRepository } from "../repositories/i-category-repository";

interface DeleteCategoryUseCaseRequest {
    categoryId: string;
}

type DeleteCategoryUseCaseResponse = Either<ResourceNotFoundError, {}>;

@Injectable()
export class DeleteCategoryUseCase {
    constructor(private categoryRepository: ICategoryRepository) {}

    async execute({
        categoryId,
    }: DeleteCategoryUseCaseRequest): Promise<DeleteCategoryUseCaseResponse> {
        const categoryResult =
            await this.categoryRepository.findById(categoryId);

        if (categoryResult.isLeft()) {
            return left(new ResourceNotFoundError("Category not found"));
        }

        const category = categoryResult.value;

        await this.categoryRepository.delete(category);

        return right({});
    }
}
