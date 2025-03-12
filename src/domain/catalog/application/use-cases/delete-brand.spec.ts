import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";
import { DeleteBrandUseCase } from "./delete-brand";

import { makeBrand } from "@test/factories/make-brand";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemoryBrandRepository: InMemoryBrandRepository;
let sut: DeleteBrandUseCase;

describe("Delete Brand", () => {
    beforeEach(() => {
        inMemoryBrandRepository = new InMemoryBrandRepository();
        sut = new DeleteBrandUseCase(inMemoryBrandRepository as any);
    });

    it("should be able to delete a brand", async () => {
        const newBrand = makeBrand({}, new UniqueEntityID("brand-1"));

        await inMemoryBrandRepository.create(newBrand);

        const result = await sut.execute({
            brandId: "brand-1",
        });

        expect(result.isRight()).toBe(true);
    });

    it("should return an error if the brand does not exist", async () => {
        const result = await sut.execute({
            brandId: "non-existing-brand",
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
