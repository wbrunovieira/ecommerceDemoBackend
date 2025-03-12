import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Either, left, right } from "@/core/either";
import { IProductColorRepository } from "@/domain/catalog/application/repositories/i-product-color-repository";
import { ProductColor } from "@/domain/catalog/enterprise/entities/product-color";

import { IColorRepository } from "@/domain/catalog/application/repositories/i-color-repository";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

export class InMemoryProductColorRepository implements IProductColorRepository {
    public items: ProductColor[] = [];

    constructor(
        private colorRepository: IColorRepository,
        private productRepository: IProductRepository
    ) {}

    async create(
        productId: string,
        colorId: string
    ): Promise<Either<Error, void>> {
        const productOrError = await this.productRepository.findById(productId);

        if (productOrError.isLeft()) {
            return left(new ResourceNotFoundError("Product not found"));
        }

        const colorOrError = await this.colorRepository.findById(colorId);

        if (colorOrError.isLeft()) {
            return left(new ResourceNotFoundError("Color not found"));
        }

        const productIdUnique = new UniqueEntityID(productId.toString());
        const colorIdUnique = new UniqueEntityID(colorId.toString());

        const now = new Date();

        const productColor = new ProductColor({
            productId: productIdUnique,
            colorId: colorIdUnique,
            createdAt: now,
            updatedAt: now,
        });

        this.items.push(productColor);
        return right(undefined);
    }

    async findByProductId(productId: string): Promise<ProductColor[]> {
        return this.items.filter(
            (item) => item.productId.toString() === productId
        );
    }

    async findByColorId(colorId: string): Promise<ProductColor[]> {
        return this.items.filter((item) => item.colorId.toString() === colorId);
    }

    async addItem(productColor: ProductColor): Promise<void> {
        this.items.push(productColor);
    }

    async delete(productColor: ProductColor): Promise<void> {
        this.items = this.items.filter(
            (item) =>
                item.productId.toString() !==
                    productColor.productId.toString() ||
                item.colorId.toString() !== productColor.colorId.toString()
        );
    }

    async deleteAllByProductId(productId: string): Promise<void> {
        this.items = this.items.filter(
            (item) => item.productId.toString() !== productId
        );
    }
}
