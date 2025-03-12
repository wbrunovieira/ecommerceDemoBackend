import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { InMemoryColorRepository } from "@test/repositories/in-memory-color-repository";
import { GetAllColorsUseCase } from "./get-all-colors";
import { Color } from "../../enterprise/entities/color";

let inMemoryColorRepository: InMemoryColorRepository;
let sut: GetAllColorsUseCase;

describe("GetAllColorsUseCase", () => {
    beforeEach(() => {
        inMemoryColorRepository = new InMemoryColorRepository();
        sut = new GetAllColorsUseCase(inMemoryColorRepository);
    });

    it("should return a list of colors", async () => {
        const mockColors = [
            Color.create({ name: "Color 1" }, new UniqueEntityID("color-1")),
            Color.create({ name: "Color 2" }, new UniqueEntityID("color-2")),
        ];

        inMemoryColorRepository.items = mockColors;

        const params: PaginationParams = { page: 1, pageSize: 10 };
        const result = await sut.execute(params);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value).toEqual(mockColors);
        }
    });

    it("should return an empty list if no colors exist", async () => {
        const params: PaginationParams = { page: 1, pageSize: 10 };
        const result = await sut.execute(params);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value).toEqual([]);
        }
    });

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemoryColorRepository, "findAll").mockImplementationOnce(
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
