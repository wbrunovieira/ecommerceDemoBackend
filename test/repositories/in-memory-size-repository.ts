import { Either, left, right } from "@/core/either";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { ISizeRepository } from "@/domain/catalog/application/repositories/i-size-repository";

import { Size } from "@/domain/catalog/enterprise/entities/size";

function normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export class InMemorySizeRepository implements ISizeRepository {
    addItems(...sizes: Size[]): void {
        throw new Error("Method not implemented.");
    }
    public items: Size[] = [];

    async create(size: Size): Promise<Either<Error, void>> {
        const existing = this.items.find(
            (b) => b.id.toString() === size.id.toString()
        );
        if (existing) {
            return left(new Error("Size already exists"));
        }
        this.items.push(size);
        return right(undefined);
    }

    async findAll(params: PaginationParams): Promise<Either<Error, Size[]>> {
        try {
            const { page, pageSize } = params;
            const startIndex = (page - 1) * pageSize;
            const paginatedItems = this.items.slice(
                startIndex,
                startIndex + pageSize
            );
            return right(paginatedItems);
        } catch (error) {
            return left(new Error("Failed to find sizes"));
        }
    }

    async findById(id: string): Promise<Either<Error, Size>> {
        const size = this.items.find((item) => item.id.toString() === id);

        if (!size) {
            return left(new Error("Size not found"));
        }
        return right(size);
    }

    async findByName(name: string): Promise<Either<Error, Size>> {
        const normalizedName = normalizeName(name);
        const size = this.items.find(
            (item) => normalizeName(item.name) === normalizedName
        );
        if (!size) {
            return left(new Error("Size not found"));
        }
        return right(size);
    }

    async save(size: Size): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (b) => b.id.toString() === size.id.toString()
        );
        if (index === -1) {
            return left(new Error("Size not found"));
        }
        this.items[index] = size;
        return right(undefined);
    }

    async delete(size: Size): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (b) => b.id.toString() === size.id.toString()
        );
        if (index === -1) {
            return left(new Error("Size not found"));
        }
        this.items.splice(index, 1);
        return right(undefined);
    }
}
