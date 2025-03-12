import { InMemoryColorRepository } from "../../../../../test/repositories/in-memory-color-repository";

import { CreateColorUseCase } from "./create-color";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemoryColorRepository: InMemoryColorRepository;
let sut: CreateColorUseCase;

describe("CreateColorUseCase", () => {
    beforeEach(() => {
        inMemoryColorRepository = new InMemoryColorRepository();
        sut = new CreateColorUseCase(inMemoryColorRepository);
    });

    it("should be able to create a color", async () => {
        const result = await sut.execute({
            name: "red",
        });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemoryColorRepository.items[0]).toEqual(
                result.value.color
            );
        }
    });

    it("should not be able to create a color without a name", async () => {
        const result = await sut.execute({
            name: "",
        });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe("Color name is required");
            }
        }
    });

    it("should not be able to create a color with a duplicate name", async () => {
        await sut.execute({ name: "red" });

        const result = await sut.execute({ name: "red" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Color with this name already exists"
                );
            }
        }
    });

    it("should not create a color with a name that is the same after normalization", async () => {
        await sut.execute({ name: " Color  " });

        const result = await sut.execute({ name: "color" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Color with this name already exists"
                );
            }
        }
    });

    it("should be able to create a color with special characters in the name", async () => {
        const result = await sut.execute({ name: "Color#@!" });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemoryColorRepository.items[0]).toEqual(
                result.value.color
            );
        }
    });

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemoryColorRepository, "create").mockImplementationOnce(
            () => {
                throw new Error("Repository error");
            }
        );

        const result = await sut.execute({ name: "ColorWithError" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            const error = result.value as Error;
            expect(error.message).toBe("Repository error");
        }
    });

    it("should not create a color with a name shorter than 3 characters", async () => {
        const result = await sut.execute({ name: "AB" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Color name must be at least 3 characters long"
                );
            }
        }
    });

    it("should not create a color with a name longer than 20 characters", async () => {
        const longName = "A".repeat(21);
        const result = await sut.execute({ name: longName });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Color name must be less than 20 characters long"
                );
            }
        }
    });
});
