import { CreateAddressUseCase } from "@/domain/auth/application/use-cases/create-address";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { InMemoryAddressRepository } from "@test/repositories/in-Memory-address-repository";

let inMemoryAddressRepository: InMemoryAddressRepository;
let sut: CreateAddressUseCase;

describe("CreateAddressUseCase", () => {
    beforeEach(() => {
        inMemoryAddressRepository = new InMemoryAddressRepository();
        sut = new CreateAddressUseCase(inMemoryAddressRepository);
    });

    it("should be able to create an address", async () => {
        const result = await sut.execute({
            userId: "user-1",
            street: "123 Main St",
            number: 123,
            city: "Cityville",
            state: "State",
            country: "Country",
            zipCode: "12345",
        });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemoryAddressRepository.items[0]).toEqual(
                result.value.address
            );
        }
    });

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemoryAddressRepository, "create").mockImplementationOnce(
            () => {
                throw new Error("Repository error");
            }
        );

        const result = await sut.execute({
            userId: "user-1",
            street: "123 Main St",
            number: 123,
            city: "Cityville",
            state: "State",
            country: "Country",
            zipCode: "12345",
        });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            const error = result.value as Error;
            expect(error.message).toBe("Repository error");
        }
    });

    it("should not be able to create an address without required fields", async () => {
        const result = await sut.execute({
            userId: "",
            street: "",
            number: 0,
            city: "",
            state: "",
            country: "",
            zipCode: "",
        });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
        }
    });
});
