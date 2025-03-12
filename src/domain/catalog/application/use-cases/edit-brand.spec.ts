import { EditBrandUseCase } from "./edit-brand";
import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";
import { makeBrand } from "@test/factories/make-brand";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemoryBrandsRepository: InMemoryBrandRepository;
let sut: EditBrandUseCase;

describe("Edit Brand", () => {
    beforeEach(() => {
        inMemoryBrandsRepository = new InMemoryBrandRepository();
        sut = new EditBrandUseCase(inMemoryBrandsRepository as any);
    });

    it("should be able to edit an existing  brand", async () => {
        const newBrand = makeBrand({}, new UniqueEntityID("brand-1"));

        await inMemoryBrandsRepository.create(newBrand);

        const result = await sut.execute({
            brandId: newBrand.id.toValue(),
            name: "Updated Brand Name",
        });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            const updatedBrand = result.value.brand;
            expect(updatedBrand.id.toValue()).toBe("brand-1");
            expect(updatedBrand.name).toBe("Updated Brand Name");
        }
    });

    it("should return an error if the brand does not exist", async () => {
        const result = await sut.execute({
            brandId: "non-existing-brand",
            name: "name teste",
        });

        if (result.isLeft()) {
            const error = result.value as ResourceNotFoundError;
            expect(error).toBeInstanceOf(ResourceNotFoundError);
            expect(error.message).toBe("Brand not found");
        }
    });

    it("should not change the brand if the name is the same", async () => {
        const brandId = new UniqueEntityID("brand-3");
        const newBrand = makeBrand({ name: "Same Brand Name" }, brandId);

        await inMemoryBrandsRepository.create(newBrand);

        const result = await sut.execute({
            brandId: brandId.toValue(),
            name: "Same Brand Name",
        });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            const updatedBrand = result.value.brand;
            expect(updatedBrand.id.toValue()).toBe("brand-3");
            expect(updatedBrand.name).toBe("Same Brand Name");
        }
    });
});
