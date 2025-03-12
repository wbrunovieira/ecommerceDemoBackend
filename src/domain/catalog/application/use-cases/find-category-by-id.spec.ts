import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { FindCategoryByIdUseCase } from "./find-category-by-id";
import { Category } from "../../enterprise/entities/category";

let inMemoryCategoryRepository: InMemoryCategoryRepository;
let sut: FindCategoryByIdUseCase;

describe("FindCategoryByIdUseCase", () => {
    beforeEach(() => {
        inMemoryCategoryRepository = new InMemoryCategoryRepository();
        sut = new FindCategoryByIdUseCase(inMemoryCategoryRepository);
    });

    it("should be able to find a category by id", async () => {
        const category = Category.create(
            {
                name: "CategoryName",
            },
            new UniqueEntityID("category-1")
        );

        inMemoryCategoryRepository.items.push(category);

        const result = await sut.execute({ id: "category-1" });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(result.value.category).toEqual(category);
        }
    });

    it("should return an error if the category does not exist", async () => {
        const result = await sut.execute({ id: "non-existent-id" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
        }
    });
});
