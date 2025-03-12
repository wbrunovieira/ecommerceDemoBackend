import { Test, TestingModule } from "@nestjs/testing";
import { AccountController } from "./account.controller";
import { CreateAccountUseCase } from "@/domain/auth/application/use-cases/create-account";
import { Either, left, right } from "@/core/either";
import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { vi } from "vitest";
import { CreateGoogleAccountUseCase } from "@/domain/auth/application/use-cases/create-account-with-google";
import { PrismaService } from "@/prisma/prisma.service";

describe("AccountController", () => {
    let accountController: AccountController;
    let createAccountUseCase: CreateAccountUseCase;
    let createGoogleAccountUseCase: CreateGoogleAccountUseCase;
    let prismaService: PrismaService;
    let consoleErrorSpy: any;

    beforeEach(async () => {
        consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AccountController],
            providers: [
                {
                    provide: CreateGoogleAccountUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: CreateAccountUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: vi.fn(),
                        },
                    },
                },
                Reflector,
                {
                    provide: JwtAuthGuard,
                    useValue: {
                        canActivate: (context: ExecutionContext) => {
                            const request = context.switchToHttp().getRequest();
                            request.user = { role: "admin" };
                            return true;
                        },
                    },
                },
            ],
        }).compile();
        createGoogleAccountUseCase = module.get<CreateGoogleAccountUseCase>(
            CreateGoogleAccountUseCase
        );
        accountController = module.get<AccountController>(AccountController);
        createAccountUseCase =
            module.get<CreateAccountUseCase>(CreateAccountUseCase);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("should create an account successfully", async () => {
        const mockUser = {
            id: "user-1",
            name: "UserName",
            email: "user@example.com",
            role: "user",
        };
        const mockResult = right({ user: mockUser }) as Either<
            ConflictException | null,
            { user: any }
        >;

        vi.spyOn(createAccountUseCase, "execute").mockResolvedValue(mockResult);

        const result = await accountController.handle({
            name: "UserName",
            email: "user@example.com",
            password: "P@ssw0rd",
            role: "user",
        });

        expect(result).toEqual(mockResult.value);
        expect(createAccountUseCase.execute).toHaveBeenCalledWith({
            name: "UserName",
            email: "user@example.com",
            password: "P@ssw0rd",
            role: "user",
        });
    });

    it("should handle errors thrown by CreateAccountUseCase", async () => {
        const error = new ConflictException("CreateAccountUseCase error");
        vi.spyOn(createAccountUseCase, "execute").mockResolvedValue(
            left(error)
        );

        try {
            await accountController.handle({
                name: "UserWithError",
                email: "error@example.com",
                password: "P@ssw0rd",
                role: "user",
            });
        } catch (err) {
            if (err instanceof HttpException) {
                expect(err.message).toBe("CreateAccountUseCase error");
                expect(err.getStatus()).toBe(HttpStatus.CONFLICT);
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should create a Google account successfully", async () => {
        const mockUser = {
            id: "user-1",
            name: "UserName",
            googleUserId: "google-it",
            profileImageUrl: "image-jpf",
            email: "user@example.com",
            role: "user",
        };
        const mockResult = right({ user: mockUser }) as Either<
            ConflictException | null,
            { user: any }
        >;

        vi.spyOn(createGoogleAccountUseCase, "execute").mockResolvedValue(
            mockResult
        );

        const result = await accountController.handleGoogleAccountCreation({
            name: "UserName",
            email: "user@example.com",
            googleUserId: "google-id",
            profileImageUrl: "http://example.com/profile.jpg",
            role: "user",
        });

        expect(result).toEqual(mockResult.value);
        expect(createGoogleAccountUseCase.execute).toHaveBeenCalledWith({
            name: "UserName",
            email: "user@example.com",
            googleUserId: "google-id",
            profileImageUrl: "http://example.com/profile.jpg",
            role: "user",
        });
    });

    it("should handle errors thrown by CreateGoogleAccountUseCase", async () => {
        const error = new ConflictException("CreateGoogleAccountUseCase error");
        vi.spyOn(createGoogleAccountUseCase, "execute").mockResolvedValue(
            left(error)
        );

        try {
            await accountController.handleGoogleAccountCreation({
                name: "UserWithError",
                email: "error@example.com",
                googleUserId: "google-id",
                profileImageUrl: "http://example.com/profile.jpg",
                role: "user",
            });
        } catch (err) {
            if (err instanceof HttpException) {
                expect(err.message).toBe("CreateGoogleAccountUseCase error");
                expect(err.getStatus()).toBe(HttpStatus.CONFLICT);
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should check if a user email exists", async () => {
        const mockUser = {
            id: "user-1",
            name: "UserName",
            email: "existing@example.com",
            password: "P@ssw0rd",
            profileImageUrl: null,
            googleUserId: null,
            isGoogleUser: null,
            role: "user",
            createdAt: new Date(),
            updatedAt: null,
        };

        vi.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUser);

        const result = await accountController.checkUserByEmail(
            "existing@example.com"
        );

        expect(result).toBe(true);
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
            where: { email: "existing@example.com" },
        });
    });

    it("should return false if a user email does not exist", async () => {
        vi.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);

        const result = await accountController.checkUserByEmail(
            "nonexistent@example.com"
        );

        expect(result).toBe(false);
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
            where: { email: "nonexistent@example.com" },
        });
    });

    it("should throw an error if email is not provided", async () => {
        try {
            await accountController.checkUserByEmail("");
        } catch (err) {
            if (err instanceof HttpException) {
                expect(err.message).toBe("Email is required in request body");
                expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });
});
