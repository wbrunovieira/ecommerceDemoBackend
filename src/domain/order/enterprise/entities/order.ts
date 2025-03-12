import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { OrderItem } from "./order-item";
import { OrderStatus } from "./order-status";

interface OrderProps {
    userId: string;
    customerId?: string;
    cartId?: string;
    items: OrderItem[];

    status: OrderStatus;
    paymentId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentDate?: Date;
}

export interface OrderDTO {
    id: string;
    userId: string;
    userName: string;
    cartId?: string | null;
    customerId?: string | null;
    items: any[];
    status: OrderStatus;
    paymentId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentDate?: Date;
}

export class Order extends Entity<OrderProps> {
    private constructor(props: OrderProps, id?: UniqueEntityID) {
        super(props, id || new UniqueEntityID());
    }

    static create(props: OrderProps, id?: UniqueEntityID): Order {
        return new Order(props, id);
    }

    get userId(): string {
        return this.props.userId;
    }

    get cartId(): string | undefined {
        return this.props.cartId;
    }
    get customerId(): string | undefined {
        return this.props.customerId;
    }

    get status(): OrderStatus {
        return this.props.status;
    }

    get items(): OrderItem[] {
        return this.props.items;
    }

    get paymentId(): string | undefined {
        return this.props.paymentId;
    }

    get paymentStatus(): string | undefined {
        return this.props.paymentStatus;
    }

    get paymentMethod(): string | undefined {
        return this.props.paymentMethod;
    }

    get paymentDate(): Date | undefined {
        return this.props.paymentDate;
    }

    set paymentStatus(paymentStatus: string) {
        this.props.paymentStatus = paymentStatus;
    }

    toObject() {
        return {
            id: this.id.toString(),
            userId: this.userId,
            items: this.items.map((item) => item.toObject()),

            status: this.status,
            paymentId: this.paymentId,
            paymentStatus: this.paymentStatus,
            paymentMethod: this.paymentMethod,
            paymentDate: this.paymentDate,
            cartId: this.cartId,
            customerId: this.customerId,
        };
    }

    static fromPrisma(orderData: any): Order {
        const items = orderData.items.map((item: any) =>
            OrderItem.create(
                {
                    orderId: item.orderId,
                    productId: item.productId,
                    productName: item.productName,
                    imageUrl: item.imageUrl,
                    quantity: item.quantity,
                    price: item.price,
                },
                new UniqueEntityID(item.id)
            )
        );

        const orderCreated = Order.create(
            {
                userId: orderData.userId,
                items: items,

                status: orderData.status,
                paymentId: orderData.paymentId,
                paymentStatus: orderData.paymentStatus,
                paymentMethod: orderData.paymentMethod,
                paymentDate: orderData.paymentDate,
                cartId: orderData.cartId,
                customerId: orderData.customerId,
            },
            new UniqueEntityID(orderData.id)
        );

        return orderCreated;
    }
}
