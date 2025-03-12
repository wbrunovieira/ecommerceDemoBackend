import { InMemorySizeRepository } from "../../../../../test/repositories/in-memory-size-repository";

import { CreateSizeUseCase } from "./create-size";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemorySizeRepository: InMemorySizeRepository;
let sut: CreateSizeUseCase;

describe("CreateSizeUseCase", () => {
    beforeEach(() => {
        inMemorySizeRepository = new InMemorySizeRepository();
        sut = new CreateSizeUseCase(inMemorySizeRepository);
    });

    it("should be able to create a size", async () => {
        const result = await sut.execute({
            name: "m",
        });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemorySizeRepository.items[0]).toEqual(result.value.size);
        }
    });

    it("should not be able to create a size without a name", async () => {
        const result = await sut.execute({
            name: "",
        });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe("Size name is required");
            }
        }
    });

    it("should not be able to create a size with a duplicate name", async () => {
        await sut.execute({ name: "m" });

        const result = await sut.execute({ name: "m" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Size with this name already exists"
                );
            }
        }
    });

    it("should not create a size with a name that is the same after normalization", async () => {
        await sut.execute({ name: " Grande " });

        const result = await sut.execute({ name: "grande" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Size with this name already exists"
                );
            }
        }
    });

    it("should be able to find a size by name regardless of case and spaces", async () => {
        await sut.execute({
            name: "  Grande ",
        });

        const foundSize = await inMemorySizeRepository.findByName("grande");

        expect(foundSize.isRight()).toBeTruthy();
        expect(foundSize.value?.name).toEqual("Grande");
    });

    it("should not be able to create a size with a name that contains only spaces", async () => {
        const result = await sut.execute({ name: "   " });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe("Size name is required");
            }
        }
    });

    it("should be able to create a size with special characters in the name", async () => {
        const result = await sut.execute({ name: "Size#@!" });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemorySizeRepository.items[0]).toEqual(result.value.size);
        }
    });

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemorySizeRepository, "create").mockImplementationOnce(
            () => {
                throw new Error("Repository error");
            }
        );

        const result = await sut.execute({ name: "Error" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            const error = result.value as Error;
            expect(error.message).toBe("Repository error");
        }
    });

    it("should not create a size with a name longer than 10 characters", async () => {
        const longName = "A".repeat(11);
        const result = await sut.execute({ name: longName });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Size name must be less than 10 characters long"
                );
            }
        }
    });
});
