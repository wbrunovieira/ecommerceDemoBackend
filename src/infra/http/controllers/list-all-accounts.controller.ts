import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { ZodValidationsPipe } from "../../../pipes/zod-validations-pipe";
import { PrismaService } from "@/prisma/prisma.service";
import { z } from "zod";

const pageQueryParamSchema = z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationsPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller("/accounts")
@UseGuards(JwtAuthGuard)
export class ListAllAccountsController {
    constructor(private prisma: PrismaService) {}

    @Get()
    async handle(
        @Query("page", queryValidationPipe) page: PageQueryParamSchema
    ) {
        const perPage = 10;

        const accounts = await this.prisma.user.findMany({
            take: perPage,
            skip: (page - 1) * perPage,
            orderBy: {
                name: "asc",
            },
        });

        return { accounts };
    }
}
