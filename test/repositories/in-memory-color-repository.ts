import { Either, left, right } from "@/core/either";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { IColorRepository } from "@/domain/catalog/application/repositories/i-color-repository";

import { Color } from "@/domain/catalog/enterprise/entities/color";

function normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export class InMemoryColorRepository implements IColorRepository {
    addItems(...colors: Color[]): void {
        throw new Error("Method not implemented.");
    }

    public items: Color[] = [];

    async create(color: Color): Promise<Either<Error, void>> {
        const existing = this.items.find(
            (b) => b.id.toString() === color.id.toString()
        );
        if (existing) {
            return left(new Error("Color already exists"));
        }
        this.items.push(color);
        return right(undefined);
    }

    async findByName(name: string): Promise<Either<Error, Color>> {
        const normalizedName = normalizeName(name);
        const color = this.items.find(
            (item) => normalizeName(item.name) === normalizedName
        );
        if (!color) {
            return left(new Error("Color not found"));
        }
        return right(color);
    }

    async findAll(params: PaginationParams): Promise<Either<Error, Color[]>> {
        const { page, pageSize } = params;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = this.items.slice(
            startIndex,
            startIndex + pageSize
        );
        return right(paginatedItems);
    }

    async save(color: Color): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (b) => b.id.toString() === color.id.toString()
        );
        if (index === -1) {
            return left(new Error("color not found"));
        }
        this.items[index] = color;
        return right(undefined);
    }

    async findById(id: string): Promise<Either<Error, Color>> {
        const color = this.items.find((item) => item.id.toString() === id);

        if (!color) {
            return left(new Error("Color not found"));
        }
        return right(color);
    }

    async delete(color: Color): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (b) => b.id.toString() === color.id.toString()
        );
        if (index === -1) {
            return left(new Error("Color not found"));
        }
        this.items.splice(index, 1);
        return right(undefined);
    }
}
