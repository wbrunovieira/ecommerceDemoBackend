import { InMemoryAccountRepository } from "../../../../../test/repositories/in-Memory-account-repository";
import { CreateAccountUseCase } from "./create-account";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

let inMemoryAccountRepository: InMemoryAccountRepository;
let sut: CreateAccountUseCase;

describe("CreateAccountUseCase", () => {
    beforeEach(() => {
        inMemoryAccountRepository = new InMemoryAccountRepository();
        sut = new CreateAccountUseCase(inMemoryAccountRepository);
    });

    it("should be able to create an account", async () => {
        const result = await sut.execute({
            name: "John Doe",
            email: "john@example.com",
            password: "securepassword",
            role: "user",
        });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemoryAccountRepository.items[0]).toEqual(
                result.value.user
            );
        }
    });

    it("should not be able to create an account without a name", async () => {
        const result = await sut.execute({
            name: "",
            email: "john@example.com",
            password: "securepassword",
            role: "user",
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe("User name is required");
            }
        }
    });

    it("should not be able to create an account with a duplicate email", async () => {
        await sut.execute({
            name: "John Doe",
            email: "john@example.com",
            password: "securepassword",
            role: "user",
        });

        const result = await sut.execute({
            name: "Jane Doe",
            email: "john@example.com",
            password: "anotherpassword",
            role: "user",
        });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe("User already exists");
            }
        }
    });

    it("should not create an account with a password shorter than 6 characters", async () => {
        const result = await sut.execute({
            name: "John Doe",
            email: "john@example.com",
            password: "123",
            role: "user",
        });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Password must be at least 6 characters long"
                );
            }
        }
    });

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemoryAccountRepository, "create").mockImplementationOnce(
            () => {
                throw new ResourceNotFoundError("Repository error");
            }
        );

        const result = await sut.execute({
            name: "John Doe",
            email: "error@example.com",
            password: "securepassword",
            role: "user",
        });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            const error = result.value as ResourceNotFoundError;
            expect(error.message).toBe("Repository error");
        }
    });
});
