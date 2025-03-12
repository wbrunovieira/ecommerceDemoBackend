import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Reflector } from "@nestjs/core";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { vi } from "vitest";
import { SizeController } from "./size.controller";
import { CreateSizeUseCase } from "@/domain/catalog/application/use-cases/create-size";
import { EditSizeUseCase } from "@/domain/catalog/application/use-cases/edit-size";
import { Size } from "@/domain/catalog/enterprise/entities/size";
import { FindSizeByIdUseCase } from "@/domain/catalog/application/use-cases/find-size-by-id";
import { GetAllSizesUseCase } from "@/domain/catalog/application/use-cases/get-all-sizes";
import { DeleteSizeUseCase } from "@/domain/catalog/application/use-cases/delete-size";

describe("SizeController", () => {
    let sizeController: SizeController;
    let createSizeUseCase: CreateSizeUseCase;
    let editsizeUseCase: EditSizeUseCase;
    let getAllSizessUseCase: GetAllSizesUseCase;
    let findSizeByIdUseCase: FindSizeByIdUseCase;
    let deleteSizeUseCase: DeleteSizeUseCase;
    let consoleErrorSpy: any;

    beforeEach(async () => {
        consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const module: TestingModule = await Test.createTestingModule({
            controllers: [SizeController],
            providers: [
                {
                    provide: CreateSizeUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: EditSizeUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },

                {
                    provide: GetAllSizesUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: FindSizeByIdUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: DeleteSizeUseCase,
                    useValue: {
                        execute: vi.fn(),
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
                {
                    provide: RolesGuard,
                    useValue: {
                        canActivate: (context: ExecutionContext) => {
                            const request = context.switchToHttp().getRequest();
                            request.user = { role: "admin" };
                            return true;
                        },
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: () => "test-token",
                        verify: () => ({ id: "admin-id", role: "admin" }),
                    },
                },
            ],
        }).compile();

        sizeController = module.get<SizeController>(SizeController);
        createSizeUseCase = module.get<CreateSizeUseCase>(CreateSizeUseCase);
        editsizeUseCase = module.get<EditSizeUseCase>(EditSizeUseCase);

        getAllSizessUseCase =
            module.get<GetAllSizesUseCase>(GetAllSizesUseCase);
        findSizeByIdUseCase =
            module.get<FindSizeByIdUseCase>(FindSizeByIdUseCase);
        deleteSizeUseCase = module.get<DeleteSizeUseCase>(DeleteSizeUseCase);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("should create a size successfully", async () => {
        const mockSize = Size.create(
            {
                name: "SizeName",
            },
            new UniqueEntityID()
        );
        const mockResult = right({ size: mockSize }) as Either<
            ResourceNotFoundError | null,
            { size: Size }
        >;
        vi.spyOn(createSizeUseCase, "execute").mockResolvedValue(mockResult);

        const result = await sizeController.createSize({ name: "SizeName" });

        expect(result).toEqual(mockResult.value);
        expect(createSizeUseCase.execute).toHaveBeenCalledWith({
            name: "SizeName",
        });
    });

    it("should handle errors thrown by CreateSizeUseCase", async () => {
        vi.spyOn(createSizeUseCase, "execute").mockImplementation(() => {
            throw new Error("CreateSizeUseCase error");
        });

        try {
            await sizeController.createSize({ name: "SizeWithError" });
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to create size");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should edit a size successfully", async () => {
        const mockSize = Size.create(
            {
                name: "UpdatedSizeName",
            },
            new UniqueEntityID("size-1")
        );
        const mockResult = right({ size: mockSize }) as Either<
            ResourceNotFoundError,
            { size: Size }
        >;
        vi.spyOn(editsizeUseCase, "execute").mockResolvedValue(mockResult);

        const result = await sizeController.editSize("size-1", {
            name: "UpdatedSizeName",
        });

        expect(result).toEqual(mockResult.value);
        expect(editsizeUseCase.execute).toHaveBeenCalledWith({
            sizeId: "size-1",
            name: "UpdatedSizeName",
        });
    });

    it("should handle errors thrown by EditSizeUseCase", async () => {
        vi.spyOn(editsizeUseCase, "execute").mockImplementation(() => {
            throw new Error("EditSizeUseCase error");
        });

        try {
            await sizeController.editSize("size-1", {
                name: "UpdatedBrandWithError",
            });
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to update size");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should get all sizes successfully", async () => {
        const mockSize1 = Size.create(
            {
                name: "Size1",
            },
            new UniqueEntityID("size-1")
        );

        const mockSize2 = Size.create(
            {
                name: "Size2",
            },
            new UniqueEntityID("size-2")
        );

        const mockResult = right([mockSize1, mockSize2]) as Either<
            ResourceNotFoundError,
            Size[]
        >;
        vi.spyOn(getAllSizessUseCase, "execute").mockResolvedValue(mockResult);

        const result = await sizeController.getAllSizes({
            page: 1,
            pageSize: 10,
        });
        expect(result).toEqual({ size: mockResult.value });
        expect(getAllSizessUseCase.execute).toHaveBeenCalledWith({
            page: 1,
            pageSize: 10,
        });
    });
    it("should handle errors thrown by GetAllSizesUseCase", async () => {
        vi.spyOn(getAllSizessUseCase, "execute").mockImplementation(() => {
            throw new Error("GetAllSizesUseCase error");
        });

        try {
            await sizeController.getAllSizes({ page: 1, pageSize: 10 });
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to retrieve sizes");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should find a size by id successfully", async () => {
        const mockSize = Size.create(
            {
                name: "SizeName",
            },
            new UniqueEntityID("size-1")
        );
        const mockResult = right({ size: mockSize }) as Either<
            ResourceNotFoundError,
            { size: Size }
        >;
        vi.spyOn(findSizeByIdUseCase, "execute").mockResolvedValue(mockResult);

        const result = await sizeController.findSizeById("size-1");

        expect(result).toEqual(mockResult.value);
        expect(findSizeByIdUseCase.execute).toHaveBeenCalledWith({
            id: "size-1",
        });
    });

    it("should handle errors thrown by SizeByIdUseCase", async () => {
        vi.spyOn(findSizeByIdUseCase, "execute").mockImplementation(() => {
            throw new Error("findSizeByIdUseCase error");
        });

        try {
            await sizeController.findSizeById("SizeWithError");
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to find size");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should delete a size successfully", async () => {
        const mockResult = right({}) as Either<ResourceNotFoundError, {}>;
        vi.spyOn(deleteSizeUseCase, "execute").mockResolvedValue(mockResult);

        const result = await sizeController.deleteSize("size-1");

        expect(result).toEqual({ message: "Size deleted successfully" });
        expect(deleteSizeUseCase.execute).toHaveBeenCalledWith({
            sizeId: "size-1",
        });
    });

    it("should handle errors thrown by DeleteSizeUseCase", async () => {
        vi.spyOn(deleteSizeUseCase, "execute").mockImplementation(() => {
            throw new Error("DeleteSizeUseCase error");
        });

        try {
            await sizeController.deleteSize("SizeWithError");
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to delete size");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });
});
