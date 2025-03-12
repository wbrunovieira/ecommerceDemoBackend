import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { CartItem } from "./cart-item";
import { Injectable } from "@nestjs/common";

interface ArchivedCartProps {
    userId: string;
    cartId: string;
    items: CartItem[];
    paymentIntentId?: string;
    paymentStatus?: string;
    collection_id?: string;
    merchant_order_id?: string;
    archivedAt: Date;
}

@Injectable()
export class ArchivedCart extends Entity<ArchivedCartProps> {
    private constructor(props: ArchivedCartProps, id?: UniqueEntityID) {
        super(props, id || new UniqueEntityID());
    }

    static create(props: ArchivedCartProps, id?: UniqueEntityID): ArchivedCart {
        return new ArchivedCart(props, id);
    }

    get userId(): string {
        return this.props.userId;
    }

    get cartId(): string {
        return this.props.userId;
    }

    get items(): CartItem[] {
        return this.props.items;
    }

    get paymentIntentId(): string | undefined {
        return this.props.paymentIntentId;
    }

    get paymentStatus(): string | undefined {
        return this.props.paymentStatus;
    }

    get collection_id(): string | undefined {
        return this.props.collection_id;
    }

    get merchant_order_id(): string | undefined {
        return this.props.merchant_order_id;
    }

    get archivedAt(): Date {
        return this.props.archivedAt;
    }

    toObject() {
        return {
            id: this.id.toString(),
            userId: this.userId,
            items: this.items.map((item) => item.toObject()),
            paymentIntentId: this.paymentIntentId,
            paymentStatus: this.paymentStatus,
            collection_id: this.collection_id,
            merchant_order_id: this.merchant_order_id,
            archivedAt: this.archivedAt,
        };
    }

    static fromPrisma(archivedCartData: any): ArchivedCart {
        const items = archivedCartData.items.map((item: any) =>
            CartItem.create(
                {
                    cartId: item.cartId,
                    productId: item.productId,
                    productName: item.productName,
                    imageUrl: item.imageUrl,
                    quantity: item.quantity,
                    price: item.price,
                    height: item.height,
                    width: item.width,
                    length: item.length,
                    weight: item.weight,
                    color: item.colorId ? item.colorId.toString() : undefined,
                    size: item.sizeId ? item.sizeId.toString() : undefined,
                    hasVariants: item.hasVariants,
                },
                new UniqueEntityID(item.id)
            )
        );

        return ArchivedCart.create(
            {
                userId: archivedCartData.userId,
                cartId: archivedCartData.cartId,
                items: items,
                paymentIntentId: archivedCartData.paymentIntentId || undefined,
                paymentStatus: archivedCartData.paymentStatus || undefined,
                collection_id: archivedCartData.collection_id || undefined,
                merchant_order_id:
                    archivedCartData.merchant_order_id || undefined,
                archivedAt: archivedCartData.archivedAt,
            },
            new UniqueEntityID(archivedCartData.id)
        );
    }
}
