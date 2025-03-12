import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface ProductCategoryProps {
    productId: UniqueEntityID;
    categoryId: UniqueEntityID;
    createdAt: Date;
    updatedAt: Date;
}

export class ProductCategory extends Entity<ProductCategoryProps> {
    constructor(props: ProductCategoryProps, id?: UniqueEntityID) {
        super(props, id);
    }

    get productId(): UniqueEntityID {
        return this.props.productId;
    }

    get categoryId(): UniqueEntityID {
        return this.props.categoryId;
    }

    static create(
        props: Optional<ProductCategoryProps, "createdAt" | "updatedAt">,
        id?: UniqueEntityID
    ) {
        const productCategory = new ProductCategory(
            {
                ...props,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            id
        );

        return productCategory;
    }
}
