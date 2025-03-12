import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { CartController } from "./cart.controller";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { vi } from "vitest";
import { CreateCartUseCase } from "@/domain/order/application/use-cases/create-cart";
import { Cart } from "@/domain/order/enterprise/entities/cart";
import { CartItem } from "@/domain/order/enterprise/entities/cart-item";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

describe("CartController", () => {
    let cartController: CartController;
    let createCartUseCase: CreateCartUseCase;
    let consoleErrorSpy: any;

    beforeEach(async () => {
        consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CartController],
            providers: [
                {
                    provide: CreateCartUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                Reflector,
                {
                    provide: JwtAuthGuard,
                    useValue: {
                        canActivate: (context: ExecutionContext) => {
                            const request = context.switchToHttp().getRequest();
                            request.user = { role: "user" };
                            return true;
                        },
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: () => "test-token",
                        verify: () => ({ id: "user-id", role: "user" }),
                    },
                },
            ],
        }).compile();

        cartController = module.get<CartController>(CartController);
        createCartUseCase = module.get<CreateCartUseCase>(CreateCartUseCase);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("should create a cart successfully", async () => {
        const mockCartItem = new CartItem({
            productId: new UniqueEntityID("product-1"),
            quantity: 2,
            price: 100,
        });

        const mockCart = Cart.create({
            userId: "user-id",
            items: [mockCartItem],
        });

        const mockResult = right({ cart: mockCart }) as Either<
            ResourceNotFoundError | null,
            { cart: Cart }
        >;

        vi.spyOn(createCartUseCase, "execute").mockResolvedValue(mockResult);

        const result = await cartController.createOrder({
            userId: "user-id",
            items: [{ productId: "product-1", quantity: 2, price: 100 }],
        });

        expect(result).toEqual(mockResult.value);
        expect(createCartUseCase.execute).toHaveBeenCalledWith({
            userId: "user-id",
            items: [{ productId: "product-1", quantity: 2, price: 100 }],
        });
    });

    it("should handle errors thrown by CreateCartUseCase", async () => {
        vi.spyOn(createCartUseCase, "execute").mockImplementation(() => {
            throw new Error("CreateCartUseCase error");
        });

        try {
            await cartController.createOrder({
                userId: "user-id",
                items: [{ productId: "product-1", quantity: 2, price: 100 }],
            });
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to create order");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should handle ResourceNotFoundError when product is not found", async () => {
        const error = new ResourceNotFoundError("Product not found: product-1");
        const mockResult = left(error) as Either<
            ResourceNotFoundError | null,
            { cart: Cart }
        >;

        vi.spyOn(createCartUseCase, "execute").mockResolvedValue(mockResult);

        try {
            await cartController.createOrder({
                userId: "user-id",
                items: [{ productId: "product-1", quantity: 2, price: 100 }],
            });
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe(error.message);
                expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should handle ResourceNotFoundError when insufficient stock", async () => {
        const error = new ResourceNotFoundError(
            "Insufficient stock for product: product-1"
        );
        const mockResult = left(error) as Either<
            ResourceNotFoundError | null,
            { cart: Cart }
        >;

        vi.spyOn(createCartUseCase, "execute").mockResolvedValue(mockResult);

        try {
            await cartController.createOrder({
                userId: "user-id",
                items: [{ productId: "product-1", quantity: 2, price: 100 }],
            });
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe(error.message);
                expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });
});
