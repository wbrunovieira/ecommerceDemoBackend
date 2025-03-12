import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";

import { CreateBrandUseCase } from "./create-brand";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemoryBrandRepository: InMemoryBrandRepository;
let sut: CreateBrandUseCase;

describe("CreateBrandUseCase", () => {
    beforeEach(() => {
        inMemoryBrandRepository = new InMemoryBrandRepository();
        sut = new CreateBrandUseCase(inMemoryBrandRepository);
    });

    it("should be able to create a brand", async () => {
        const result = await sut.execute({
            name: "red",
        });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemoryBrandRepository.items[0]).toEqual(
                result.value.brand
            );
        }
    });

    it("should not be able to create a brand without a name", async () => {
        const result = await sut.execute({
            name: "",
        });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe("Brand name is required");
            }
        }
    });

    it("should not be able to create a brand with a duplicate name", async () => {
        await sut.execute({ name: "red" });

        const result = await sut.execute({ name: "red" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Brand with this name already exists"
                );
            }
        }
    });

    it("should not create a brand with a name that is the same after normalization", async () => {
        await sut.execute({ name: " Brand  " });

        const result = await sut.execute({ name: "brand" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Brand with this name already exists"
                );
            }
        }
    });

    it("should be able to find a brand by name regardless of case and spaces", async () => {
        await sut.execute({
            name: "  Brand ",
        });

        const foundBrand = await inMemoryBrandRepository.findByName("brand");

        expect(foundBrand.isRight()).toBeTruthy();
        expect(foundBrand.value?.name).toEqual("Brand");
    });

    it("should not be able to create a brand with a name that contains only spaces", async () => {
        const result = await sut.execute({ name: "   " });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe("Brand name is required");
            }
        }
    });

    it("should be able to create a brand with special characters in the name", async () => {
        const result = await sut.execute({ name: "Brand#@!" });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemoryBrandRepository.items[0]).toEqual(
                result.value.brand
            );
        }
    });

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemoryBrandRepository, "create").mockImplementationOnce(
            () => {
                throw new Error("Repository error");
            }
        );

        const result = await sut.execute({ name: "BrandWithError" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            const error = result.value as Error;
            expect(error.message).toBe("Repository error");
        }
    });

    it("should not create a brand with a name shorter than 3 characters", async () => {
        const result = await sut.execute({ name: "AB" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Brand name must be at least 3 characters long"
                );
            }
        }
    });

    it("should not create a brand with a name longer than 50 characters", async () => {
        const longName = "A".repeat(51);
        const result = await sut.execute({ name: longName });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Brand name must be less than 50 characters long"
                );
            }
        }
    });
});
