import { EditColorUseCase } from "./edit-color";
import { InMemoryColorRepository } from "../../../../../test/repositories/in-memory-color-repository";
import { makeColor } from "../../../../../test/factories/make-color";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemoryColorsRepository: InMemoryColorRepository;
let sut: EditColorUseCase;

describe("Edit Color", () => {
    beforeEach(() => {
        inMemoryColorsRepository = new InMemoryColorRepository();
        sut = new EditColorUseCase(inMemoryColorsRepository as any);
    });

    it("should be able to edit a color", async () => {
        const newColor = makeColor({}, new UniqueEntityID("color-1"));

        await inMemoryColorsRepository.create(newColor);

        const result = await sut.execute({
            colorId: newColor.id.toValue(),
            name: "name teste",
        });

        expect(result.isRight()).toBe(true);
    });

    it("should return an error if the color does not exist", async () => {
        const result = await sut.execute({
            colorId: "non-existing-color",
            name: "name teste",
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
