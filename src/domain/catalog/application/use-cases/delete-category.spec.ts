import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";
import { DeleteCategoryUseCase } from "./delete-category";
import { makeCategory } from "@test/factories/make-category";

let inMemoryCategoryRepository: InMemoryCategoryRepository;
let sut: DeleteCategoryUseCase;

describe("Delete Category", () => {
    beforeEach(() => {
        inMemoryCategoryRepository = new InMemoryCategoryRepository();
        sut = new DeleteCategoryUseCase(inMemoryCategoryRepository as any);
    });

    it("should be able to delete a category", async () => {
        const newcategory = makeCategory({}, new UniqueEntityID("category-1"));

        await inMemoryCategoryRepository.create(newcategory);

        const result = await sut.execute({
            categoryId: "category-1",
        });

        expect(result.isRight()).toBe(true);
    });

    it("should return an error if the category does not exist", async () => {
        const result = await sut.execute({
            categoryId: "non-existing-category",
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
