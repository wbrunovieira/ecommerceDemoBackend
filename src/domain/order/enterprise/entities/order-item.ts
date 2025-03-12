import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface OrderItemProps {
    orderId: string;
    productId: string;
    productName: string;
    imageUrl: string;
    quantity: number;
    price: number;
}

export class OrderItem extends Entity<OrderItemProps> {
    constructor(props: OrderItemProps, id?: UniqueEntityID) {
        super(props, id);
    }

    get orderId(): string {
        return this.props.orderId;
    }

    get productId(): string {
        return this.props.productId;
    }

    get productName(): string {
        return this.props.productName;
    }

    get imageUrl(): string {
        return this.props.imageUrl;
    }

    get quantity(): number {
        return this.props.quantity;
    }

    set quantity(quantity: number) {
        this.props.quantity = quantity;
    }

    get price(): number {
        return this.props.price;
    }

    toObject() {
        return {
            id: this.id?.toString(),
            orderId: this.orderId,
            productId: this.productId,
            productName: this.productName,
            imageUrl: this.imageUrl,
            quantity: this.quantity,
            price: this.price,
        };
    }

    static create(props: OrderItemProps, id?: UniqueEntityID): OrderItem {
        return new OrderItem(props, id);
    }
}
