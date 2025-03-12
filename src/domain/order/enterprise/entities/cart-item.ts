import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface CartItemProps {
    cartId: string;
    productName: string;
    imageUrl: string;
    productId: string;
    quantity: number;
    price: number;
    height: number;
    width: number;
    length: number;
    weight: number;
    color?: string;
    size?: string;
    hasVariants: boolean;
    productIdVariant?: string;
}

export class CartItem extends Entity<CartItemProps> {
    constructor(props: CartItemProps, id?: UniqueEntityID) {
        super(props, id);
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
    get cartId(): string | undefined {
        return this.props.cartId;
    }

    get hasVariants(): boolean {
        return this.props.hasVariants;
    }

    get productIdVariant(): string | undefined {
        return this.props.productIdVariant;
    }

    get color(): string | undefined {
        return this.props.color;
    }
    get size(): string | undefined {
        return this.props.size;
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
    get height(): number {
        return this.props.height;
    }

    get width(): number {
        return this.props.width;
    }

    get length(): number {
        return this.props.length;
    }

    get weight(): number {
        return this.props.weight;
    }

    setQuantity(quantity: number): void {
        this.props.quantity = quantity;
    }

    setCartId(cartId: string): void {
        this.props.cartId = cartId;
    }

    toObject() {
        return {
            id: this.id?.toString(),
            productId: this.productId,
            cartId: this.cartId,
            imageUrl: this.imageUrl,
            productName: this.productName,

            quantity: this.quantity,
            price: this.price,
            height: this.height,
            width: this.width,
            productIdVariant: this.productIdVariant,
            length: this.length,
            weight: this.weight,
            colorId: this.color,
            sizeId: this.size,
            hasVariants: this.hasVariants,
        };
    }

    static create(props: CartItemProps, id?: UniqueEntityID): CartItem {
        return new CartItem(props, id);
    }
}
