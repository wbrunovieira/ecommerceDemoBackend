import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { Category } from "../../enterprise/entities/category";
import { ICategoryRepository } from "../repositories/i-category-repository";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

type GetCategoriesWithProductsUseCaseResponse = Either<Error, Category[]>;

@Injectable()
export class GetCategoriesWithProductsUseCase {
    constructor(private categoryRepository: ICategoryRepository) {}

    async execute(
        params: PaginationParams
    ): Promise<GetCategoriesWithProductsUseCaseResponse> {
        try {
            const categoriesResult =
                await this.categoryRepository.findCategoriesWithProducts();

            if (categoriesResult.isLeft()) {
                return left(
                    new ResourceNotFoundError(
                        "No categories with products found"
                    )
                );
            }

            return right(categoriesResult.value);
        } catch (error) {
            return left(new Error("Repository error"));
        }
    }
}
