import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { ConflictException } from "@nestjs/common";
import { InMemoryAccountRepository } from "@test/repositories/in-Memory-account-repository";
import { vi } from "vitest";
import { CreateGoogleAccountUseCase } from "./create-account-with-google";

let inMemoryAccountRepository: InMemoryAccountRepository;
let sut: CreateGoogleAccountUseCase;

describe("CreateGoogleAccountUseCase", () => {
    beforeEach(() => {
        inMemoryAccountRepository = new InMemoryAccountRepository();
        sut = new CreateGoogleAccountUseCase(inMemoryAccountRepository);
    });

    it("should be able to create a Google account", async () => {
        const result = await sut.execute({
            name: "John Doe",
            email: "john@example.com",
            googleUserId: "google-id",
            profileImageUrl: "http://example.com/profile.jpg",
            role: "user",
        });

        expect(result.isRight()).toBeTruthy();
        if (result.isRight()) {
            expect(inMemoryAccountRepository.items[0]).toEqual(
                result.value.user
            );
        }
    });

    it("should not be able to create a Google account with a duplicate email", async () => {
        await sut.execute({
            name: "John Doe",
            email: "john@example.com",
            googleUserId: "google-id",
            profileImageUrl: "http://example.com/profile.jpg",
            role: "user",
        });

        const result = await sut.execute({
            name: "Jane Doe",
            email: "john@example.com",
            googleUserId: "google-id-2",
            profileImageUrl: "http://example.com/profile2.jpg",
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

    it("should handle errors thrown by the repository", async () => {
        vi.spyOn(inMemoryAccountRepository, "create").mockImplementationOnce(
            () => {
                throw new ResourceNotFoundError("Repository error");
            }
        );

        const result = await sut.execute({
            name: "John Doe",
            email: "error@example.com",
            googleUserId: "google-id",
            profileImageUrl: "http://example.com/profile.jpg",
            role: "user",
        });

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            const error = result.value as ResourceNotFoundError;
            expect(error.message).toBe("Repository error");
        }
    });
});
