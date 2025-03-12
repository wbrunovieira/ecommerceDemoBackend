import { Either } from "../../../../core/either";
import { ProductVariant } from "../../enterprise/entities/product-variant";
import { ResourceNotFoundError } from "../use-cases/errors/resource-not-found-error";

export abstract class IProductVariantRepository {
    abstract create(
        productVariant: ProductVariant
    ): Promise<Either<Error, void>>;
    abstract findByProductId(
        productId: string
    ): Promise<Either<ResourceNotFoundError, ProductVariant[]>>;

    abstract findByProductIds(productIds: string[]): Promise<ProductVariant[]>;
    abstract findById(
        id: string
    ): Promise<Either<ResourceNotFoundError, ProductVariant>>;
    abstract update(
        variant: ProductVariant
    ): Promise<Either<ResourceNotFoundError, void>>;
}
