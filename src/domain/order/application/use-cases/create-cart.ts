import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ICartRepository } from "../repositories/i-cart-repository";

import { Cart } from "../../enterprise/entities/cart";
import { CartItem } from "../../enterprise/entities/cart-item";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";

interface CreateCartUseCaseRequest {
    userId: string;
    items: {
        productId: string;
        productName: string;
        imageUrl: string;
        quantity: number;
        price: number;
        colorId?: string;
        sizeId?: string;
        productIdVariant?: string;
        hasVariants: boolean;
    }[];
}

type CreateCartUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        cart: Cart;
    }
>;

@Injectable()
export class CreateCartUseCase {
    constructor(
        private cartRepository: ICartRepository,
        private productRepository: IProductRepository,
        private variantRepository: IProductVariantRepository
    ) {}

    async execute({
        userId,
        items,
    }: CreateCartUseCaseRequest): Promise<CreateCartUseCaseResponse> {
        try {
            const cartItemsMap: { [productId: string]: CartItem } = {};
            console.log("entrou no CreateCartUseCase  userId", userId);

            for (const item of items) {
                if (item.quantity <= 0) {
                    return left(
                        new ResourceNotFoundError(
                            "Quantity must be greater than zero"
                        )
                    );
                }

                console.log("create cart inicio item", item);
                console.log(
                    "create cart inicio productIdVariant",
                    item.productIdVariant
                );
                console.log("create cart inicio hasVariants", item.hasVariants);
                console.log(
                    "create cart inicio item product id",
                    item.productId
                );

                let productResult;
                let variant;
                let colorIdValue;
                let sizeIdValue;
                let productIdFromVariant = item.productId || "undefined";
                let productIdFromVarianttoproduct =
                    item.productIdVariant || "undefined";
                console.log(
                    "create cart inicio productIdFromVariant",
                    productIdFromVariant
                );

                if (item.hasVariants) {
                    productIdFromVariant;
                    console.log(
                        "entrou no create cart use case com variants ",
                        productIdFromVariant
                    );
                    const variantResult =
                        await this.variantRepository.findById(
                            productIdFromVariant
                        );

                    console.log("variantResult value", variantResult.value);

                    if (variantResult.isRight()) {
                        const productVariant = variantResult.value;
                        if (variantResult.isRight()) {
                            const productVariant = variantResult.value;

                            const colorId = productVariant.colorId;
                            const sizeId = productVariant.sizeId;

                            colorIdValue = colorId ? colorId.toString() : null;
                            sizeIdValue = sizeId ? sizeId.toString() : null;

                            console.log("Color ID:", colorIdValue);
                            console.log("Size ID:", sizeIdValue);
                        }
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
                    console.log(
                        "legal, agora vamos produtar o produto da variant no create cart usecaseproductIdFromVarianttoproduct",
                        productIdFromVarianttoproduct
                    );

                    productResult = await this.productRepository.findById(
                        productIdFromVarianttoproduct
                    );

                    console.log("create cart productResult", productResult);

                    const { product, variants } = productResult.value;

                    console.log("create cart productResult variants", variants);
                    console.log("create cart productResult product", product);

                    const { height, width, length, weight } = product.props;
                    console.log(
                        "create cart productResult  height, width, length, weight",

                        height,
                        width,
                        length,
                        weight
                    );
                    console.log("variants.props, ", variants.props);

                    if (cartItemsMap[productIdFromVariant]) {
                        console.log("existe o item");
                        const existingItem = cartItemsMap[productIdFromVariant];
                        existingItem.setQuantity(
                            existingItem.quantity + item.quantity
                        );
                    } else {
                        console.log(
                            "criar o cart no use case productIdFromVarianttoproduct",
                            productIdFromVarianttoproduct
                        );
                        console.log(
                            "criar o cart no use case productIdFromVariant",
                            productIdFromVariant
                        );
                        console.log(
                            "criar o cart no use case item.productIdVariant",
                            item.productIdVariant
                        );
                        cartItemsMap[productIdFromVariant] = new CartItem({
                            productId: productIdFromVarianttoproduct,
                            productIdVariant: item.productIdVariant,
                            cartId: "",
                            quantity: item.quantity,
                            price: item.price,
                            imageUrl: item.imageUrl,
                            productName: item.productName,
                            height: height,
                            width: width,
                            length: length,
                            weight: weight,
                            color: colorIdValue,
                            size: sizeIdValue,
                            hasVariants: item.hasVariants,
                        });
                    }
                } else {
                    console.log(
                        "nao tem variant vamos criar o produto",
                        item.productId
                    );
                    productResult = await this.productRepository.findById(
                        item.productId
                    );
                    console.log("nao tem variant productResult", productResult);

                    const product = productResult.value;
                    console.log("nao tem variant product", product);

                    if (productResult.isLeft()) {
                        return left(
                            new ResourceNotFoundError(
                                `Product not found: ${item.productId}`
                            )
                        );
                    }

                    console.log("nao tem variant product.stock", product.stock);

                    if (product.stock < item.quantity) {
                        return left(
                            new ResourceNotFoundError(
                                `Insufficient stock for product: ${item.productId}`
                            )
                        );
                    }

                    if (cartItemsMap[item.productId]) {
                        const existingItem = cartItemsMap[item.productId];
                        existingItem.setQuantity(
                            existingItem.quantity + item.quantity
                        );
                    } else {
                        cartItemsMap[item.productId] = new CartItem({
                            cartId: "",
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            imageUrl: item.imageUrl,
                            productName: item.productName,
                            height: product.props.height,
                            width: product.props.width,
                            length: product.props.length,
                            weight: product.props.weight,
                            color: item.colorId,
                            size: item.sizeId,
                            hasVariants: item.hasVariants,
                        });
                    }
                }
            }
            const cartItems = Object.values(cartItemsMap);
            const cart = Cart.create({ userId, items: cartItems });
            cart.items.forEach((item) => item.setCartId(cart.id.toString()));

            console.log("quase saindo no CreateCartUseCase  userId", userId);

            console.log("quase saindo no CreateCartUseCase  cart", cart);

            const cartCreated = await this.cartRepository.create(cart);
            console.log("quase saindo no CreateCartUseCase  cart", cartCreated);

            return right({ cart });
        } catch (error) {
            return left(error as Error);
        }
    }
}
