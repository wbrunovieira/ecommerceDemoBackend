import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { FindColorByNameUseCase } from "./find-color-by-name";
import { InMemoryColorRepository } from "@test/repositories/in-memory-color-repository";
import { makeColor } from "@test/factories/make-color";

let inMemoryColorsRepository: InMemoryColorRepository;
let findColorByNameUseCase: FindColorByNameUseCase;

describe("FindColorByNameUseCase", () => {
    beforeEach(() => {
        inMemoryColorsRepository = new InMemoryColorRepository();
        findColorByNameUseCase = new FindColorByNameUseCase(
            inMemoryColorsRepository
        );
    });

    it("should find a color by name", async () => {
        const newColor = makeColor(
            { name: "Test Color" },
            new UniqueEntityID("color-1")
        );
        await inMemoryColorsRepository.create(newColor);

        const result = await findColorByNameUseCase.execute({
            name: "Test Color",
        });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value.color.name).toBe("Test Color");
        }
    });

    it("should return an error if the color is not found", async () => {
        const result = await findColorByNameUseCase.execute({
            name: "Non-existing Color",
        });

        expect(result.isLeft()).toBe(true);
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
        }
    });
});
