import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { ICartRepository } from "../repositories/i-cart-repository";
import { CartItem } from "../../enterprise/entities/cart-item";
import { Injectable } from "@nestjs/common";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";

interface AddItemToCartRequest {
    userId: string;
    item: {
        cartId?: string;
        productId: string;
        quantity: number;
        imageUrl: string;
        productName: string;
        price: number;
        height: number;
        width: number;
        length: number;
        weight: number;
        colorId?: string;
        sizeId?: string;
        hasVariants: boolean;
        productIdVariant?: string;
    };
}

type AddItemToCartResponse = Either<ResourceNotFoundError, CartItem>;

@Injectable()
export class AddItemToCartUseCase {
    constructor(
        private cartRepository: ICartRepository,
        private productRepository: IProductRepository,
        private variantRepository: IProductVariantRepository
    ) {}

    async execute({
        userId,
        item,
    }: AddItemToCartRequest): Promise<AddItemToCartResponse> {
        console.log("entrou no AddItemToCartUseCase userId item", userId, item);
        const cartResult = await this.cartRepository.findCartByUser(userId);
        console.log(" AddItemToCartUseCase cartResult ", cartResult);

        if (cartResult.isLeft()) {
            return left(new ResourceNotFoundError("Cart not found"));
        }

        const cart = cartResult.value;
        console.log(" AddItemToCartUseCase cart ", cart);
        console.log(" AddItemToCartUseCase cart ", cart.items);
        console.log("AddItemToCartUseCase item.hasVariants", item.hasVariants);
        console.log(
            "AddItemToCartUseCase item.productIdVariant",
            item.productIdVariant
        );

        let productResult;
        let variant;
        let productIdToUse;
        let cartItem;
        let colorIdValue;
        let sizeIdValue;

        const existingItem = cart.items.find(
            (cartItem) =>
                cartItem.productId === item.productId &&
                cartItem.color === item.colorId &&
                cartItem.size === item.sizeId
        );
        console.log("AddItemToCartUseCase iexistingItem", existingItem);

        if (existingItem) {
            existingItem.quantity += item.quantity;
            const cartSaved = await this.cartRepository.save(cart);
            if (cartSaved.isLeft()) {
                return left(new ResourceNotFoundError("Failed to save cart"));
            }
            console.log("AddItemToCartUseCase cartSaved", cartSaved);
            return right(existingItem);
        }

        if (item.hasVariants) {
            console.log(
                "entrou tem variant do add item use case item.hasVariants",
                item.hasVariants
            );
            console.log(
                "entrou tem variant do add item use case item.productId",
                item.productId
            );

            const variantResult = await this.variantRepository.findById(
                item.productId
            );
            console.log(" add item use case variantResult", variantResult);

            const productVariant = variantResult.value;
            console.log("productVariant esse", productVariant);
            if (variantResult.isRight()) {
                const productVariant = variantResult.value;

                const colorId = productVariant.colorId;
                const sizeId = productVariant.sizeId;

                colorIdValue = colorId ? colorId.toString() : null;
                sizeIdValue = sizeId ? sizeId.toString() : null;

                console.log("Color ID:", colorIdValue);
                console.log("Size ID:", sizeIdValue);
            }

            if (variantResult.isLeft()) {
                return left(
                    new ResourceNotFoundError(
                        `Variant not found: ${item.productId}`
                    )
                );
            }
            variant = variantResult.value;

            if (variant.stock < item.quantity) {
                return left(
                    new ResourceNotFoundError(
                        `Insufficient stock for variant: ${item.productId}`
                    )
                );
            }

            productIdToUse = String(variant.props.productId.value);
            console.log("productIdToUse", productIdToUse);

            productResult =
                await this.productRepository.findById(productIdToUse);

            console.log("productResult", productResult);

            const { product, variants } = productResult.value;

            console.log("product", product);

            if (productResult.isLeft()) {
                return left(
                    new ResourceNotFoundError(
                        `Product not found: ${productIdToUse}`
                    )
                );
            }

            const { height, width, length, weight } = product.props;
            console.log(
                "height, width, length, weight",
                height,
                width,
                length,
                weight
            );

            cartItem = new CartItem({
                productId: productIdToUse,
                cartId: item.cartId || "undefined",
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.imageUrl,
                productName: item.productName,
                height,
                width,
                length,
                weight,
                color: colorIdValue,
                size: sizeIdValue,
                hasVariants: item.hasVariants,
            });

            console.log("cartItem", cartItem);

            cart.addItem(cartItem);
            console.log("cart depois de aciononar o item moo use case", cart);
            const cartSaved = await this.cartRepository.save(cart);
            console.log("cartSaved", cartSaved);

            if (cartSaved.isLeft()) {
                return left(new ResourceNotFoundError("Failed to save cart"));
            }
            const savedCart = cartSaved.value;
            const savedItems = savedCart.getItems();

            console.log("savedCart", savedCart);
            console.log("savedItems", savedItems);
            console.log("savedCart 0", savedCart[0]);

            const savedItem = savedItems.find(
                (savedItem) =>
                    savedItem.productId === cartItem.productId &&
                    savedItem.color === cartItem.color &&
                    savedItem.size === cartItem.size &&
                    savedItem.quantity === cartItem.quantity &&
                    savedItem.price === cartItem.price &&
                    savedItem.height === cartItem.height &&
                    savedItem.width === cartItem.width &&
                    savedItem.length === cartItem.length &&
                    savedItem.weight === cartItem.weight
            );

            console.log("savedItem", savedItem);

            if (!savedItem) {
                return left(
                    new ResourceNotFoundError("Item not found in saved cart")
                );
            }

            return right(savedItem);
        } else {
            productResult = await this.productRepository.findById(
                item.productId
            );

            if (productResult.isLeft()) {
                return left(
                    new ResourceNotFoundError(
                        `Product not found: ${item.productId}`
                    )
                );
            }

            const { product, variants } = productResult.value;

            const { height, width, length, weight } = product.props;
            console.log(
                "height, width, length, weight 2",
                height,
                width,
                length,
                weight
            );

            cartItem = new CartItem({
                cartId: item.cartId || "undefined",
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.imageUrl,
                productName: item.productName,
                height,
                width,
                length,
                weight,
                color: colorIdValue,
                size: sizeIdValue,
                hasVariants: item.hasVariants,
            });
        }
        console.log(
            "no final do add item cart quase return cartItem",
            cartItem
        );

        const cartCreated = cart.addItem(cartItem);

        console.log(
            "no final do add item cart quase return sem variavel cartCreated",
            cartCreated
        );

        const savedItemResult = await this.cartRepository.addItemToCart(
            cart.id.toString(),
            cartItem
        );

        if (savedItemResult.isLeft()) {
            return left(new ResourceNotFoundError("Failed to save cart item"));
        }

        const savedItem = savedItemResult.value;
        console.log("savedItem usecase no variants", savedItem);

        return right(savedItem);
    }
}
