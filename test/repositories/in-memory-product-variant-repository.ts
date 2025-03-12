import { Either, left, right } from "@/core/either";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { ProductVariant } from "@/domain/catalog/enterprise/entities/product-variant";

export class InMemoryProductVariantRepository
    implements IProductVariantRepository
{
    public items: ProductVariant[] = [];

    async findById(
        id: string
    ): Promise<Either<ResourceNotFoundError, ProductVariant>> {
        const variant = this.items.find((item) => item.id.toString() === id);
        if (!variant) {
            return left(
                new ResourceNotFoundError(
                    `Product variant not found for ID: ${id}`
                )
            );
        }
        return right(variant);
    }

    async update(
        variant: ProductVariant
    ): Promise<Either<ResourceNotFoundError, void>> {
        const index = this.items.findIndex(
            (item) => item.id.toString() === variant.id.toString()
        );
        if (index === -1) {
            return left(
                new ResourceNotFoundError(
                    `Product variant not found for ID: ${variant.id}`
                )
            );
        }
        this.items[index] = variant;
        return right(undefined);
    }

    async create(productVariant: ProductVariant): Promise<Either<Error, void>> {
        try {
            this.items.push(productVariant);
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create product variant"));
        }
    }

    async findByProductId(
        productId: string
    ): Promise<Either<ResourceNotFoundError, ProductVariant[]>> {
        const variants = this.items.filter(
            (item) => item.productId.toString() === productId
        );
        if (variants.length === 0) {
            return left(
                new ResourceNotFoundError(
                    `No product variants found for product ID: ${productId}`
                )
            );
        }
        return right(variants);
    }

    async findByProductIds(productIds: string[]): Promise<ProductVariant[]> {
        return this.items.filter((item) =>
            productIds.includes(item.productId.toString())
        );
    }
}
