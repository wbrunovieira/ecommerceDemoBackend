import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";
import { FindCategoryByNameUseCase } from "./find-category-by-name";
import { makeCategory } from "@test/factories/make-category";

let inMemoryCategoryRepository: InMemoryCategoryRepository;
let findCategoryByNameUseCase: FindCategoryByNameUseCase;

describe("FindCategoryByNameUseCase", () => {
    beforeEach(() => {
        inMemoryCategoryRepository = new InMemoryCategoryRepository();
        findCategoryByNameUseCase = new FindCategoryByNameUseCase(
            inMemoryCategoryRepository as any
        );
    });

    it("should find a category by name", async () => {
        const newCategory = makeCategory(
            { name: "Test Category" },
            new UniqueEntityID("category-1")
        );
        await inMemoryCategoryRepository.create(newCategory);

        const result = await findCategoryByNameUseCase.execute({
            name: "Test Category",
        });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value.category.name).toBe("Test Category");
        }
    });

    it("should return an error if the category is not found", async () => {
        const result = await findCategoryByNameUseCase.execute({
            name: "Non-existing Category",
        });

        expect(result.isLeft()).toBe(true);
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
        }
    });
});
