import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemorySizeRepository } from "../../../../../test/repositories/in-memory-size-repository";
import { makeSize } from "../../../../../test/factories/make-size";
import { DeleteSizeUseCase } from "./delete-size";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemorySizeRepository: InMemorySizeRepository;
let sut: DeleteSizeUseCase;

describe("Delete Size", () => {
    beforeEach(() => {
        inMemorySizeRepository = new InMemorySizeRepository();
        sut = new DeleteSizeUseCase(inMemorySizeRepository as any);
    });

    it("should be able to delete a size", async () => {
        const newSize = makeSize({}, new UniqueEntityID("size-1"));

        await inMemorySizeRepository.create(newSize);

        const result = await sut.execute({
            sizeId: "size-1",
        });

        expect(result.isRight()).toBe(true);
    });

    it("should return an error if the size does not exist", async () => {
        const result = await sut.execute({
            sizeId: "non-existing-size",
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
