import { InMemorySizeRepository } from "@test/repositories/in-memory-size-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { FindSizeByIdUseCase } from "./find-size-by-id";
import { Size } from "../../enterprise/entities/size";

let inMemorySizeRepository: InMemorySizeRepository;
let sut: FindSizeByIdUseCase;

describe("FindSizeByIdUseCase", () => {
    beforeEach(() => {
        inMemorySizeRepository = new InMemorySizeRepository();
        sut = new FindSizeByIdUseCase(inMemorySizeRepository);
    });

    it("should be able to find a size by id", async () => {
        const size = Size.create(
            {
                name: "SizeName",
            },
            new UniqueEntityID("size-1")
        );

        inMemorySizeRepository.items.push(size);

        const result = await sut.execute({ id: "size-1" });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(result.value.size).toEqual(size);
        }
    });

    it("should return an error if the size does not exist", async () => {
        const result = await sut.execute({ id: "non-existent-id" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
        }
    });
});
