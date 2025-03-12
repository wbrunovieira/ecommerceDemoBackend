import { EditSizeUseCase } from "./edit-size";
import { InMemorySizeRepository } from "../../../../../test/repositories/in-memory-size-repository";
import { makeSize } from "../../../../../test/factories/make-size";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemorySizesRepository: InMemorySizeRepository;
let sut: EditSizeUseCase;

describe("Edit Size", () => {
    beforeEach(() => {
        inMemorySizesRepository = new InMemorySizeRepository();
        sut = new EditSizeUseCase(inMemorySizesRepository as any);
    });

    it("should be able to edit a size", async () => {
        const newSize = makeSize({}, new UniqueEntityID("size-1"));

        await inMemorySizesRepository.create(newSize);

        const result = await sut.execute({
            sizeId: newSize.id.toValue(),
            name: "name teste",
        });

        expect(result.isRight()).toBe(true);
    });

    it("should return an error if the size does not exist", async () => {
        const result = await sut.execute({
            sizeId: "non-existing-size",
            name: "name teste",
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
