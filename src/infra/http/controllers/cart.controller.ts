import {
    Body,
    Controller,
    Post,
    HttpStatus,
    HttpException,
    ConflictException,
    UseGuards,
    Headers,
    Param,
    Get,
    Delete,
    Patch,
    UsePipes,
    Req,
    Res,
} from "@nestjs/common";

import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import { z } from "zod";
import { CreateCartUseCase } from "@/domain/order/application/use-cases/create-cart";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { AddItemToCartUseCase } from "@/domain/order/application/use-cases/add-item-cart";
import { CheckCartExistsUseCase } from "@/domain/order/application/use-cases/check-cart-exists";
import { DeleteItemFromCartUseCase } from "@/domain/order/application/use-cases/delete-item-cart";
import { GetCartByUserUseCase } from "@/domain/order/application/use-cases/get-Cart-ByUserId";
import { UpdateItemQuantityInCartUseCase } from "@/domain/order/application/use-cases/update-quantity-item";
import { CalculateShipmentUseCase } from "@/domain/order/application/use-cases/calculate-shipping";
import { MercadoPagoService } from "@/domain/order/application/use-cases/payment.service";

const createCartSchema = z.object({
    userId: z.string(),
    items: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number().min(0),
            cartId: z.string().optional(),
            productName: z.string(),
            imageUrl: z.string(),
            price: z.number().min(0),
            colorId: z.string().optional(),
            sizeId: z.string().optional(),
            productIdVariant: z.string().optional(),
            hasVariants: z.boolean(),
        })
    ),
});

const bodyValidationPipe = new ZodValidationsPipe(createCartSchema);
type CreateCartBodySchema = z.infer<typeof createCartSchema>;

const addItemSchema = z.object({
    productId: z.string(),
    cartId: z.string().optional(),
    quantity: z.number().min(0),
    productName: z.string(),
    imageUrl: z.string(),
    weight: z.number().optional(),
    height: z.number().optional(),
    length: z.number().optional(),
    width: z.number().optional(),
    price: z.number().min(0),
    colorId: z.string().optional(),
    sizeId: z.string().optional(),
    hasVariants: z.boolean(),
});

const addItemValidationPipe = new ZodValidationsPipe(addItemSchema);

type AddItemBodySchema = z.infer<typeof addItemSchema>;

const updateItemQuantitySchema = z.object({
    quantity: z.number().min(0),
});

const updateItemQuantityValidationPipe = new ZodValidationsPipe(
    updateItemQuantitySchema
);

type UpdateItemQuantityBodySchema = z.infer<typeof updateItemQuantitySchema>;

const calculateShipmentSchema = z.object({
    cartItems: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            image: z.string(),
            price: z.number(),

            quantity: z.number(),
            color: z.string().optional(),
            size: z.string().optional(),
            width: z.number(),
            height: z.number(),
            length: z.number(),
            weight: z.number(),
            insurance_value: z.number().optional(),
        })
    ),
    selectedAddress: z.object({
        zipCode: z.string(),
    }),
});

type CalculateShipmentSchema = z.infer<typeof calculateShipmentSchema>;

const createPreferenceSchema = z.object({
    id: z.string(),
    description: z.string(),
    price: z.number(),
    quantity: z.number(),
    cartId: z.string(),
});
const createPreferenceValidationPipe = new ZodValidationsPipe(
    createPreferenceSchema
);
type CreatePreferenceSchema = z.infer<typeof createPreferenceSchema>;

@UseGuards(JwtAuthGuard)
@Controller("cart")
export class CartController {
    constructor(
        private readonly createcartUseCase: CreateCartUseCase,
        private readonly addItemToCartUseCase: AddItemToCartUseCase,
        private readonly checkCartExistsUseCase: CheckCartExistsUseCase,
        private deleteItemFromCartUseCase: DeleteItemFromCartUseCase,
        private getCartByUserUseCase: GetCartByUserUseCase,
        private calculateshipment: CalculateShipmentUseCase,
        private updateItemQuantityInCartUseCase: UpdateItemQuantityInCartUseCase,
        private mercadoPagoService: MercadoPagoService
    ) {}

    @Post()
    async createCart(@Body(bodyValidationPipe) body: CreateCartBodySchema) {
        try {
            const result = await this.createcartUseCase.execute(body);

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new ConflictException(error.message);
                }
                throw new ConflictException("An unexpected error occurred");
            }
            return result.value;
        } catch (error) {
            console.error("Erro ao criar cart:", error);
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new HttpException(
                "Failed to create order",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post("add-item/:userId")
    async addItemToCart(
        @Param("userId") userId: string,
        @Body(addItemValidationPipe) body: AddItemBodySchema
    ) {
        try {
            console.log("body", body);
            const item = {
                ...body,
                weight: body.weight ?? 0,
                height: body.height ?? 0,
                length: body.length ?? 0,
                width: body.width ?? 0,
                imageUrl: body.imageUrl,
            };

            const result = await this.addItemToCartUseCase.execute({
                userId,
                item,
            });

            console.log("boresultdy", result);

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new ConflictException(error.message);
                }
                throw new ConflictException("An unexpected error occurred");
            }
            return result.value;
        } catch (error) {
            console.error("Erro ao adicionar item ao cart:", error);
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new HttpException(
                "Failed to add item to cart",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(":userId/exists")
    async checkCartExists(@Param("userId") userId: string) {
        try {
            const result = await this.checkCartExistsUseCase.execute({
                userId,
            });
            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
            return { exists: result.value };
        } catch (error) {
            console.error("Erro ao verificar se o carrinho existe:", error);
            throw new HttpException(
                "Failed to check if cart exists",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("user/:userId")
    async getCartByUser(@Param("userId") userId: string) {
        try {
            const result = await this.getCartByUserUseCase.execute({ userId });

            if (result.isLeft()) {
                const error = result.value;
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }

            return result.value;
        } catch (error) {
            throw new HttpException(
                "Failed to fetch cart",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(":cartId/item/:itemId")
    async deleteItemFromCart(
        @Param("cartId") cartId: string,
        @Param("itemId") itemId: string
    ) {
        try {
            const result = await this.deleteItemFromCartUseCase.execute({
                cartId,
                itemId,
            });

            if (result.isLeft()) {
                const error = result.value;
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }

            return {
                message: "Item removed from cart successfully",
            };
        } catch (error) {
            throw new HttpException(
                "Failed to remove item from cart",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Patch(":userId/item/:itemId")
    async updateItemQuantityInCart(
        @Param("userId") userId: string,
        @Param("itemId") itemId: string,
        @Body(updateItemQuantityValidationPipe)
        body: UpdateItemQuantityBodySchema
    ) {
        try {
            const { quantity } = body;
            const result = await this.updateItemQuantityInCartUseCase.execute({
                userId,
                itemId,
                quantity,
            });

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new ConflictException(error.message);
                }
                throw new ConflictException("An unexpected error occurred");
            }

            return result.value;
        } catch (error) {
            console.error(
                "Erro ao atualizar quantidade do item no cart:",
                error
            );
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new HttpException(
                "Failed to update item quantity in cart",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post("/calculate-shipment")
    async calculateShipment(@Body() body: CalculateShipmentSchema) {
        console.log('@Post("/calculate-shipment bateu');
        const { cartItems, selectedAddress } = body;
        console.log(
            '@Post("/calculate-shipment , cartItems, selectedAddress',

            cartItems,
            selectedAddress
        );

        if (!cartItems.length || !selectedAddress) {
            throw new HttpException("Invalid data", HttpStatus.BAD_REQUEST);
        }

        const shipmentData = {
            from: {
                postal_code: "06053-010",
            },
            to: {
                postal_code: selectedAddress.zipCode,
            },
            package: {
                height: cartItems[0].height,
                width: cartItems[0].width,
                length: cartItems[0].length,
                weight: cartItems.reduce(
                    (total, item) => total + item.weight * item.quantity,
                    0
                ),
            },
            options: {
                insurance_value: cartItems.reduce(
                    (total, item) =>
                        total +
                        (item.insurance_value || item.price) * item.quantity,
                    0
                ),
                receipt: false,
                own_hand: false,
            },
        };
        console.log('@Post("/calculate-shipment shipmentData', shipmentData);

        const result = this.calculateshipment.calculateShipment(shipmentData);
        console.log('@Post("/calculate-shipment result ', result);

        return result;
    }

    @Post("/create-preference")
    async createPreference(
        @Body(createPreferenceValidationPipe) body: CreatePreferenceSchema
    ) {
        try {
            console.log("entrou /create-preference");
            console.log("entrou /create-preference body", body);
            const items = [
                {
                    id: body.id,
                    title: body.description,
                    unit_price: body.price,
                    quantity: body.quantity,
                },
            ];
            console.log("entrou /create-preference items", items);
            const response = await this.mercadoPagoService.createPreference(
                body.cartId,
                items
            );

            console.log("entrou /create-preference response", response);
            return response;
        } catch (error) {
            console.error("Erro ao criar preferência no MercadoPago:", error);
            throw new HttpException(
                "Failed to create preference",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
