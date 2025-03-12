import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { InMemorySizeRepository } from "@test/repositories/in-memory-size-repository";
import { GetAllSizesUseCase } from "./get-all-sizes";
import { Size } from "../../enterprise/entities/size";

let inMemorySizeRepository: InMemorySizeRepository;
let sut: GetAllSizesUseCase;

describe("GetAllSizesUseCase", () => {
    beforeEach(() => {
        inMemorySizeRepository = new InMemorySizeRepository();
        sut = new GetAllSizesUseCase(inMemorySizeRepository);
    });

    it("should return a list of sizes", async () => {
        const mockSizes = [
            Size.create({ name: "Size 1" }, new UniqueEntityID("size-1")),
            Size.create({ name: "Size 2" }, new UniqueEntityID("size-2")),
        ];

        inMemorySizeRepository.items = mockSizes;

        const params: PaginationParams = { page: 1, pageSize: 10 };
        const result = await sut.execute(params);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value).toEqual(mockSizes);
        }
    });

    it("should return an empty list if no sizes exist", async () => {
        const params: PaginationParams = { page: 1, pageSize: 10 };
        const result = await sut.execute(params);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value).toEqual([]);
        }
    });

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemorySizeRepository, "findAll").mockImplementationOnce(
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
