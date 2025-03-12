import { PrismaService } from "@/prisma/prisma.service";

import { PaginationParams } from "@/core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";

import { ICategoryRepository } from "@/domain/catalog/application/repositories/i-category-repository";
import { Category } from "@/domain/catalog/enterprise/entities/category";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

function normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
    constructor(private prisma: PrismaService) {}
    addItems(...categories: Category[]): void {
        throw new Error("Method not implemented.");
    }

    async findById(id: string): Promise<Either<Error, Category>> {
        try {
            console.log("primsa category findById id", id);

            const categoryData = await this.prisma.category.findUnique({
                where: { id: id },
            });

            console.log("primsa category findById categoryData", categoryData);
            if (!categoryData)
                return left(new ResourceNotFoundError("Category not found"));

            const category = Category.create(
                {
                    name: categoryData.name,
                    imageUrl: categoryData.imageUrl,
                    erpId: categoryData.erpId || "",
                },
                new UniqueEntityID(categoryData.id)
            );

            return right(category);
        } catch (error) {
            return left(new Error("Database error"));
        }
    }

    async save(category: Category): Promise<Either<Error, void>> {
        try {
            await this.prisma.category.update({
                where: {
                    id: category.id.toString(),
                },
                data: {
                    name: category.name,
                    imageUrl: category.imageUrl,
                    updatedAt: new Date(),
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to update category"));
        }
    }

    async create(category: Category): Promise<Either<Error, void>> {
        try {
            await this.prisma.category.create({
                data: {
                    id: category.id.toString(),
                    name: category.name,
                    imageUrl: category.imageUrl,
                    erpId: category.erpId,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt,
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create category"));
        }
    }

    async delete(category: Category): Promise<Either<Error, void>> {
        try {
            const result = await this.prisma.category.delete({
                where: {
                    id: category.id.toString(),
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to delete category"));
        }
    }

    async findByName(name: string): Promise<Either<Error, Category>> {
        const normalizedName = normalizeName(name);
        try {
            const categoryData = await this.prisma.category.findFirst({
                where: { name: normalizedName },
            });

            if (!categoryData)
                return left(new ResourceNotFoundError("Category not found"));

            const category = Category.create(
                {
                    name: categoryData.name,
                    imageUrl: categoryData.imageUrl,
                    erpId: categoryData.erpId || "",
                },
                new UniqueEntityID(categoryData.id)
            );

            return right(category);
        } catch (error) {
            return left(new Error("Database error"));
        }
    }

    async findAll(
        params: PaginationParams
    ): Promise<Either<Error, Category[]>> {
        try {
            const category = await this.prisma.category.findMany({
                skip: (params.page - 1) * params.pageSize,
                take: params.pageSize,
            });

            const convertedCategory = category.map((b) =>
                Category.create(
                    {
                        name: b.name,
                        imageUrl: b.imageUrl,
                        erpId: b.erpId || "",
                    },
                    new UniqueEntityID(b.id)
                )
            );

            return right(convertedCategory);
        } catch (error) {
            return left(new Error("Failed to find categories"));
        }
    }

    async findCategoriesWithProducts(): Promise<Either<Error, Category[]>> {
        try {
            const categories = await this.prisma.category.findMany({
                where: {
                    productCategories: {
                        some: {},
                    },
                },
                include: {
                    productCategories: true,
                },
            });

            if (categories.length === 0) {
                return left(
                    new ResourceNotFoundError(
                        "No categories with products found"
                    )
                );
            }

            const convertedCategories = categories.map((category) =>
                Category.create(
                    {
                        name: category.name,
                        imageUrl: category.imageUrl,
                        erpId: category.erpId || "",
                    },
                    new UniqueEntityID(category.id)
                )
            );

            return right(convertedCategories);
        } catch (error) {
            return left(new Error("Failed to find categories with products"));
        }
    }
}
