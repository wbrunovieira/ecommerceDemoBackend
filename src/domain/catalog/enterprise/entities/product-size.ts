import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

interface ProductSizeProps {
    productId: UniqueEntityID;
    sizeId: UniqueEntityID;
    createdAt: Date;
    updatedAt: Date;
}

export class ProductSize extends Entity<ProductSizeProps> {
    constructor(props: ProductSizeProps, id?: UniqueEntityID) {
        super(props, id);
    }

    get productId(): UniqueEntityID {
        return this.props.productId;
    }

    get sizeId(): UniqueEntityID {
        return this.props.sizeId;
    }

    static create(
        props: Optional<ProductSizeProps, "createdAt" | "updatedAt">,
        id?: UniqueEntityID
    ) {
        const productSize = new ProductSize(
            {
                ...props,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            id
        );

        return productSize;
    }
}
