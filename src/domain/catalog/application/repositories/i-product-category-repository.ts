import { Either } from "@/core/either";
import { ProductCategory } from "../../enterprise/entities/product-category";

export abstract class IProductCategoryRepository {
    abstract create(
        productId: string,
        categoryId: string
    ): Promise<Either<Error, void>>;
    abstract findByProductId(productId: string): Promise<ProductCategory[]>;
    abstract findByCategoyId(ColorId: string): Promise<ProductCategory[]>;
    abstract addItem(productcategory): void;
    abstract delete(productcategory: ProductCategory): Promise<void>;
}
