import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { GetAllCategoriesUseCase } from "./get-all-categories";
import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";
import { makeCategory } from "@test/factories/make-category";

let inMemoryCategoryRepository: InMemoryCategoryRepository;
let sut: GetAllCategoriesUseCase;

describe("GetAllCategoriesUseCase", () => {
    beforeEach(() => {
        inMemoryCategoryRepository = new InMemoryCategoryRepository();
        sut = new GetAllCategoriesUseCase(inMemoryCategoryRepository);
    });

    it("should return a list of categories", async () => {
        const mockCategories = Array.from({ length: 5 }, () => makeCategory());

        inMemoryCategoryRepository.items = mockCategories;

        const params: PaginationParams = { page: 1, pageSize: 10 };
        const result = await sut.execute(params);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value).toEqual(mockCategories);
        }
    });

    it("should return an empty list if no categories exist", async () => {
        const params: PaginationParams = { page: 1, pageSize: 10 };
        const result = await sut.execute(params);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value).toEqual([]);
        }
    });

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemoryCategoryRepository, "findAll").mockImplementationOnce(
            () => {
                throw new Error("Repository error");
            }
        );

        const params: PaginationParams = { page: 1, pageSize: 10 };
        const result = await sut.execute(params);

        expect(result.isLeft()).toBe(true);
        if (result.isLeft()) {
            const error = result.value as Error;
            expect(error.message).toBe("Repository error");
        }
    });
});
