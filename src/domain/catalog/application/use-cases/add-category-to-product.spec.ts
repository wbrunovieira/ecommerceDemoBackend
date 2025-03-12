import { InMemoryProductRepository } from "@test/repositories/in-memory-product-repository";

import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { makeCategory } from "@test/factories/make-category";
import { Product } from "../../enterprise/entities/product";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { right, left } from "@/core/either";
import { AddCategoriesToProductUseCase } from "./add-category-to-product";
import { InMemoryProductCategoryRepository } from "@test/repositories/in-memory-product-category";
import { IProductVariantRepository } from "../repositories/i-product-variant-repository";
import { makeProduct } from "@test/factories/make-product";

describe("AddCategoriesToProductUseCase", () => {
    let addCategoriesToProductUseCase: AddCategoriesToProductUseCase;
    let mockProductRepository: InMemoryProductRepository;
    let mockCategoryRepository: InMemoryCategoryRepository;
    let mockProductCategoryRepository: InMemoryProductCategoryRepository;
    let variantRepository: IProductVariantRepository;

    let productId: UniqueEntityID;
    let categoryId: UniqueEntityID;
    let secondCategoryId: UniqueEntityID;

    beforeEach(() => {
        mockProductRepository = new InMemoryProductRepository(
            variantRepository
        );
        mockCategoryRepository = new InMemoryCategoryRepository();
        mockProductCategoryRepository = new InMemoryProductCategoryRepository();

        addCategoriesToProductUseCase = new AddCategoriesToProductUseCase(
            mockProductRepository,
            mockCategoryRepository,
            mockProductCategoryRepository
        );

        categoryId = new UniqueEntityID("test_category_id");
        secondCategoryId = new UniqueEntityID("second_category_id");

        const product1 = makeProduct();

        mockProductRepository.create(product1.product);

        const category = makeCategory({ name: "Test Category" }, categoryId);
        const secondCategory = makeCategory(
            { name: "Second Category" },
            secondCategoryId
        );

        mockCategoryRepository.create(category);
        mockCategoryRepository.create(secondCategory);
    });

    it("should add categories to an existing product", async () => {
        const product1 = mockProductRepository.items[0];
        console.log(
            "describe(AddCategoriesToProductUseCase product1",
            product1
        );

        const result = await addCategoriesToProductUseCase.execute({
            productId: product1.id.toString(),
            categories: [categoryId.toString(), secondCategoryId.toString()],
        });

        console.log(
            "describe(AddCategoriesToProductUseCase result",
            result.value
        );

        const updatedProduct = mockProductRepository.items.find(
            (item) => item.id.toString() === product1.id.toString()
        );
        console.log(
            "describe(AddCategoriesToProductUseCase updatedProduct",
            updatedProduct
        );

        expect(updatedProduct).toBeDefined();
        expect(updatedProduct?.productCategories).toHaveLength(2);

        const associatedCategoryIds = updatedProduct!.productCategories!.map(
            (c) => c.id.toString()
        );
        console.log(
            "describe(AddCategoriesToProductUseCase associatedCategoryIds",
            associatedCategoryIds
        );
        expect(associatedCategoryIds).toEqual(
            expect.arrayContaining([
                categoryId.toString(),
                secondCategoryId.toString(),
            ])
        );
    });

    it("should return an error if the product does not exist", async () => {
        const result = await addCategoriesToProductUseCase.execute({
            productId: "non_existing_product_id",
            categories: [categoryId.toString()],
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            expect(error).toBeInstanceOf(ResourceNotFoundError);
            expect(error?.message).toBe("Product not found");
        }
    });

    it("should return an error if a category does not exist", async () => {
        const invalidCategoryId = "invalid_category_id";
        const product1 = mockProductRepository.items[0];

        const result = await addCategoriesToProductUseCase.execute({
            productId: product1.id.toString(),
            categories: [invalidCategoryId],
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            expect(error).toBeInstanceOf(ResourceNotFoundError);
            expect(error?.message).toBe(
                `Category not found: ${invalidCategoryId}`
            );
        }
    });

    it("should not add duplicate categories", async () => {
        const product1 = mockProductRepository.items[0];
        const result = await addCategoriesToProductUseCase.execute({
            productId: product1.id.toString(),
            categories: [categoryId.toString(), categoryId.toString()],
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            expect(error).toBeInstanceOf(ResourceNotFoundError);
            expect(error?.message).toBe(
                `Duplicate category: ${categoryId.toString()}`
            );
        }
    });

    it("should handle a mix of valid and invalid categories", async () => {
        const product1 = mockProductRepository.items[0];
        const invalidCategoryId = "invalid_category_id";
        const result = await addCategoriesToProductUseCase.execute({
            productId: product1.id.toString(),
            categories: [categoryId.toString(), invalidCategoryId],
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            expect(error).toBeInstanceOf(ResourceNotFoundError);
            expect(error?.message).toBe(
                `Category not found: ${invalidCategoryId}`
            );
        }
    });
});
