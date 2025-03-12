import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { Either, left, right } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { IProductRepository } from "../repositories/i-product-repository";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { ProductCategory } from "../../enterprise/entities/product-category";
import { ICategoryRepository } from "../repositories/i-category-repository";
import { IProductCategoryRepository } from "../repositories/i-product-category-repository";

interface ProductCategoryUseCaseRequest {
    categoryId: string;
    productId: string;
}

type ProductCategoryUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        productCategory: ProductCategory;
    }
>;

@Injectable()
export class CreateProductCategoryUseCase {
    constructor(
        private productRepository: IProductRepository,
        private categoryRepository: ICategoryRepository,
        private productCategoryRepository: IProductCategoryRepository
    ) {}

    async execute({
        categoryId,
        productId,
    }: ProductCategoryUseCaseRequest): Promise<ProductCategoryUseCaseResponse> {
        const product = await this.productRepository.findById(productId);

        if (!product) {
            return left(new ResourceNotFoundError());
        }
        const category = await this.categoryRepository.findById(categoryId);

        if (!category) {
            return left(new ResourceNotFoundError());
        }

        const productCategory = ProductCategory.create({
            categoryId: new UniqueEntityID(categoryId),
            productId: new UniqueEntityID(productId),
        });

        await this.productCategoryRepository.create(categoryId, productId);

        return right({
            productCategory,
        });
    }
}
