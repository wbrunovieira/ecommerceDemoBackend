import { Either, left, right } from "@/core/either";
import { PaginationParams } from "@/core/repositories/pagination-params";

import { ICategoryRepository } from "@/domain/catalog/application/repositories/i-category-repository";

import { Category } from "@/domain/catalog/enterprise/entities/category";

function normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export class InMemoryCategoryRepository implements ICategoryRepository {
    addItems(...categories: Category[]): void {
        throw new Error("Method not implemented.");
    }
    public items: Category[] = [];
    public productCategories: { categoryId: string; productId: string }[] = [];

    clearProductCategories(): void {
        this.productCategories = [];
    }

    async findCategoriesWithProducts(): Promise<Either<Error, Category[]>> {
        try {
            const categoriesWithProducts = this.items.filter((category) =>
                this.productCategories.some(
                    (pc) => pc.categoryId === category.id.toString()
                )
            );

            if (categoriesWithProducts.length === 0) {
                return left(new Error("No categories with products found"));
            }

            return right(categoriesWithProducts);
        } catch (error) {
            return left(new Error("Failed to find categories with products"));
        }
    }

    addProductCategory(productCategory: {
        categoryId: string;
        productId: string;
    }): void {
        this.productCategories.push(productCategory);
    }

    async findAll(
        params: PaginationParams
    ): Promise<Either<Error, Category[]>> {
        try {
            const { page, pageSize } = params;
            const startIndex = (page - 1) * pageSize;
            const paginatedItems = this.items.slice(
                startIndex,
                startIndex + pageSize
            );
            return right(paginatedItems);
        } catch (error) {
            return left(new Error("Failed to find category"));
        }
    }

    async findByName(name: string): Promise<Either<Error, Category>> {
        const normalizedName = normalizeName(name);
        const category = this.items.find(
            (item) => normalizeName(item.name) === normalizedName
        );
        if (!category) {
            return left(new Error("Category not found"));
        }
        return right(category);
    }

    async save(category: Category): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (b) => b.id.toString() === category.id.toString()
        );
        if (index === -1) {
            return left(new Error("Category not found"));
        }
        this.items[index] = category;
        return right(undefined);
    }

    async findById(id: string): Promise<Either<Error, Category>> {
        const category = this.items.find((item) => item.id.toString() === id);

        if (!category) {
            return left(new Error("Category not found"));
        }
        return right(category);
    }

    async delete(category: Category): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (b) => b.id.toString() === category.id.toString()
        );
        if (index === -1) {
            return left(new Error("Category not found"));
        }
        this.items.splice(index, 1);
        return right(undefined);
    }

    async create(category: Category): Promise<Either<Error, void>> {
        const existing = this.items.find(
            (b) => b.id.toString() === category.id.toString()
        );
        if (existing) {
            return left(new Error("Category already exists"));
        }
        this.items.push(category);
        return right(undefined);
    }
}
