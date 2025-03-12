import { InMemoryProductRepository } from "@test/repositories/in-memory-product-repository";
import { GetFeaturedProductsUseCase } from "./get-featured-products";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { makeProduct } from "@test/factories/make-product";
import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";
import { makeBrand } from "@test/factories/make-brand";
import { IProductVariantRepository } from "../repositories/i-product-variant-repository";
import { left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

describe("GetFeaturedProductsUseCase", () => {
    let getFeaturedProductsUseCase: GetFeaturedProductsUseCase;
    let mockProductRepository: InMemoryProductRepository;
    let mockProductVariantRepository: IProductVariantRepository;
    let mockBrandRepository: InMemoryBrandRepository;
    let productId: UniqueEntityID;
    let brandId: UniqueEntityID;

    beforeEach(() => {
        mockProductRepository = new InMemoryProductRepository(
            mockProductVariantRepository
        );
        mockBrandRepository = new InMemoryBrandRepository();
        getFeaturedProductsUseCase = new GetFeaturedProductsUseCase(
            mockProductRepository
        );

        brandId = new UniqueEntityID("82a6d71c-6378-4d11-8258-4ee8732161a3");
        productId = new UniqueEntityID("test_product_id");

        const consistentBrand = makeBrand({ name: "Test Brand Name" }, brandId);
        console.log("consistentBrand", consistentBrand);
        mockBrandRepository.create(consistentBrand);

        const featuredProduct = makeProduct(
            {
                name: "Featured Product",
                brandId: brandId,
                isFeatured: true,
                price: 100,
                finalPrice: 90,
                onSale: true,
                productColors: [],
                productSizes: [],
                productCategories: [],
            },
            productId
        );
        console.log("featuredProduct.product", featuredProduct.product);

        mockProductRepository.create(featuredProduct.product);
        console.log("mockProductRepository", mockProductRepository);
        featuredProduct.product.brand = consistentBrand;
    });

    it("should return featured products successfully", async () => {
        const result = await getFeaturedProductsUseCase.execute();

        expect(result).toHaveLength(1);

        const product = result[0];
        expect(result[0].name).toBe("Featured Product");
        expect(result[0].isFeatured).toBe(true);
    });

    it("should return an empty array if no featured products are found", async () => {
        mockProductRepository.items = [];

        const result = await getFeaturedProductsUseCase.execute();

        expect(result).toHaveLength(0);
    });

    it("should correctly map product details", async () => {
        const result = await getFeaturedProductsUseCase.execute();
        console.log(
            ' it("should correctly map product details" result',
            result
        );
        const product = result[0];
        console.log(
            ' it("should correctly map product details" product',
            product
        );

        expect(product.name).toBe("Featured Product");
        expect(product.price).toBe(100);
        expect(product.finalPrice).toBe(90);
        expect(product.onSale).toBe(true);
        expect(product.brand.name).toBe("Test Brand Name");
    });

    it("should handle products with missing brand", async () => {
        const productWithoutBrandId = new UniqueEntityID(
            "another_test_product_id"
        );
        const productWithoutBrand = makeProduct(
            {
                name: "Product Without Brand",
                isFeatured: true,
                brandId: undefined,
            },
            productWithoutBrandId
        );

        mockProductRepository.create(productWithoutBrand.product);

        const result = await getFeaturedProductsUseCase.execute();
        const product = result.find((p) => p.name === "Product Without Brand");

        expect(product).toBeDefined();
        expect(product?.brand.name).toBe("Unknown");
    });
});
