import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";
import { GetAllBrandsUseCase } from "./get-all-brands";
import { Brand } from "../../enterprise/entities/brand";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { PaginationParams } from "@/core/repositories/pagination-params";

let inMemoryBrandRepository: InMemoryBrandRepository;
let sut: GetAllBrandsUseCase;

describe("GetAllBrandsUseCase", () => {
    beforeEach(() => {
        inMemoryBrandRepository = new InMemoryBrandRepository();
        sut = new GetAllBrandsUseCase(inMemoryBrandRepository);
    });

    it("should return a list of brands", async () => {
        const mockBrands = [
            Brand.create({ name: "Brand 1" }, new UniqueEntityID("brand-1")),
            Brand.create({ name: "Brand 2" }, new UniqueEntityID("brand-2")),
        ];

        inMemoryBrandRepository.items = mockBrands;

        const params: PaginationParams = { page: 1, pageSize: 10 };
        const result = await sut.execute(params);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value).toEqual(mockBrands);
        }
    });

    it("should return an empty list if no brands exist", async () => {
        const params: PaginationParams = { page: 1, pageSize: 10 };
        const result = await sut.execute(params);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value).toEqual([]);
        }
    });

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemoryBrandRepository, "findAll").mockImplementationOnce(
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
