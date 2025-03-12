import { InMemoryProductRepository } from "@test/repositories/in-memory-product-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { makeProduct } from "@test/factories/make-product";

import { IProductVariantRepository } from "../repositories/i-product-variant-repository";
import { GetAllProductsUseCase } from "./get-all-products";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { left } from "@/core/either";

describe("GetAllProductsUseCase", () => {
    let getAllProductsUseCase: GetAllProductsUseCase;
    let mockProductRepository: InMemoryProductRepository;
    let mockProductVariantRepository: IProductVariantRepository;

    beforeEach(() => {
        mockProductRepository = new InMemoryProductRepository(
            mockProductVariantRepository
        );
        getAllProductsUseCase = new GetAllProductsUseCase(
            mockProductRepository
        );
    });

    it("should return all products", async () => {
        const productId1 = new UniqueEntityID("product_id_1");
        const productId2 = new UniqueEntityID("product_id_2");

        const product1 = makeProduct(
            {
                name: "Product 1",
                description: "Description 1",
                price: 100,
                stock: 10,
            },
            productId1
        );

        const product2 = makeProduct(
            {
                name: "Product 2",
                description: "Description 2",
                price: 200,
                stock: 20,
            },
            productId2
        );

        await mockProductRepository.create(product1.product);
        await mockProductRepository.create(product2.product);

        const result = await getAllProductsUseCase.execute();

        expect(result.isRight()).toBeTruthy();

        if (result.isRight()) {
            const products = result.value;
            expect(products).toHaveLength(2);
            expect(products[0].id).toEqual(productId1.toValue());
            expect(products[1].id).toEqual(productId2.toValue());
        } else {
            throw new Error("Expected to retrieve products successfully");
        }
    });

    it("should return a ResourceNotFoundError if no products found", async () => {
        const result = await getAllProductsUseCase.execute();

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            expect(error).toBeInstanceOf(ResourceNotFoundError);
            expect(error.message).toBe("No products found");
        } else {
            throw new Error("Expected to receive a ResourceNotFoundError");
        }
    });

    it("should return a ResourceNotFoundError if an error occurs", async () => {
        vi.spyOn(mockProductRepository, "getAllProducts").mockImplementation(
            () => {
                return Promise.resolve(
                    left(new ResourceNotFoundError("No products found"))
                );
            }
        );

        const result = await getAllProductsUseCase.execute();

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            expect(error).toBeInstanceOf(ResourceNotFoundError);
            expect(error.message).toBe("No products found");
        } else {
            throw new Error(
                "Expected ResourceNotFoundError but got a successful result"
            );
        }
    });

    it("should correctly convert Product to ProductObject", () => {
        const productId = new UniqueEntityID("product_id_test");

        const product = makeProduct(
            {
                name: "Test Product",
                description: "Test Description",
                price: 100,
                stock: 10,
            },
            productId
        );

        const productObject = product.product.toObject();
        console.log("Converted ProductObject:", productObject);

        expect(productObject).toHaveProperty("id", productId.toValue());
        expect(productObject).toHaveProperty("name", "Test Product");
        expect(productObject).toHaveProperty("price", 100);
    });

    it("should set showInSite to true by default", () => {
        const product = makeProduct({
            name: "Test Product",
            description: "Test Description",
            price: 100,
            stock: 10,
        });

        expect(product.product.showInSite).toBe(true);
    });
});
