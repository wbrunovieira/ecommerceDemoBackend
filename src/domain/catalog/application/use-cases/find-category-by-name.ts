import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { Category } from "../../enterprise/entities/category";
import { ICategoryRepository } from "../repositories/i-category-repository";

interface FindCategoryByNameUseCaseRequest {
    name: string;
}

type FindCategoryByNameUseCaseResponse = Either<
    ResourceNotFoundError,
    { category: Category }
>;

@Injectable()
export class FindCategoryByNameUseCase {
    constructor(private categoryRepository: ICategoryRepository) {}

    async execute({
        name,
    }: FindCategoryByNameUseCaseRequest): Promise<FindCategoryByNameUseCaseResponse> {
        const categoryResult = await this.categoryRepository.findByName(name);

        if (categoryResult.isLeft()) {
            return left(new ResourceNotFoundError("Category not found"));
        }

        return right({
            category: categoryResult.value,
        });
    }
}
