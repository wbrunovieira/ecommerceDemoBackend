import { ProductSize } from "@/domain/catalog/enterprise/entities/product-size";

import { IProductSizeRepository } from "@/domain/catalog/application/repositories/i-product-size-repository";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Either, left, right } from "@/core/either";

export class InMemoryProductSizeRepository implements IProductSizeRepository {
    public items: ProductSize[] = [];

    async create(
        productId: string,
        sizeId: string
    ): Promise<Either<Error, void>> {
        const productIdUnique = new UniqueEntityID(productId);
        const sizeIdUnique = new UniqueEntityID(sizeId);

        const productSize = new ProductSize({
            productId: productIdUnique,
            sizeId: sizeIdUnique,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        this.items.push(productSize);
        return right(undefined);
    }

    async findByProductId(productId: string): Promise<ProductSize[]> {
        return this.items.filter(
            (item) => item.productId.toString() === productId
        );
    }

    async findBySizeId(sizeId: string): Promise<ProductSize[]> {
        return this.items.filter((item) => item.sizeId.toString() === sizeId);
    }

    async addItem(productSize: ProductSize): Promise<void> {
        this.items.push(productSize);
    }

    async delete(productSize: ProductSize): Promise<void> {
        this.items = this.items.filter(
            (item) =>
                item.productId.toString() !==
                    productSize.productId.toString() ||
                item.sizeId.toString() !== productSize.sizeId.toString()
        );
    }
    async deleteAllByProductId(productId: string): Promise<void> {
        this.items = this.items.filter(
            (item) => item.productId.toString() !== productId
        );
    }
}
