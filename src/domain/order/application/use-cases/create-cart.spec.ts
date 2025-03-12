import { InMemoryCartRepository } from "@test/repositories/in-memory-cart-repository";
import { InMemoryProductRepository } from "@test/repositories/in-memory-product-repository";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { CreateCartUseCase } from "./create-cart";
import { Product } from "@/domain/catalog/enterprise/entities/product";

describe("CreateCartUseCase", () => {
    let useCase: CreateCartUseCase;
    let mockCartRepository: InMemoryCartRepository;
    let mockProductRepository: InMemoryProductRepository;

    beforeEach(() => {
        mockCartRepository = new InMemoryCartRepository();
        mockProductRepository = new InMemoryProductRepository();
        useCase = new CreateCartUseCase(
            mockCartRepository,
            mockProductRepository
        );

        const product1 = Product.create(
            {
                name: "Product 1",
                description: "Description 1",
                price: 100,
                stock: 10,
                sku: "sku1",
                brandId: new UniqueEntityID("brand-1"),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            new UniqueEntityID("product-1")
        );

        const product2 = Product.create(
            {
                name: "Product 2",
                description: "Description 2",
                price: 200,
                stock: 5,
                sku: "sku2",
                brandId: new UniqueEntityID("brand-2"),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            new UniqueEntityID("product-2")
        );

        mockProductRepository.create(product1);
        mockProductRepository.create(product2);
    });

    it("should create a cart with given items", async () => {
        const userId = "user-123";

        const items = [
            { productId: "product-1", quantity: 2, price: 100 },
            { productId: "product-2", quantity: 1, price: 200 },
        ];

        const result = await useCase.execute({ userId, items });

        if (result.isLeft()) {
            throw new Error("Expected right but got left");
        }

        expect(result.isRight()).toBe(true);
        const cart = result.value?.cart;
        expect(cart).toBeDefined();
        expect(cart?.userId).toBe(userId);
        expect(cart?.items).toHaveLength(2);
        expect(cart?.items[0].quantity).toBe(2);
        expect(cart?.items[0].price).toBe(100);
    });

    it("should return an error if product does not exist", async () => {
        const userId = "user-123";
        const items = [
            { productId: "nonexistent-product", quantity: 2, price: 100 },
        ];

        const result = await useCase.execute({ userId, items });

        expect(result.isLeft()).toBe(true);
        const error = result.value;
        expect(error).toBeInstanceOf(ResourceNotFoundError);
    });

    it("should return an error if there is insufficient stock", async () => {
        const userId = "user-123";
        const items = [{ productId: "product-1", quantity: 20, price: 100 }];

        const result = await useCase.execute({ userId, items });

        expect(result.isLeft()).toBe(true);
        const error = result.value;
    });

    it("should return an error if quantity is zero", async () => {
        const userId = "user-123";
        const items = [{ productId: "product-1", quantity: 0, price: 100 }];

        const result = await useCase.execute({ userId, items });

        expect(result.isLeft()).toBe(true);
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Quantity must be greater than zero"
                );
            }
        }
    });

    it("should return an error if quantity is negative", async () => {
        const userId = "user-123";
        const items = [{ productId: "product-1", quantity: -1, price: 100 }];

        const result = await useCase.execute({ userId, items });

        expect(result.isLeft()).toBe(true);
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError);
            if (result.value instanceof ResourceNotFoundError) {
                expect(result.value.message).toBe(
                    "Quantity must be greater than zero"
                );
            }
        }
    });

    it("should sum quantities for duplicate items in the cart", async () => {
        const userId = "user-123";
        const items = [
            { productId: "product-1", quantity: 2, price: 100 },
            { productId: "product-1", quantity: 1, price: 100 },
        ];

        const result = await useCase.execute({ userId, items });

        if (result.isLeft()) {
            throw new Error("Expected right but got left");
        }

        expect(result.isRight()).toBe(true);
        const cart = result.value?.cart;
        expect(cart).toBeDefined();
        expect(cart?.userId).toBe(userId);
        expect(cart?.items).toHaveLength(1);
        expect(cart?.items[0].quantity).toBe(3);
    });

    it("should create a cart even if there are no items", async () => {
        const userId = "user-123";
        const items: { productId: string; quantity: number; price: number }[] =
            [];

        const result = await useCase.execute({ userId, items });

        if (result.isLeft()) {
            throw new Error("Expected right but got left");
        }

        expect(result.isRight()).toBe(true);
        const cart = result.value?.cart;
        expect(cart).toBeDefined();
        expect(cart?.userId).toBe(userId);
        expect(cart?.items).toHaveLength(0);
    });
});
