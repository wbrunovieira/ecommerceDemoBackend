import { PrismaService } from "@/prisma/prisma.service";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";
import { ISizeRepository } from "@/domain/catalog/application/repositories/i-size-repository";
import { Size } from "@/domain/catalog/enterprise/entities/size";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

function normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

@Injectable()
export class PrismaSizeRepository implements ISizeRepository {
    constructor(private prisma: PrismaService) {}

    addItems(...sizes: Size[]): void {
        throw new Error("Method not implemented.");
    }

    async create(size: Size): Promise<Either<Error, void>> {
        try {
            await this.prisma.size.create({
                data: {
                    id: size.id.toString(),
                    name: size.name,
                    erpId: size.erpId,
                    createdAt: size.createdAt,
                    updatedAt: size.updatedAt,
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create size"));
        }
    }

    async findById(id: string): Promise<Either<Error, Size>> {
        try {
            const sizeData = await this.prisma.size.findUnique({
                where: { id },
            });
            if (!sizeData)
                return left(new ResourceNotFoundError("Size not found"));

            const size = Size.create(
                { name: sizeData.name, erpId: sizeData.erpId || "" },
                new UniqueEntityID(sizeData.id)
            );

            return right(size);
        } catch (error) {
            return left(new Error("Database error"));
        }
    }

    async findByName(name: string): Promise<Either<Error, Size>> {
        const normalizedName = normalizeName(name);
        try {
            const sizeData = await this.prisma.size.findFirst({
                where: { name: normalizedName },
            });

            if (!sizeData)
                return left(new ResourceNotFoundError("Size not found"));

            const size = Size.create(
                { name: sizeData.name, erpId: sizeData.erpId || "" },
                new UniqueEntityID(sizeData.id)
            );

            return right(size);
        } catch (error) {
            return left(new Error("Database error"));
        }
    }

    async save(size: Size): Promise<Either<Error, void>> {
        try {
            await this.prisma.size.update({
                where: {
                    id: size.id.toString(),
                },
                data: {
                    name: size.name,
                    updatedAt: new Date(),
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to update size"));
        }
    }

    async delete(size: Size): Promise<Either<Error, void>> {
        try {
            const result = await this.prisma.size.delete({
                where: {
                    id: size.id.toString(),
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to delete size"));
        }
    }

    async findAll(params: PaginationParams): Promise<Either<Error, Size[]>> {
        try {
            const sizes = await this.prisma.size.findMany({
                skip: (params.page - 1) * params.pageSize,
                take: params.pageSize,
            });
            const convertedSizes = sizes.map((b) =>
                Size.create(
                    { name: b.name, erpId: b.erpId || "" },
                    new UniqueEntityID(b.id)
                )
            );
            return right(convertedSizes);
        } catch (error) {
            return left(new Error("Failed to find sizes"));
        }
    }
}
