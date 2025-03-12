import { Either, left, right } from "@/core/either";
import { Product } from "../../enterprise/entities/product";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { ICategoryRepository } from "../repositories/i-category-repository";
import { IProductCategoryRepository } from "../repositories/i-product-category-repository";
import { Injectable } from "@nestjs/common";

interface AddCategoriesToProductUseCaseRequest {
    productId: string;
    categories: string[];
}

type AddCategoriesToProductUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        product: Product;
    }
>;

@Injectable()
export class AddCategoriesToProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private categoryRepository: ICategoryRepository,
        private productCategoryRepository: IProductCategoryRepository
    ) {}

    async execute({
        productId,
        categories,
    }: AddCategoriesToProductUseCaseRequest): Promise<AddCategoriesToProductUseCaseResponse> {
        const productOrError = await this.productRepository.findById(productId);
        console.log(
            "AddCategoriesToProductUseCase productOrError",
            productOrError
        );

        if (productOrError.isLeft()) {
            return left(new ResourceNotFoundError("Product not found"));
        }

        const product = productOrError.value;

        const uniqueCategories = new Set<string>();
        console.log(
            "AddCategoriesToProductUseCase uniqueCategories new",
            uniqueCategories
        );

        for (const categoryId of categories) {
            console.log(
                "AddCategoriesToProductUseCase for (const categoryId of categories categoryId",
                categoryId
            );
            console.log(
                "AddCategoriesToProductUseCase for (const categoryId of categories uniqueCategories",
                uniqueCategories
            );
            const validCategoryId = Array.isArray(categoryId)
                ? categoryId[0]
                : categoryId;

            console.log(
                "AddCategoriesToProductUseCase for (const categoryId of categories validCategoryId",
                validCategoryId
            );

            if (!validCategoryId) {
                return left(new Error("InvalidCategoryError"));
            }

            if (uniqueCategories.has(validCategoryId)) {
                return left(
                    new ResourceNotFoundError(
                        `Duplicate category: ${validCategoryId}`
                    )
                );
            }

            uniqueCategories.add(validCategoryId);
            console.log(
                "AddCategoriesToProductUseCase uniqueCategories",
                uniqueCategories
            );

            const categoryExists =
                await this.categoryRepository.findById(validCategoryId);
            console.log(
                "AddCategoriesToProductUseCase categoryExists",
                categoryExists
            );
            if (categoryExists.isLeft()) {
                return left(
                    new ResourceNotFoundError(
                        `Category not found: ${validCategoryId}`
                    )
                );
            }
            product.addCategory(categoryExists.value);

            const createdCategoryProduct =
                await this.productCategoryRepository.create(
                    productId,
                    validCategoryId
                );

            console.log(
                "AddCategoriesToProductUseCase createdCategoryProduct",
                createdCategoryProduct
            );

            if (categoryExists.isLeft()) {
                return left(
                    new ResourceNotFoundError(
                        `Category not found: ${categoryId}`
                    )
                );
            }
        }

        try {
            console.log("AddCategoriesToProductUseCase product", product);

            const finalProduct = await this.productRepository.save(product);
            console.log(
                "AddCategoriesToProductUseCase finalProduct",
                finalProduct.value
            );

            return right({
                product,
            });
        } catch (error) {
            console.error("Error adding categories to product:", error);
            return left(new Error("Failed to add categories to product"));
        }
    }
}
