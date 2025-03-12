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
import { CreateColorUseCase } from "@/domain/catalog/application/use-cases/create-color";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import { z } from "zod";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { EditColorUseCase } from "@/domain/catalog/application/use-cases/edit-color";
import { FindColorByIdUseCase } from "@/domain/catalog/application/use-cases/find-color-by-id";
import { FindColorByNameUseCase } from "@/domain/catalog/application/use-cases/find-color-by-name";
import { GetAllColorsUseCase } from "@/domain/catalog/application/use-cases/get-all-colors";
import { DeleteColorUseCase } from "@/domain/catalog/application/use-cases/delete-color";
import { left } from "@/core/either";

const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;

const createColorSchema = z.object({
    name: z
        .string()
        .min(1, "Color must not be empty")
        .max(50, "Color must not exceed 20 characters"),
    hex: z.string().regex(hexColorRegex, "Invalid hex color format"),
    erpId: z.string().optional(),
});
const bodyValidationPipe = new ZodValidationsPipe(createColorSchema);
type CreateColorBodySchema = z.infer<typeof createColorSchema>;

const editColorSchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(50, "Name must not exceed 20 characters"),
    hex: z.string().regex(hexColorRegex, "Invalid hex color format"),
});
const editBodyValidationPipe = new ZodValidationsPipe(editColorSchema);
type EditColorBodySchema = z.infer<typeof editColorSchema>;

const paginationParamsSchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
    pageSize: z.preprocess(
        (val) => Number(val),
        z.number().min(1).max(100).default(10)
    ),
});
const paginationPipe = new ZodValidationsPipe(paginationParamsSchema);
type PaginationParams = z.infer<typeof paginationParamsSchema>;

@Controller("colors")
export class ColorsController {
    constructor(
        private readonly createColorUseCase: CreateColorUseCase,
        private readonly editColorUseCase: EditColorUseCase,
        private readonly findByIdColorUseCase: FindColorByIdUseCase,
        private readonly findColorByNameUseCase: FindColorByNameUseCase,
        private readonly deleteColorUseCase: DeleteColorUseCase,
        private readonly getAllColorUseCase: GetAllColorsUseCase
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createColor(@Body(bodyValidationPipe) body: CreateColorBodySchema) {
        try {
            const result = await this.createColorUseCase.execute({
                name: body.name,
                hex: body.hex,
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
                return { color: result.value.color };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(
                "Failed to create color",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put(":colorId")
    @UseGuards(JwtAuthGuard, RolesGuard)
    async editColor(
        @Param("colorId") colorId: string,
        @Body(editBodyValidationPipe) body: EditColorBodySchema
    ) {
        try {
            const result = await this.editColorUseCase.execute({
                colorId,
                name: body.name,
                hex: body.hex,
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
                return { color: result.value.color };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(
                "Failed to update color",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get()
    async findColorByName(@Query("name") name: string) {
        try {
            const result = await this.findColorByNameUseCase.execute({ name });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }
            } else {
                return { color: result.value.color };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to find color",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("all")
    async getAllColors(@Query(paginationPipe) params: PaginationParams) {
        try {
            const result = await this.getAllColorUseCase.execute(params);
            if (result.isLeft()) {
                throw new HttpException(
                    "Failed to find colors",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                return { colors: result.value };
            }
        } catch (error) {
            return left(new Error("Repository error"));
        }
    }

    @Get(":id")
    async findColorById(@Param("id") id: string) {
        try {
            const result = await this.findByIdColorUseCase.execute({ id });
            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }
            } else {
                return { color: result.value.color };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to find color",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    async deleteColor(@Param("id") id: string) {
        try {
            const result = await this.deleteColorUseCase.execute({
                colorId: id,
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
                return { message: "Color deleted successfully" };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to delete color",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
