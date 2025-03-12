import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";
import { FindBrandByIdUseCase } from "./find-brand-by-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Brand } from "../../enterprise/entities/brand";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryBrandRepository: InMemoryBrandRepository;
let sut: FindBrandByIdUseCase;

describe("FindBrandByIdUseCase", () => {
    beforeEach(() => {
        inMemoryBrandRepository = new InMemoryBrandRepository();
        sut = new FindBrandByIdUseCase(inMemoryBrandRepository);
    });

    it("should be able to find a brand by id", async () => {
        const brand = Brand.create(
            {
                name: "BrandName",
            },
            new UniqueEntityID("brand-1")
        );

        inMemoryBrandRepository.items.push(brand);

        const result = await sut.execute({ id: "brand-1" });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(result.value.brand).toEqual(brand);
        }
    });

    it("should return an error if the brand does not exist", async () => {
        const result = await sut.execute({ id: "non-existent-id" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
        }
    });
});
