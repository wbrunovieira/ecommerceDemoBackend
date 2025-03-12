import { Either } from "@/core/either";
import { ProductSize } from "../../enterprise/entities/product-size";

export abstract class IProductSizeRepository {
    abstract create(
        productId: string,
        sizeId: string
    ): Promise<Either<Error, void>>;
    abstract findByProductId(productId: string): Promise<ProductSize[]>;
    abstract findBySizeId(sizeId: string): Promise<ProductSize[]>;
    abstract addItem(ProductSize): void;
    abstract delete(productSize: ProductSize): Promise<void>;
    // deleteAllByProductId(productId: string): Promise<void>;
}
