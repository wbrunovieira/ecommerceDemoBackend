import {
    Body,
    Controller,
    Post,
    HttpStatus,
    HttpException,
    UseGuards,
    Put,
    Param,
    Get,
    Query,
    Delete,
} from "@nestjs/common";
import { z } from "zod";
import { ZodValidationsPipe } from "../../../pipes/zod-validations-pipe";
import { CreateBrandUseCase } from "@/domain/catalog/application/use-cases/create-brand";

import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { EditBrandUseCase } from "@/domain/catalog/application/use-cases/edit-brand";
import { FindBrandByNameUseCase } from "@/domain/catalog/application/use-cases/find-brand-by-name";
import { GetAllBrandsUseCase } from "@/domain/catalog/application/use-cases/get-all-brands";
import { left } from "@/core/either";
import { FindBrandByIdUseCase } from "@/domain/catalog/application/use-cases/find-brand-by-id";
import { DeleteBrandUseCase } from "@/domain/catalog/application/use-cases/delete-brand";

const createBrandSchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(50, "Name must not exceed 50 characters"),
    imageUrl: z.string().nonempty("Image URL must not be empty"),
    erpId: z.string().optional(),
});
const bodyValidationPipe = new ZodValidationsPipe(createBrandSchema);
type CreateBrandBodySchema = z.infer<typeof createBrandSchema>;

const editBrandSchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(50, "Name must not exceed 50 characters"),
    imageUrl: z.string().nonempty("Image URL must not be empty"),
});
const editBodyValidationPipe = new ZodValidationsPipe(editBrandSchema);
type EditBrandBodySchema = z.infer<typeof editBrandSchema>;

const paginationParamsSchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
    pageSize: z.preprocess(
        (val) => Number(val),
        z.number().min(1).max(100).default(10)
    ),
});
const paginationPipe = new ZodValidationsPipe(paginationParamsSchema);
type PaginationParams = z.infer<typeof paginationParamsSchema>;

@Controller("brands")
export class BrandController {
    constructor(
        private readonly createBrandUseCase: CreateBrandUseCase,
        private readonly editBrandUseCase: EditBrandUseCase,
        private readonly findBrandByNameUseCase: FindBrandByNameUseCase,
        private readonly getAllBrandsUseCase: GetAllBrandsUseCase,
        private readonly findBrandByIdUseCase: FindBrandByIdUseCase,
        private readonly deleteBrandUseCase: DeleteBrandUseCase
    ) {}

    @Post()
    async createBrand(@Body(bodyValidationPipe) body: CreateBrandBodySchema) {
        try {
            const result = await this.createBrandUseCase.execute({
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
                return { brand: result.value.brand };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(
                "Failed to create brand",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put(":brandId")
    async editBrand(
        @Param("brandId") brandId: string,
        @Body(editBodyValidationPipe) body: EditBrandBodySchema
    ) {
        try {
            const result = await this.editBrandUseCase.execute({
                brandId,
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
                return { brand: result.value.brand };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(
                "Failed to update brand",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("all")
    async getAllBrands(@Query(paginationPipe) params: PaginationParams) {
        try {
            const result = await this.getAllBrandsUseCase.execute(params);
            if (result.isLeft()) {
                throw new HttpException(
                    "Failed to find brands",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                return { brands: result.value };
            }
        } catch (error) {
            return left(new Error("Repository error"));
        }
    }

    @Get("name")
    async findBrandByName(@Query("name") name: string) {
        try {
            console.log("Get findBrandByName name", name);
            const result = await this.findBrandByNameUseCase.execute({ name });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }
            } else {
                return { brand: result.value.brand };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to find brand",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(":id")
    async findBrandById(@Param("id") id: string) {
        try {
            const result = await this.findBrandByIdUseCase.execute({ id });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }
            } else {
                return { brand: result.value.brand };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to find brand",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    async deleteBrand(@Param("id") id: string) {
        try {
            const result = await this.deleteBrandUseCase.execute({
                brandId: id,
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
                return { message: "Brand deleted successfully" };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to delete brand",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
