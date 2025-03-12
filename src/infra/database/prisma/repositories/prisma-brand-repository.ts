import { PrismaService } from "@/prisma/prisma.service";

import { PaginationParams } from "@/core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";
import { IBrandRepository } from "@/domain/catalog/application/repositories/i-brand-repository";
import { Brand } from "@/domain/catalog/enterprise/entities/brand";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

function normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

@Injectable()
export class PrismaBrandRepository implements IBrandRepository {
    constructor(private prisma: PrismaService) {}

    async create(brand: Brand): Promise<Either<Error, void>> {
        try {
            await this.prisma.brand.create({
                data: {
                    id: brand.id.toString(),
                    name: brand.name,
                    erpId: brand.erpId,
                    imageUrl: brand.imageUrl ?? undefined,
                    createdAt: brand.createdAt,
                    updatedAt: brand.updatedAt,
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create brand"));
        }
    }

    async findById(id: string): Promise<Either<Error, Brand>> {
        try {
            const brandData = await this.prisma.brand.findUnique({
                where: { id },
            });
            if (!brandData)
                return left(new ResourceNotFoundError("Brand not found"));

            const brand = Brand.create(
                {
                    name: brandData.name,
                    imageUrl: brandData.imageUrl ?? undefined,
                    erpId: brandData.erpId || "",
                },
                new UniqueEntityID(brandData.id)
            );

            return right(brand);
        } catch (error) {
            return left(new Error("Database error"));
        }
    }

    async findByName(name: string): Promise<Either<Error, Brand>> {
        // const normalizedName = normalizeName(name);
        console.log("PrismaBrandRepository normalizedName", name);
        try {
            console.log("PrismaBrandRepository name", name);

            const brandData = await this.prisma.brand.findFirst({
                where: { name: name },
            });
            console.log("PrismaBrandRepository brandData", brandData);

            if (!brandData)
                return left(new ResourceNotFoundError("Brand not found"));

            const brand = Brand.create(
                {
                    name: brandData.name,
                    imageUrl: brandData.imageUrl ?? undefined,
                    erpId: brandData.erpId || "",
                },
                new UniqueEntityID(brandData.id)
            );

            console.log("PrismaBrandRepository brand", brand);

            return right(brand);
        } catch (error) {
            return left(new Error("Database error"));
        }
    }

    async save(brand: Brand): Promise<Either<Error, void>> {
        try {
            await this.prisma.brand.update({
                where: {
                    id: brand.id.toString(),
                },
                data: {
                    name: brand.name,
                    imageUrl: brand.imageUrl,
                    erpId: brand.erpId || "",
                    updatedAt: new Date(),
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to update brand"));
        }
    }

    async delete(brand: Brand): Promise<Either<Error, void>> {
        try {
            const result = await this.prisma.brand.delete({
                where: {
                    id: brand.id.toString(),
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to delete brand"));
        }
    }

    async findAll(params: PaginationParams): Promise<Either<Error, Brand[]>> {
        try {
            const brands = await this.prisma.brand.findMany({
                skip: (params.page - 1) * params.pageSize,
                take: params.pageSize,
            });
            const convertedBrands = brands.map((b) =>
                Brand.create(
                    {
                        name: b.name,
                        imageUrl: b.imageUrl ?? undefined,
                        erpId: b.erpId || "",
                    },
                    new UniqueEntityID(b.id)
                )
            );
            return right(convertedBrands);
        } catch (error) {
            return left(new Error("Failed to find brands"));
        }
    }

    async addItems(brand: Brand) {
        console.log(brand);
    }
}
