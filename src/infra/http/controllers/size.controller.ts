import {
    Body,
    Controller,
    Post,
    Get,
    Query,
    HttpStatus,
    HttpException,
    Param,
    Put,
    UseGuards,
    Delete,
} from "@nestjs/common";

import { CreateSizeUseCase } from "@/domain/catalog/application/use-cases/create-size";

import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { EditSizeUseCase } from "@/domain/catalog/application/use-cases/edit-size";
import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import { z } from "zod";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { FindSizeByIdUseCase } from "@/domain/catalog/application/use-cases/find-size-by-id";
import { GetAllSizesUseCase } from "@/domain/catalog/application/use-cases/get-all-sizes";
import { left } from "@/core/either";
import { DeleteSizeUseCase } from "@/domain/catalog/application/use-cases/delete-size";

const createSizeSchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(10, "Name must not exceed 10 characters"),
    erpId: z.string().optional(),
});
const bodyValidationPipe = new ZodValidationsPipe(createSizeSchema);
type CreateSizeBodySchema = z.infer<typeof createSizeSchema>;

const editSizeSchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(50, "Name must not exceed 50 characters"),
});
const editBodyValidationPipe = new ZodValidationsPipe(editSizeSchema);
type EditSizeBodySchema = z.infer<typeof editSizeSchema>;

const paginationParamsSchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
    pageSize: z.preprocess(
        (val) => Number(val),
        z.number().min(1).max(100).default(10)
    ),
});
const paginationPipe = new ZodValidationsPipe(paginationParamsSchema);
type PaginationParams = z.infer<typeof paginationParamsSchema>;

@Controller("size")
export class SizeController {
    constructor(
        private readonly createSizeUseCase: CreateSizeUseCase,
        private readonly ediySizeUseCase: EditSizeUseCase,
        private readonly findSizeByIdUseCase: FindSizeByIdUseCase,
        private readonly getAllSizesUseCase: GetAllSizesUseCase,
        private readonly deleteSizeUseCase: DeleteSizeUseCase
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createSize(@Body(bodyValidationPipe) body: CreateSizeBodySchema) {
        try {
            const result = await this.createSizeUseCase.execute({
                name: body.name,
                erpId: body.erpId || "undefined",
            });
            return result.value;
        } catch (error) {
            console.error("Erro ao criar tamanho:", error);
            throw new HttpException(
                "Failed to create size",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put(":sizeId")
    async editSize(
        @Param("sizeId") sizeId: string,
        @Body(editBodyValidationPipe) body: EditSizeBodySchema
    ) {
        try {
            const result = await this.ediySizeUseCase.execute({
                sizeId,
                name: body.name,
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
                return { size: result.value.size };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(
                "Failed to update size",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("all")
    async getAllSizes(@Query(paginationPipe) params: PaginationParams) {
        try {
            const result = await this.getAllSizesUseCase.execute(params);
            if (result.isLeft()) {
                throw new HttpException(
                    "Failed to find sizes",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                return { size: result.value };
            }
        } catch (error) {
            return left(new Error("Repository error"));
        }
    }

    @Get(":id")
    async findSizeById(@Param("id") id: string) {
        try {
            const result = await this.findSizeByIdUseCase.execute({ id });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }
            } else {
                return { size: result.value.size };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to find size",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    async deleteSize(@Param("id") id: string) {
        try {
            const result = await this.deleteSizeUseCase.execute({ sizeId: id });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }
            } else {
                return { message: "Size deleted successfully" };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to delete size",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
