import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";
import { CreateCategoryUseCase } from "./create-category";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemoryCategoryRepository: InMemoryCategoryRepository;
let sut: CreateCategoryUseCase;

describe("CreateCategorydUseCase", () => {
    beforeEach(() => {
        inMemoryCategoryRepository = new InMemoryCategoryRepository();
        sut = new CreateCategoryUseCase(inMemoryCategoryRepository as any);
    });

    it("should be able to create a category", async () => {
        const result = await sut.execute({
            name: "calcinha",
        });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemoryCategoryRepository.items[0]).toEqual(
                result.value.category
            );
        }
    });

    it("should not be able to create a category without a name", async () => {
        const result = await sut.execute({
            name: "",
        });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe("Category name is required");
            }
        }
    });

    it("should not be able to create a category with a duplicate name", async () => {
        await sut.execute({ name: "calcinha" });

        const result = await sut.execute({ name: "calcinha" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Category with this name already exists"
                );
            }
        }
    });

    it("should not create a category with a name that is the same after normalization", async () => {
        await sut.execute({ name: " Category  " });

        const result = await sut.execute({ name: "category" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Category with this name already exists"
                );
            }
        }
    });

    it("should be able to create a category with special characters in the name", async () => {
        const result = await sut.execute({ name: "Category#@!" });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemoryCategoryRepository.items[0]).toEqual(
                result.value.category
            );
        }
    });

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemoryCategoryRepository, "create").mockImplementationOnce(
            () => {
                throw new Error("Repository error");
            }
        );

        const result = await sut.execute({ name: "CategoryWithError" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            const error = result.value as Error;
            expect(error.message).toBe("Repository error");
        }
    });

    it("should not create a category with a name shorter than 3 characters", async () => {
        const result = await sut.execute({ name: "AB" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Category name must be at least 3 characters long"
                );
            }
        }
    });

    it("should not create a category with a name longer than 20 characters", async () => {
        const longName = "A".repeat(21);
        const result = await sut.execute({ name: longName });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Category name must be less than 20 characters long"
                );
            }
        }
    });
});
