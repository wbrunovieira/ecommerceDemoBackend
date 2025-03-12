import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryColorRepository } from "../../../../../test/repositories/in-memory-color-repository";
import { DeleteColorUseCase } from "./delete-color";

import { makeColor } from "../../../../../test/factories/make-color";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemoryColorRepository: InMemoryColorRepository;
let sut: DeleteColorUseCase;

describe("Delete Color", () => {
    beforeEach(() => {
        inMemoryColorRepository = new InMemoryColorRepository();
        sut = new DeleteColorUseCase(inMemoryColorRepository as any);
    });

    it("should be able to delete a color", async () => {
        const newColor = makeColor({}, new UniqueEntityID("color-1"));

        await inMemoryColorRepository.create(newColor);

        const result = await sut.execute({
            colorId: "color-1",
        });

        expect(result.isRight()).toBe(true);
    });

    it("should return an error if the color does not exist", async () => {
        const result = await sut.execute({
            colorId: "non-existing-color",
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
