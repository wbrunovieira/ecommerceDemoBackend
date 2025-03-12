import {
    Body,
    Controller,
    Post,
    Get,
    Query,
    HttpStatus,
    HttpException,
    Param,
    BadRequestException,
    Delete,
    Put,
    UseGuards,
} from "@nestjs/common";

import { CreateCategoryUseCase } from "@/domain/catalog/application/use-cases/create-category";

import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import { z } from "zod";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { EditCategoryUseCase } from "@/domain/catalog/application/use-cases/edit-category";
import { FindCategoryByIdUseCase } from "@/domain/catalog/application/use-cases/find-category-by-id";
import { FindCategoryByNameUseCase } from "@/domain/catalog/application/use-cases/find-category-by-name";
import { GetAllCategoriesUseCase } from "@/domain/catalog/application/use-cases/get-all-categories";
import { left } from "@/core/either";
import { DeleteCategoryUseCase } from "@/domain/catalog/application/use-cases/delete-category";
import { GetCategoriesWithProductsUseCase } from "@/domain/catalog/application/use-cases/get-all-categories-with-product";

const createCategorySchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(20, "Name must not exceed 20 characters"),
    imageUrl: z
        .string()
        .url("Invalid URL format")
        .nonempty("Image URL must not be empty"),
    erpId: z.string().optional(),
});
const bodyValidationPipe = new ZodValidationsPipe(createCategorySchema);
type CreateCategoryBodySchema = z.infer<typeof createCategorySchema>;

const editCategorySchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(20, "Name must not exceed 20 characters"),
    imageUrl: z.string().nonempty("Image URL must not be empty"),
    erpId: z.string().optional(),
});
const editBodyValidationPipe = new ZodValidationsPipe(editCategorySchema);
type EditCategoryBodySchema = z.infer<typeof editCategorySchema>;

const paginationParamsSchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
    pageSize: z.preprocess(
        (val) => Number(val),
        z.number().min(1).max(100).default(10)
    ),
});
const paginationPipe = new ZodValidationsPipe(paginationParamsSchema);
type PaginationParams = z.infer<typeof paginationParamsSchema>;

@Controller("category")
export class CategoryController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly editCategoryUseCase: EditCategoryUseCase,
        private readonly findCategoryByIdUseCase: FindCategoryByIdUseCase,
        private readonly getAllCategoriesUseCase: GetAllCategoriesUseCase,
        private readonly getAllCategoriesWithProductsUseCase: GetCategoriesWithProductsUseCase,
        private readonly findCategoryByNameUseCase: FindCategoryByNameUseCase,
        private readonly deleteCategoryUseCase: DeleteCategoryUseCase
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createCategory(
        @Body(bodyValidationPipe) body: CreateCategoryBodySchema
    ) {
        try {
            const result = await this.createCategoryUseCase.execute({
                name: body.name,
                imageUrl: body.imageUrl,
                erpId: body.erpId || "undefined",
            });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.BAD_REQUEST
                    );
                }
            } else {
                return { category: result.value.category };
            }
        } catch (error) {
            console.error("Erro ao criar category:", error);
            throw new HttpException(
                "Failed to create category",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put(":categoryId")
    async editCategory(
        @Param("categoryId") categoryId: string,
        @Body(editBodyValidationPipe) body: EditCategoryBodySchema
    ) {
        try {
            const result = await this.editCategoryUseCase.execute({
                categoryId,
                name: body.name,
                imageUrl: body.imageUrl,
            });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.BAD_REQUEST
                    );
                }
            } else {
                return { category: result.value.category };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(
                "Failed to update category",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("all")
    async getAllCategories(@Query(paginationPipe) params: PaginationParams) {
        try {
            const result = await this.getAllCategoriesUseCase.execute(params);

            if (result.isLeft()) {
                throw new HttpException(
                    "Failed to find categories",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                return { categories: result.value };
            }
        } catch (error) {
            return left(new Error("Repository error"));
        }
    }

    @Get("all-withProducts")
    async getAllCategoriesWithProducts(
        @Query(paginationPipe) params: PaginationParams
    ) {
        try {
            const result =
                await this.getAllCategoriesWithProductsUseCase.execute(params);

            if (result.isLeft()) {
                throw new HttpException(
                    "Failed to find categories",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                return { categories: result.value };
            }
        } catch (error) {
            return left(new Error("Repository error"));
        }
    }

    @Get(":id")
    async findCategoryById(@Param("id") id: string) {
        try {
            const result = await this.findCategoryByIdUseCase.execute({ id });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }
            } else {
                return { category: result.value.category };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to find category",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get()
    async findCategoryByName(@Query("name") name: string) {
        try {
            const result = await this.findCategoryByNameUseCase.execute({
                name,
            });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }
            } else {
                return { category: result.value.category };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to find category",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    async deleteCategory(@Param("id") id: string) {
        try {
            const result = await this.deleteCategoryUseCase.execute({
                categoryId: id,
            });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }
            } else {
                return { message: "Category deleted successfully" };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to delete category",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
