import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

interface CustomerProps {
    userId: UniqueEntityID;
    firstOrderDate?: Date;
    customerSince: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class Customer extends Entity<CustomerProps> {
    get userId(): UniqueEntityID {
        return this.props.userId;
    }

    get firstOrderDate(): Date | undefined {
        return this.props.firstOrderDate;
    }

    get customerSince(): Date {
        return this.props.customerSince;
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
        props: Optional<CustomerProps, "createdAt" | "updatedAt">,
        id?: UniqueEntityID
    ) {
        const customer = new Customer(
            {
                ...props,
                createdAt: props.createdAt ?? new Date(),
                updatedAt: props.updatedAt ?? new Date(),
            },
            id
        );

        return customer;
    }

    public toObject() {
        return {
            id: this.id.toString(),
            userId: this.userId.toString(),
            firstOrderDate: this.firstOrderDate,
            customerSince: this.customerSince,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
