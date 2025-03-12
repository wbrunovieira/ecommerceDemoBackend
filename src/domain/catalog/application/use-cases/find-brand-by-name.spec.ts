import { FindBrandByNameUseCase } from "./find-brand-by-name";
import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";
import { makeBrand } from "@test/factories/make-brand";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemoryBrandsRepository: InMemoryBrandRepository;
let findBrandByNameUseCase: FindBrandByNameUseCase;

describe("FindBrandByNameUseCase", () => {
    beforeEach(() => {
        inMemoryBrandsRepository = new InMemoryBrandRepository();
        findBrandByNameUseCase = new FindBrandByNameUseCase(
            inMemoryBrandsRepository as any
        );
    });

    it("should find a brand by name", async () => {
        const newBrand = makeBrand(
            { name: "Test Brand" },
            new UniqueEntityID("brand-1")
        );
        await inMemoryBrandsRepository.create(newBrand);

        const result = await findBrandByNameUseCase.execute({
            name: "Test Brand",
        });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value.brand.name).toBe("Test Brand");
        }
    });

    it("should return an error if the brand is not found", async () => {
        const result = await findBrandByNameUseCase.execute({
            name: "Non-existing Brand",
        });

        expect(result.isLeft()).toBe(true);
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
        }
    });
});
