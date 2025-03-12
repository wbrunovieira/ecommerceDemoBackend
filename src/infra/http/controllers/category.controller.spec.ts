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

import { makeCategory } from "@test/factories/make-category";
import { CreateCategoryUseCase } from "@/domain/catalog/application/use-cases/create-category";
import { CategoryController } from "./category.controller";
import { Category } from "@/domain/catalog/enterprise/entities/category";
import { EditCategoryUseCase } from "@/domain/catalog/application/use-cases/edit-category";
import { FindCategoryByIdUseCase } from "@/domain/catalog/application/use-cases/find-category-by-id";
import { FindCategoryByNameUseCase } from "@/domain/catalog/application/use-cases/find-category-by-name";
import { GetAllCategoriesUseCase } from "@/domain/catalog/application/use-cases/get-all-categories";
import { DeleteCategoryUseCase } from "@/domain/catalog/application/use-cases/delete-category";

describe("CategoryController", () => {
    let categoryController: CategoryController;
    let createCategoryUseCase: CreateCategoryUseCase;
    let editCategoryUseCase: EditCategoryUseCase;
    let findCategoryByNameUseCase: FindCategoryByNameUseCase;
    let getAllCategoriesUseCase: GetAllCategoriesUseCase;
    let findCategoryByIdUseCase: FindCategoryByIdUseCase;
    let deleteCategoryUseCase: DeleteCategoryUseCase;
    let consoleErrorSpy: any;

    beforeEach(async () => {
        consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoryController],
            providers: [
                {
                    provide: CreateCategoryUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: EditCategoryUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: FindCategoryByNameUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: GetAllCategoriesUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: FindCategoryByIdUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: DeleteCategoryUseCase,
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

        categoryController = module.get<CategoryController>(CategoryController);
        createCategoryUseCase = module.get<CreateCategoryUseCase>(
            CreateCategoryUseCase
        );

        editCategoryUseCase =
            module.get<EditCategoryUseCase>(EditCategoryUseCase);

        findCategoryByNameUseCase = module.get<FindCategoryByNameUseCase>(
            FindCategoryByNameUseCase
        );
        getAllCategoriesUseCase = module.get<GetAllCategoriesUseCase>(
            GetAllCategoriesUseCase
        );
        findCategoryByIdUseCase = module.get<FindCategoryByIdUseCase>(
            FindCategoryByIdUseCase
        );
        deleteCategoryUseCase = module.get<DeleteCategoryUseCase>(
            DeleteCategoryUseCase
        );
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("should create a category successfully", async () => {
        const mockCategory = makeCategory({ name: "CategoryName" });

        const mockResult = right({ category: mockCategory }) as Either<
            ResourceNotFoundError | null,
            { category: Category }
        >;
        vi.spyOn(createCategoryUseCase, "execute").mockResolvedValue(
            mockResult
        );

        const result = await categoryController.createCategory({
            name: "CategoryName",
        });

        expect(result).toEqual(mockResult.value);
        expect(createCategoryUseCase.execute).toHaveBeenCalledWith({
            name: "CategoryName",
        });
    });

    it("should handle errors thrown by CreateCategoryUseCase", async () => {
        vi.spyOn(createCategoryUseCase, "execute").mockImplementation(() => {
            throw new Error("CreateCategoryUseCase error");
        });

        try {
            await categoryController.createCategory({
                name: "CategoryWithError",
            });
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to create category");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should edit a category successfully", async () => {
        const mockCategory = makeCategory({ name: "CategoryName" });

        const mockResult = right({ category: mockCategory }) as Either<
            ResourceNotFoundError,
            { category: Category }
        >;
        vi.spyOn(editCategoryUseCase, "execute").mockResolvedValue(mockResult);

        const result = await categoryController.editCategory("category-1", {
            name: "UpdatedCategoryName",
        });

        expect(result).toEqual(mockResult.value);
        expect(editCategoryUseCase.execute).toHaveBeenCalledWith({
            categoryId: "category-1",
            name: "UpdatedCategoryName",
        });
    });

    it("should handle errors thrown by EditCategoryUseCase", async () => {
        vi.spyOn(editCategoryUseCase, "execute").mockImplementation(() => {
            throw new Error("EditCategoryUseCase error");
        });

        try {
            await categoryController.editCategory("category-1", {
                name: "UpdatedCategoryWithError",
            });
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to update category");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should find a brand by id successfully", async () => {
        const mockCategory = makeCategory();

        const mockResult = right({ category: mockCategory }) as Either<
            ResourceNotFoundError,
            { category: Category }
        >;
        vi.spyOn(findCategoryByIdUseCase, "execute").mockResolvedValue(
            mockResult
        );

        const result = await categoryController.findCategoryById("category-1");

        expect(result).toEqual(mockResult.value);
        expect(findCategoryByIdUseCase.execute).toHaveBeenCalledWith({
            id: "category-1",
        });
    });

    it("should handle errors thrown by FindCategoryByIdUseCase", async () => {
        vi.spyOn(findCategoryByIdUseCase, "execute").mockImplementation(() => {
            throw new Error("FindCategoryByIdUseCase error");
        });

        try {
            await categoryController.findCategoryById("CategoryWithError");
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to find category");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should find a category by name successfully", async () => {
        const mockCategory = makeCategory({ name: "CategoryName" });

        const mockResult = right({ category: mockCategory }) as Either<
            ResourceNotFoundError,
            { category: Category }
        >;

        vi.spyOn(findCategoryByNameUseCase, "execute").mockResolvedValue(
            mockResult
        );
        const result = await findCategoryByNameUseCase.execute({
            name: "CategoryName",
        });

        expect(result.value).toEqual(mockResult.value);
        expect(findCategoryByNameUseCase.execute).toHaveBeenCalledWith({
            name: "CategoryName",
        });
    });

    it("should handle errors thrown by FindCategoryByNameUseCase", async () => {
        vi.spyOn(findCategoryByNameUseCase, "execute").mockImplementation(
            () => {
                throw new HttpException(
                    "Failed to find category",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        );
        try {
            await categoryController.findCategoryByName("CategoryWithError");
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error instanceof HttpException).toBeTruthy();
                expect(error.message).toBe("Failed to find category");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should get all categories successfully", async () => {
        const mockCategories = Array.from({ length: 5 }, () => makeCategory());

        const mockResult = right(mockCategories) as Either<
            ResourceNotFoundError,
            Category[]
        >;

        vi.spyOn(getAllCategoriesUseCase, "execute").mockResolvedValue(
            mockResult
        );

        const result = await categoryController.getAllCategories({
            page: 1,
            pageSize: 10,
        });

        expect(result).toEqual({ categories: mockResult.value });
        expect(getAllCategoriesUseCase.execute).toHaveBeenCalledWith({
            page: 1,
            pageSize: 10,
        });
    });

    it("should handle errors thrown by GetAllCategoriesUseCase", async () => {
        vi.spyOn(getAllCategoriesUseCase, "execute").mockImplementation(() => {
            throw new Error("GetAllCategoriesUseCase error");
        });

        try {
            await categoryController.getAllCategories({
                page: 1,
                pageSize: 10,
            });
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to retrieve categories");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should delete a category successfully", async () => {
        const mockResult = right({}) as Either<ResourceNotFoundError, {}>;
        vi.spyOn(deleteCategoryUseCase, "execute").mockResolvedValue(
            mockResult
        );

        const result = await categoryController.deleteCategory("category-1");

        expect(result).toEqual({ message: "Category deleted successfully" });
        expect(deleteCategoryUseCase.execute).toHaveBeenCalledWith({
            categoryId: "category-1",
        });
    });

    it("should handle errors thrown by DeleteCategoryUseCase", async () => {
        vi.spyOn(deleteCategoryUseCase, "execute").mockImplementation(() => {
            throw new Error("DeleteCategoryUseCase error");
        });

        try {
            await categoryController.deleteCategory("CategoryWithError");
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to delete category");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });
});
