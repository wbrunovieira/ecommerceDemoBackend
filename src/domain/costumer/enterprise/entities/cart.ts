import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

interface CartProps {
    productsId: UniqueEntityID[];
    total: number;
    userId: UniqueEntityID;
    createdAt: Date;
    updatedAt: Date;
}

export class Cart extends Entity<CartProps> {
    get productsId(): UniqueEntityID[] {
        return this.props.productsId;
    }

    get total(): number {
        return this.props.total;
    }

    get userId(): UniqueEntityID {
        return this.props.userId;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    private touch() {
        this.props.updatedAt = new Date();
    }

    static create(
        props: Optional<CartProps, "createdAt" | "updatedAt">,
        id?: UniqueEntityID
    ) {
        const cart = new Cart(
            {
                ...props,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            id
        );

        return cart;
    }
}
