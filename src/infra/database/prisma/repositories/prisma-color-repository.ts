import { PrismaService } from "@/prisma/prisma.service";
import { IColorRepository } from "@/domain/catalog/application/repositories/i-color-repository";
import { Color } from "@/domain/catalog/enterprise/entities/color";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

function normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

@Injectable()
export class PrismaColorRepository implements IColorRepository {
    constructor(private prisma: PrismaService) {}

    addItems(...colors: Color[]): void {
        throw new Error("Method not implemented.");
    }

    async findById(id: string): Promise<Either<Error, Color>> {
        try {
            const colorData = await this.prisma.color.findUnique({
                where: { id },
            });
            if (!colorData)
                return left(new ResourceNotFoundError("Color not found"));

            const color = Color.create(
                {
                    name: colorData.name,
                    hex: colorData.hex,
                    erpId: colorData.erpId || "",
                },
                new UniqueEntityID(colorData.id)
            );

            return right(color);
        } catch (error) {
            return left(new Error("Database error"));
        }
    }
    async findByName(name: string): Promise<Either<Error, Color>> {
        const normalizedName = normalizeName(name);
        try {
            const colorData = await this.prisma.color.findFirst({
                where: { name: normalizedName },
            });

            if (!colorData)
                return left(new ResourceNotFoundError("Color not found"));

            const color = Color.create(
                {
                    name: colorData.name,
                    hex: colorData.hex,
                    erpId: colorData.erpId || "",
                },
                new UniqueEntityID(colorData.id)
            );

            return right(color);
        } catch (error) {
            return left(new Error("Database error"));
        }
    }

    async create(color: Color): Promise<Either<Error, void>> {
        try {
            await this.prisma.color.create({
                data: {
                    id: color.id.toString(),
                    name: color.name,
                    hex: color.hex,
                    erpId: color.erpId,
                    createdAt: color.createdAt,
                    updatedAt: color.updatedAt,
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create color"));
        }
    }

    async delete(color: Color): Promise<Either<Error, void>> {
        try {
            const result = await this.prisma.color.delete({
                where: {
                    id: color.id.toString(),
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to delete color"));
        }
    }

    async findAll(params: PaginationParams): Promise<Either<Error, Color[]>> {
        try {
            const colors = await this.prisma.color.findMany({
                skip: (params.page - 1) * params.pageSize,
                take: params.pageSize,
            });
            const convertedColors = colors.map((b) =>
                Color.create(
                    { name: b.name, hex: b.hex, erpId: b.erpId || "" },
                    new UniqueEntityID(b.id)
                )
            );
            return right(convertedColors);
        } catch (error) {
            return left(new Error("Failed to find colors"));
        }
    }

    async save(color: Color): Promise<Either<Error, void>> {
        try {
            await this.prisma.color.update({
                where: {
                    id: color.id.toString(),
                },
                data: {
                    name: color.name,
                    hex: color.hex,
                    updatedAt: new Date(),
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to update color"));
        }
    }
}
