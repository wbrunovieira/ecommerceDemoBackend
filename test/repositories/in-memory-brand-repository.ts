import { Either, left, right } from "@/core/either";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { IBrandRepository } from "@/domain/catalog/application/repositories/i-brand-repository";
import { Brand } from "@/domain/catalog/enterprise/entities/brand";

function normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export class InMemoryBrandRepository implements IBrandRepository {
    public items: Brand[] = [];

    async create(brand: Brand): Promise<Either<Error, void>> {
        const existing = this.items.find(
            (b) => b.id.toString() === brand.id.toString()
        );
        if (existing) {
            return left(new Error("Brand already exists"));
        }
        this.items.push(brand);
        return right(undefined);
    }

    async findAll(params: PaginationParams): Promise<Either<Error, Brand[]>> {
        try {
            const { page, pageSize } = params;
            const startIndex = (page - 1) * pageSize;
            const paginatedItems = this.items.slice(
                startIndex,
                startIndex + pageSize
            );
            return right(paginatedItems);
        } catch (error) {
            return left(new Error("Failed to find brands"));
        }
    }

    async findById(id: string): Promise<Either<Error, Brand>> {
        const brand = this.items.find((item) => item.id.toString() === id);
        if (!brand) {
            return left(new Error("Brand not found"));
        }
        return right(brand);
    }

    async findByName(name: string): Promise<Either<Error, Brand>> {
        const normalizedName = normalizeName(name);
        const brand = this.items.find(
            (item) => normalizeName(item.name) === normalizedName
        );
        if (!brand) {
            return left(new Error("Brand not found"));
        }
        return right(brand);
    }

    async save(brand: Brand): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (b) => b.id.toString() === brand.id.toString()
        );
        if (index === -1) {
            return left(new Error("Brand not found"));
        }
        this.items[index] = brand;
        return right(undefined);
    }

    async delete(brand: Brand): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (b) => b.id.toString() === brand.id.toString()
        );
        if (index === -1) {
            return left(new Error("Brand not found"));
        }
        this.items.splice(index, 1);
        return right(undefined);
    }

    async addItems(...brands: Brand[]): Promise<void> {
        this.items.push(...brands);
    }
}
