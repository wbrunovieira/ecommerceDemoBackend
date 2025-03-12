import { Either, left, right } from "@/core/either";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import { Cart } from "@/domain/order/enterprise/entities/cart";
import { ICartRepository } from "@/domain/order/application/repositories/i-cart-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { CartItem } from "@/domain/order/enterprise/entities/cart-item";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";


@Injectable()
export class PrismaCartRepository implements ICartRepository {
    constructor(private prisma: PrismaService) {}

    async create(cart: Cart): Promise<Either<Error, void>> {
        try {
            console.log("entrou no prisma cart create cart", cart);
            const cartData = cart.toObject();
            console.log("entrou no prisma cart create cartData", cartData);

            const createdCart = await this.prisma.cart.create({
                data: {
                    id: cartData.id.toString(),
                    userId: cartData.userId,
                    items: {
                        create: cartData.items.map((item) => ({
                            id: item.id?.toString(),
                            productId: item.productId.toString(),
                            imageUrl: item.imageUrl,
                            productName: item.productName,
                            quantity: item.quantity,
                            price: item.price,
                            height: item.height,

                            hasVariants: item.hasVariants,
                            width: item.width,
                            length: item.length,
                            weight: item.weight,
                            colorId: item.colorId?.toString(),
                            sizeId: item.sizeId?.toString(),
                        })),
                    },
                },
            });
            console.log("createdCart in PrismaCartRepository", createdCart);

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create cart"));
        }
    }

    async findCartByUser(userId: string): Promise<Either<Error, Cart>> {
        try {
            console.log("entrou no prisma findCartByUser", userId);
            const cartRecord = await this.prisma.cart.findFirst({
                where: { userId },
                include: { items: true },
            });
            console.log(" prisma findCartByUser userId ", cartRecord);

            let cart: Cart;

            if (!cartRecord) {
                cart = Cart.create(
                    {
                        userId,
                        items: [],
                    },
                    new UniqueEntityID()
                );
            } else {
                const cartItems = cartRecord.items.map((item) =>
                    CartItem.create(
                        {
                            cartId: item.cartId,
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            hasVariants: item.hasVariants,
                            imageUrl: item.imageUrl,
                            productName: item.productName,
                            height: item.height,
                            width: item.width,
                            length: item.length,
                            weight: item.weight,
                            color: item.colorId
                                ? item.colorId.toString()
                                : undefined,
                            size: item.sizeId
                                ? item.sizeId.toString()
                                : undefined,
                        },
                        new UniqueEntityID(item.id)
                    )
                );

                cart = Cart.create(
                    {
                        userId: cartRecord.userId,
                        items: cartItems,
                    },
                    new UniqueEntityID(cartRecord.id)
                );
            }

            console.log(" prisma findCartByUser cart ", cart);
            return right(cart);
        } catch (error) {
            return left(new Error("Failed to fetch cart"));
        }
    }

    async save(cart: Cart): Promise<Either<Error, Cart>> {
        try {
            console.log("PrismaCartRepository save Cart", Cart);
            const cartData = cart.toObject();
            console.log("PrismaCartRepository save cartData", cartData);

            const cartSaved = await this.prisma.cart.update({
                where: { id: cartData.id.toString() },
                data: {
                    userId: cartData.userId,
                    items: {
                        upsert: cartData.items.map((item) => ({
                            where: { id: item.id },
                            update: {
                                quantity: item.quantity,
                                price: item.price,
                                imageUrl: item.imageUrl,
                                productName: item.productName,
                                height: item.height,
                                width: item.width,

                                productIdVariant: item.productIdVariant,
                                length: item.length,
                                weight: item.weight,
                                hasVariants: item.hasVariants,
                                colorId: item.colorId?.toString(),
                                sizeId: item.sizeId?.toString(),
                            },
                            create: {
                                productId: item.productId,
                                quantity: item.quantity,
                                price: item.price,
                                imageUrl: item.imageUrl,
                                productName: item.productName,
                                height: item.height,
                                width: item.width,
                                length: item.length,
                                hasVariants: item.hasVariants,
                                productIdVariant: item.productIdVariant,
                                weight: item.weight,
                                colorId: item.colorId?.toString(),
                                sizeId: item.sizeId?.toString(),
                            },
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });

            console.log(
                "PrismaCartRepository save Raw cartSaved data: cartSaved",
                cartSaved
            );

            const cartEntity = Cart.fromPrisma(cartSaved);
            console.log("PrismaCartRepository save cartEntity", cartEntity);

            return right(cartEntity);
        } catch (error) {
            console.error("Erro ao salvar o carrinho:", error);

            if (error instanceof PrismaClientKnownRequestError) {
                console.error(
                    "PrismaClientKnownRequestError code:",
                    error.code
                );

                if (error.code === "P2025") {
                    return left(new Error("Cart not found"));
                }
                if (error.code === "P2002") {
                    return left(new Error("Unique constraint failed"));
                }
            }

            return left(new Error("Failed to save cart"));
        }
    }

    async addItemToCart(
        cartId: string,
        item: CartItem
    ): Promise<Either<Error, CartItem>> {
        try {
            const savedItem = await this.prisma.cartItem.create({
                data: {
                    cartId: cartId,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    productName: item.productName,
                    height: item.height,
                    width: item.width,
                    length: item.length,
                    weight: item.weight,
                    colorId: item.color,
                    sizeId: item.size,
                    hasVariants: item.hasVariants,
                },
            });

            const cartItem = CartItem.create(
                {
                    cartId: savedItem.cartId,
                    productId: savedItem.productId,
                    quantity: savedItem.quantity,
                    price: savedItem.price,
                    imageUrl: savedItem.imageUrl,
                    productName: savedItem.productName,
                    height: savedItem.height,
                    width: savedItem.width,
                    length: savedItem.length,
                    weight: savedItem.weight,
                    color: savedItem.colorId ?? undefined,
                    size: savedItem.sizeId ?? undefined,
                    hasVariants: savedItem.hasVariants,
                },
                new UniqueEntityID(savedItem.id)
            );

            return right(cartItem);
        } catch (error) {
            return left(new Error("Failed to save cart item"));
        }
    }

    async cartExists(userId: string): Promise<Either<Error, boolean>> {
        try {
            const cartRecord = await this.prisma.cart.findFirst({
                where: { userId },
            });

            return right(!!cartRecord);
        } catch (error) {
            console.error("Erro ao salvar o carrinho:", error);

            if (error instanceof PrismaClientKnownRequestError) {
                console.error(
                    "PrismaClientKnownRequestError code:",
                    error.code
                );

                if (error.code === "P2025") {
                    return left(new Error("Cart not found"));
                }
                if (error.code === "P2002") {
                    return left(new Error("Unique constraint failed"));
                }
            }

            return left(new Error("Failed to save cart"));
        }
    }

    async removeItemFromCart(
        cartId: string,
        itemId: string
    ): Promise<Either<Error, void>> {
        try {
            await this.prisma.cart.update({
                where: { id: cartId },
                data: {
                    items: {
                        delete: { id: itemId },
                    },
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to remove item from cart"));
        }
    }

    async findById(cartId: string): Promise<Either<Error, Cart>> {
        try {
            console.log("entrou no cart repo findById com o CartID", cartId);
            const cartData = await this.prisma.cart.findUnique({
                where: { id: cartId },
                include: {
                    items: true,
                },
            });
            console.log("cart repo findById com o cartData", cartData);

            if (!cartData) {
                return left(new ResourceNotFoundError("Cart not found"));
            }

            const cartItems = cartData.items.map(
                (item) =>
                    new CartItem(
                        {
                            productId: item.productId,
                            cartId: item.cartId,
                            quantity: item.quantity,
                            price: item.price,
                            imageUrl: item.imageUrl,
                            productName: item.productName,
                            height: item.height,
                            hasVariants: item.hasVariants,
                            width: item.width,
                            length: item.length,
                            weight: item.weight,
                            color: item.colorId || "undefined",
                            size: item.sizeId || "undefined",
                        },
                        new UniqueEntityID(item.id)
                    )
            );

            const cart = Cart.create(
                {
                    userId: cartData.userId,
                    items: cartItems,
                },
                new UniqueEntityID(cartData.id)
            );

            return right(cart);
        } catch (error) {
            return left(new ResourceNotFoundError("Failed to fetch cart"));
        }
    }

    async savePreferenceId(
        cartId: string,
        preferenceId: string,
        paymentStatus: string
    ): Promise<Either<Error, void>> {
        try {
            console.log(
                `Saving preferenceId for cart ${cartId} with preferenceId: ${preferenceId}`
            );

            await this.prisma.cart.update({
                where: { id: cartId },
                data: {
                    paymentIntentId: preferenceId,
                    paymentStatus: paymentStatus,
                },
            });

            console.log(`Successfully saved preferenceId for cart ${cartId}`);
            return right(undefined);
        } catch (error) {
            console.error("Error saving preferenceId:", error);
            return left(new Error("Failed to save preferenceId"));
        }
    }

    async saveCollectionId(
        cartId: string,
        collection_id: string,
        merchant_order_id: string
    ): Promise<Either<Error, void>> {
        try {
            console.log(
                `Saving preferenceId for cart ${cartId} with preferenceId: ${collection_id}`
            );

            const cart = await this.prisma.cart.findUnique({
                where: { id: cartId },
            });

            if (cart) {
                await this.prisma.cart.update({
                    where: { id: cart.id },
                    data: {
                        collection_id,
                        merchant_order_id,
                    },
                });

                console.log(
                    `Successfully updated cart ${cartId} in active carts.`
                );
            } else {
                console.warn(
                    `Cart with ID ${cartId} not found in active carts. Checking archived carts...`
                );

                const archivedCart = await this.prisma.archivedCart.findUnique({
                    where: { id: cartId },
                });

                if (!archivedCart) {
                    console.error(
                        `Cart with ID ${cartId} not found in any table.`
                    );
                    return left(new Error(`Cart not found: ${cartId}`));
                }

                await this.prisma.archivedCart.update({
                    where: { id: archivedCart.id },
                    data: {
                        collection_id,
                        merchant_order_id,
                        paymentStatus: "approved",
                    },
                });

                console.log(
                    `Successfully updated cart ${cartId} in archived carts.`
                );
            }

            return right(undefined);
        } catch (error) {
            console.error("Error saving preferenceId:", error);
            return left(new Error("Failed to save preferenceId"));
        }
    }

    async findByPreferenceId(
        preference_id: string
    ): Promise<Either<Error, Cart>> {
        try {
            const cart = await this.prisma.cart.findFirst({
                where: { paymentIntentId: preference_id },
                include: { items: true },
            });

            if (!cart) {
                console.error(
                    `Cart not found for preference ID: ${preference_id}`
                );
                return left(new Error("Cart not found"));
            }

            const cartItems = cart.items.map((item) =>
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
                        color: item.colorId?.toString(),
                        size: item.sizeId?.toString(),
                        hasVariants: item.hasVariants,
                    },
                    new UniqueEntityID(item.id)
                )
            );

            const cartEntity = Cart.create(
                {
                    userId: cart.userId,
                    items: cartItems,
                    paymentIntentId: cart.paymentIntentId || undefined,
                    paymentStatus: cart.paymentStatus || undefined,
                },
                new UniqueEntityID(cart.id)
            );

            return right(cartEntity);
        } catch (error) {
            console.error("Error finding cart by preference ID:", error);
            return left(new Error("Failed to find cart by preference ID"));
        }
    }

    async deleteCartById(cartId: string): Promise<Either<Error, void>> {
        try {
            await this.prisma.cartItem.deleteMany({
                where: { cartId },
            });

            await this.prisma.cart.delete({
                where: { id: cartId },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to delete cart"));
        }
    }
}
