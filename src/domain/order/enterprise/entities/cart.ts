import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { CartItem } from "./cart-item";

interface CartProps {
    userId: string;
    items: CartItem[];
    paymentIntentId?: string;
    paymentStatus?: string;
    collection_id?: string;
    merchant_order_id?: string;
}

export class Cart extends Entity<CartProps> {
    private constructor(props: CartProps, id?: UniqueEntityID) {
        super(props, id || new UniqueEntityID());
    }

    static create(props: CartProps, id?: UniqueEntityID): Cart {
        return new Cart(props, id);
    }

    get userId(): string {
        return this.props.userId;
    }
    get merchant_order_id(): string | undefined {
        return this.props.merchant_order_id;
    }
    get collection_id(): string | undefined {
        return this.props.collection_id;
    }

    get paymentIntentId(): string | undefined {
        return this.props.paymentIntentId;
    }
    get paymentStatus(): string | undefined {
        return this.props.paymentIntentId;
    }

    set paymentIntentId(paymentIntentId: string) {
        this.props.paymentIntentId = paymentIntentId;
    }
    set collection_id(collection_id: string) {
        this.props.collection_id = collection_id;
    }

    set paymentStatus(paymentStatus: string) {
        this.props.paymentStatus = paymentStatus;
    }

    get items(): CartItem[] {
        return this.props.items;
    }

    getItems(): CartItem[] {
        return this.props.items;
    }

    addItem(newItem: CartItem) {
        console.log("entrou addItem cart entity foi chamado");
        console.log("addItem cart entity newItem", newItem);
        const existingItemIndex = this.items.findIndex(
            (item) =>
                item.productId === newItem.productId &&
                item.color === newItem.color &&
                item.size === newItem.size
        );

        console.log("addItem cart entity existingItemIndex", existingItemIndex);
        if (existingItemIndex !== -1) {
            this.items[existingItemIndex].quantity += newItem.quantity;
        } else {
            this.items.push(newItem);
        }
    }

    toObject() {
        return {
            id: this.id,
            userId: this.props.userId,
            items: this.props.items.map((item) => item.toObject()),
        };
    }

    static fromPrisma(cartData: any): Cart {
        const items = cartData.items.map((item: any) =>
            CartItem.create(
                {
                    cartId: item.cartId,
                    productId: item.productId,
                    imageUrl: item.imageUrl,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                    height: item.height,
                    width: item.width,
                    length: item.length,
                    weight: item.weight,
                    color: item.colorId,
                    size: item.sizeId,
                    hasVariants: item.hasVariants,
                    productIdVariant: item.productIdVariant,
                },
                new UniqueEntityID(item.id)
            )
        );
        console.log("cart entity items", items);

        const cartCreated = Cart.create(
            {
                userId: cartData.userId,
                items: items,
            },
            new UniqueEntityID(cartData.id)
        );

        console.log("cart entity cartCreated", cartCreated);
        return cartCreated;
    }
}
