import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface ProductColorProps {
    productId: UniqueEntityID;
    colorId: UniqueEntityID;
    createdAt: Date;
    updatedAt: Date;
}

export class ProductColor extends Entity<ProductColorProps> {
    constructor(props: ProductColorProps, id?: UniqueEntityID) {
        super(props, id);
    }

    get productId(): UniqueEntityID {
        return this.props.productId;
    }

    get colorId(): UniqueEntityID {
        return this.props.colorId;
    }

    static create(
        props: Optional<ProductColorProps, "createdAt" | "updatedAt">,
        id?: UniqueEntityID
    ) {
        const productColor = new ProductColor(
            {
                ...props,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            id
        );

        return productColor;
    }
}
