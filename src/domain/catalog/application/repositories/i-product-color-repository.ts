import { Either } from "@/core/either";
import { ProductColor } from "../../enterprise/entities/product-color";

export abstract class IProductColorRepository {
    abstract create(
        productId: string,
        colorId: string
    ): Promise<Either<Error, void>>;
    abstract findByProductId(productId: string): Promise<ProductColor[]>;
    abstract findByColorId(ColorId: string): Promise<ProductColor[]>;
    abstract addItem(productColor: ProductColor): Promise<void>;
    abstract delete(productColor: ProductColor): Promise<void>;
}
