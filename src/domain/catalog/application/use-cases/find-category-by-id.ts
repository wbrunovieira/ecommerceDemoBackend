import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { Category } from "../../enterprise/entities/category";
import { ICategoryRepository } from "../repositories/i-category-repository";

interface FindCategoryByIdUseCaseRequest {
    id: string;
}

type FindCategoryByIdUseCaseResponse = Either<
    ResourceNotFoundError,
    { category: Category }
>;

@Injectable()
export class FindCategoryByIdUseCase {
    constructor(private categoryRepository: ICategoryRepository) {}

    async execute({
        id,
    }: FindCategoryByIdUseCaseRequest): Promise<FindCategoryByIdUseCaseResponse> {
        const categoryResult = await this.categoryRepository.findById(id);

        if (categoryResult.isLeft()) {
            return left(new ResourceNotFoundError("Category not found"));
        }

        return right({
            category: categoryResult.value,
        });
    }
}
