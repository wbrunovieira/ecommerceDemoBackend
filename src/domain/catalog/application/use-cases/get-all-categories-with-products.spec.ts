import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { makeCategory } from "@test/factories/make-category";

import { GetCategoriesWithProductsUseCase } from "./get-all-categories-with-product";
import { makeProductCategory } from "@test/factories/make-product-category";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

describe("GetCategoriesWithProductsUseCase", () => {
    let getCategoriesWithProductsUseCase: GetCategoriesWithProductsUseCase;
    let mockCategoryRepository: InMemoryCategoryRepository;
    let categoryId: UniqueEntityID;
    let productId: UniqueEntityID;

    beforeEach(() => {
        mockCategoryRepository = new InMemoryCategoryRepository();
        getCategoriesWithProductsUseCase = new GetCategoriesWithProductsUseCase(
            mockCategoryRepository
        );
        categoryId = new UniqueEntityID("test_category_id");
        productId = new UniqueEntityID("test_product_id");

        const existingCategory = makeCategory(
            {
                name: "Category with Products",
            },
            categoryId
        );

        const productCategory = makeProductCategory({
            productId: productId,
            categoryId: categoryId,
        });

        mockCategoryRepository.create(existingCategory);
        mockCategoryRepository.addProductCategory({
            categoryId: categoryId.toString(),
            productId: productId.toString(),
        });
    });

    it("should return categories with associated products successfully", async () => {
        const result = await getCategoriesWithProductsUseCase.execute({
            page: 1,
            pageSize: 10,
        });

        expect(result.isRight()).toBeTruthy();

        if (result.isRight()) {
            const categories = result.value;
            expect(categories.length).toBeGreaterThan(0);
            expect(categories[0].name).toBe("Category with Products");
        } else {
            throw new Error("Expected categories with products to be returned");
        }
    });

    it("should return an empty array if no categories with products are found", async () => {
        mockCategoryRepository.clearProductCategories();

        const result = await getCategoriesWithProductsUseCase.execute({
            page: 1,
            pageSize: 10,
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            expect(error).toBeInstanceOf(ResourceNotFoundError);
            expect(error.message).toBe("No categories with products found");
        } else {
            throw new Error(
                "Expected ResourceNotFoundError but got a successful result"
            );
        }
    });

    it("should return multiple categories with products", async () => {
        const anotherCategoryId = new UniqueEntityID(
            "another_test_category_id"
        );
        const anotherCategory = makeCategory(
            {
                name: "Another Category with Products",
            },
            anotherCategoryId
        );
        const anotherProductCategory = makeProductCategory({
            productId: new UniqueEntityID("another_test_product_id"),
            categoryId: anotherCategoryId,
        });

        mockCategoryRepository.create(anotherCategory);

        mockCategoryRepository.addProductCategory({
            categoryId: anotherCategoryId.toString(),
            productId: productId.toString(),
        });

        const result = await getCategoriesWithProductsUseCase.execute({
            page: 1,
            pageSize: 10,
        });

        expect(result.isRight()).toBeTruthy();

        if (result.isRight()) {
            const categories = result.value;
            expect(categories.length).toBe(2);
            expect(categories[0].name).toBe("Category with Products");
            expect(categories[1].name).toBe("Another Category with Products");
        } else {
            throw new Error(
                "Expected multiple categories with products to be returned"
            );
        }
    });

    it("should handle errors when repository fails", async () => {
        mockCategoryRepository.findCategoriesWithProducts = vi.fn(() =>
            Promise.reject(new Error("Database error"))
        );

        const result = await getCategoriesWithProductsUseCase.execute({
            page: 1,
            pageSize: 10,
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            expect(error.message).toBe("Repository error");
        } else {
            throw new Error("Expected an error but got a successful result");
        }
    });
});
