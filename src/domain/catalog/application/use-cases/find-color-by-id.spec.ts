import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { left, right } from "@/core/either";
import { InMemoryColorRepository } from "@test/repositories/in-memory-color-repository";
import { FindColorByIdUseCase } from "./find-color-by-id";
import { Color } from "../../enterprise/entities/color";

let inMemoryColorRepository: InMemoryColorRepository;
let sut: FindColorByIdUseCase;

describe("FindColorByIdUseCase", () => {
    beforeEach(() => {
        inMemoryColorRepository = new InMemoryColorRepository();
        sut = new FindColorByIdUseCase(inMemoryColorRepository);
    });

    it("should be able to find a color by id", async () => {
        const color = Color.create(
            {
                name: "ColorName",
            },
            new UniqueEntityID("color-1")
        );

        inMemoryColorRepository.items.push(color);

        const result = await sut.execute({ id: "color-1" });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(result.value.color).toEqual(color);
        }
    });

    it("should return an error if the color does not exist", async () => {
        const result = await sut.execute({ id: "non-existent-id" });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
        }
    });
});
