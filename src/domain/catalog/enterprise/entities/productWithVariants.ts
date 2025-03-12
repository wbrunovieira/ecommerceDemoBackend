import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Product } from "./product";
import { ProductVariant } from "./product-variant";

interface ProductWithVariantsProps {
    product: Product;
    productVariants: ProductVariant[];
}

export class ProductWithVariants extends Entity<ProductWithVariantsProps> {
    get product(): Product {
        return this.props.product;
    }

    get productVariants(): ProductVariant[] {
        return this.props.productVariants;
    }

    static create(props: ProductWithVariantsProps, id?: UniqueEntityID) {
        return new ProductWithVariants(props, id);
    }
}
