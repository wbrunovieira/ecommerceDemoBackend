import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";
import { CreateProductUseCase } from "./create-product";

import { InMemoryProductRepository } from "@test/repositories/in-memory-product-repository";
import { InMemoryProductColorRepository } from "@test/repositories/in-memory-product-color-repository";
import { InMemoryProductSizeRepository } from "@test/repositories/in-memory-product-size-repository";

import { IProductCategoryRepository } from "../repositories/i-product-category-repository";

import { IBrandRepository } from "../repositories/i-brand-repository";
import { makeBrand } from "@test/factories/make-brand";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { left, right } from "@/core/either";
import { InMemoryColorRepository } from "@test/repositories/in-memory-color-repository";

import { ISizeRepository } from "../repositories/i-size-repository";
import { makeSize } from "@test/factories/make-size";
import { InMemorySizeRepository } from "@test/repositories/in-memory-size-repository";
import { ProductSize } from "../../enterprise/entities/product-size";
import { makeColor } from "@test/factories/make-color";
import { ProductColor } from "../../enterprise/entities/product-color";
import { ICategoryRepository } from "../repositories/i-category-repository";
import { makeCategory } from "@test/factories/make-category";
import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";
import { ProductCategory } from "../../enterprise/entities/product-category";
import { IProductVariantRepository } from "../repositories/i-product-variant-repository";
import { InMemoryProductVariantRepository } from "@test/repositories/in-memory-product-variant-repository";
import { ProductVariant } from "../../enterprise/entities/product-variant";
import { ProductStatus } from "../../enterprise/entities/product-status";
import { fail } from "assert";
import { InMemoryProductCategoryRepository } from "@test/repositories/in-memory-product-category";

describe("CreateProductUseCase - With Variants", () => {
    let createProductUseCase: CreateProductUseCase;

    let mockProductRepository: InMemoryProductRepository;
    let mockProductVariantRepository: IProductVariantRepository;

    let mockBrandRepository: IBrandRepository;

    let mockSizeRepository: ISizeRepository;
    let mockProductSizeRepository: InMemoryProductSizeRepository;

    let mockColorRepository: InMemoryColorRepository;
    let mockProductColorRepository: InMemoryProductColorRepository;

    let mockCategoryRepository: ICategoryRepository;
    let mockProductCategoryRepository: IProductCategoryRepository;

    let brandId: UniqueEntityID;

    let sizeId: UniqueEntityID;
    let colorId: UniqueEntityID;
    let categoryId: UniqueEntityID;

    beforeEach(() => {
        brandId = new UniqueEntityID("82a6d71c-6378-4d11-8258-4ee8732161a3");

        sizeId = new UniqueEntityID("size_id_as_string");
        colorId = new UniqueEntityID("color_id_as_string");
        categoryId = new UniqueEntityID("category_id_as_string");

        const consistentBrand = makeBrand({ name: "Test Brand Name" }, brandId);

        const consistentSize = makeSize({ name: "Test Size Name" }, sizeId);
        const consistentColor = makeColor({ name: "Test Color Name" }, colorId);
        const consistentCategory = makeCategory(
            { name: "Test Category Name" },
            categoryId
        );

        mockProductRepository = new InMemoryProductRepository(
            mockProductVariantRepository
        );

        mockProductVariantRepository = new InMemoryProductVariantRepository();

        mockProductSizeRepository = new InMemoryProductSizeRepository();

        mockProductCategoryRepository = new InMemoryProductCategoryRepository();
        mockBrandRepository = new InMemoryBrandRepository();

        mockSizeRepository = new InMemorySizeRepository();
        mockColorRepository = new InMemoryColorRepository();
        mockCategoryRepository = new InMemoryCategoryRepository();
        mockProductColorRepository = new InMemoryProductColorRepository(
            mockColorRepository,
            mockProductRepository
        );

        mockBrandRepository.create(consistentBrand);

        mockSizeRepository.create(consistentSize);
        mockColorRepository.create(consistentColor);
        mockCategoryRepository.create(consistentCategory);

        createProductUseCase = new CreateProductUseCase(
            mockProductRepository,
            mockColorRepository,
            mockBrandRepository,

            mockSizeRepository,
            mockCategoryRepository,
            mockProductSizeRepository,
            mockProductColorRepository,
            mockProductCategoryRepository,
            mockProductVariantRepository
        );

        mockBrandRepository.findById = vi.fn((id) => {
            return id === brandId.toString()
                ? Promise.resolve(right(consistentBrand))
                : Promise.resolve(
                      left(new ResourceNotFoundError("Brand not found"))
                  );
        });
    });

    it("should create a product with variants", async () => {
        const result = await createProductUseCase.execute({
            name: "Test Product With Variants",
            description: "A test product description with variants",
            productColors: [colorId.toString()],
            productSizes: [sizeId.toString()],
            productCategories: [],
            brandId: brandId.toString(),
            price: 100,
            stock: 10,
            onSale: false,
            discount: 0,
            isFeatured: false,
            isNew: false,
            images: [],
            height: 100,
            width: 100,
            length: 100,
            weight: 100,
            hasVariants: true,
        });

        console.log("create prod with variants test result", result);

        if (result.isLeft()) {
            console.log("Error:", result.value?.message);
            throw new Error("Expected product to be created successfully");
        }

        const product = result.value.product;
        const productId = product.id.toString();

        expect(product).toBeDefined();
        expect(product.name).toEqual("Test Product With Variants");
        expect(product.description).toEqual(
            "A test product description with variants"
        );
        expect(product.stock).toEqual(10);
        expect(product.hasVariants).toEqual(true);

        const variantsResult =
            await mockProductVariantRepository.findByProductId(productId);
        if (variantsResult.isLeft()) {
            console.log("Error:", variantsResult.value?.message);
            throw new Error("Expected variants to be found");
        }

        const variants = variantsResult.value;
        expect(variants.length).toBeGreaterThan(0);

        const firstVariant = variants[0];
        if (firstVariant.sizeId) {
            expect(firstVariant.sizeId.toString()).toEqual(sizeId.toString());
        } else {
            throw new Error("Expected sizeId to be defined");
        }

        if (firstVariant.colorId) {
            expect(firstVariant.colorId.toString()).toEqual(colorId.toString());
        } else {
            throw new Error("Expected colorId to be defined");
        }

        expect(firstVariant.price).toEqual(100);
        expect(firstVariant.stock).toEqual(10);
        expect(firstVariant.status).toEqual(ProductStatus.ACTIVE);
    });

    it("should create a product with multiple colors and sizes", async () => {
        const anotherColorId = new UniqueEntityID("another_color_id_as_string");
        const anotherSizeId = new UniqueEntityID("another_size_id_as_string");

        const anotherConsistentColor = makeColor(
            { name: "Another Test Color Name" },
            anotherColorId
        );
        const anotherConsistentSize = makeSize(
            { name: "Another Test Size Name" },
            anotherSizeId
        );

        await mockColorRepository.create(anotherConsistentColor);
        await mockSizeRepository.create(anotherConsistentSize);

        const result = await createProductUseCase.execute({
            name: "Test Product with Multiple Colors and Sizes",
            description:
                "A test product description with multiple colors and sizes",
            productColors: [colorId.toString(), anotherColorId.toString()],
            productSizes: [sizeId.toString(), anotherSizeId.toString()],
            productCategories: [],
            brandId: brandId.toString(),
            price: 150,
            stock: 30,
            height: 5,
            width: 5,
            length: 5,
            weight: 5,
            onSale: true,
            discount: 15,
            isFeatured: false,
            isNew: true,
            images: ["image1.jpg", "image2.jpg"],
            hasVariants: true,
        });

        if (result.isLeft()) {
            console.log("Error:", result.value?.message);
            throw new Error("Expected product to be created successfully");
        }

        expect(result.isRight()).toBeTruthy();

        const product = result.value.product;
        expect(product.hasVariants).toBe(true);

        const variantsResult =
            await mockProductVariantRepository.findByProductId(
                product.id.toString()
            );

        if (variantsResult.isLeft()) {
            throw new Error("Expected variants to be found, but got an error");
        }

        const variants = variantsResult.value;
        expect(variants.length).toBe(4);

        const variantCombinations = variants.map((variant) => ({
            sizeId: variant.sizeId?.toString(),
            colorId: variant.colorId?.toString(),
        }));

        expect(variantCombinations).toEqual(
            expect.arrayContaining([
                { sizeId: sizeId.toString(), colorId: colorId.toString() },
                {
                    sizeId: sizeId.toString(),
                    colorId: anotherColorId.toString(),
                },
                {
                    sizeId: anotherSizeId.toString(),
                    colorId: colorId.toString(),
                },
                {
                    sizeId: anotherSizeId.toString(),
                    colorId: anotherColorId.toString(),
                },
            ])
        );
    });

    it("should apply discount correctly to all product variants", async () => {
        const discount = 20;
        const price = 200;
        const expectedFinalPrice = price - (price * discount) / 100;

        const result = await createProductUseCase.execute({
            name: "Test Product with Discount",
            description: "A test product with discount applied to variants",
            productColors: [colorId.toString()],
            productSizes: [sizeId.toString()],
            productCategories: [],
            brandId: brandId.toString(),
            price: price,
            stock: 20,
            height: 5,
            width: 5,
            length: 5,
            weight: 5,
            onSale: true,
            discount: discount,
            isFeatured: true,
            isNew: false,
            images: ["image1.jpg", "image2.jpg"],
            hasVariants: true,
        });

        expect(result.isRight()).toBeTruthy();
        if (result.isLeft()) {
            console.log("Error:", result.value?.message);
            throw new Error("Expected product to be created successfully");
        }

        const product = result.value.product;
        expect(product.hasVariants).toBe(true);
        expect(product.discount).toBe(discount);

        const variantsResult =
            await mockProductVariantRepository.findByProductId(
                product.id.toString()
            );

        if (variantsResult.isLeft()) {
            throw new Error("Expected variants to be found, but got an error");
        }

        const variants = variantsResult.value;

        expect(variants[0].price).toBe(expectedFinalPrice);
    });

    it("should create variants with sizes only when colors are not provided", async () => {
        const anotherSizeId = new UniqueEntityID("another_size_id_as_string");
        const anotherConsistentSize = makeSize(
            { name: "Another Test Size Name" },
            anotherSizeId
        );
        await mockSizeRepository.create(anotherConsistentSize);
        const result = await createProductUseCase.execute({
            name: "Test Product with Sizes Only",
            description: "A test product description with sizes only",
            productColors: [],
            productSizes: [sizeId.toString(), anotherSizeId.toString()],
            productCategories: [],
            brandId: brandId.toString(),
            price: 180,
            stock: 25,
            height: 6,
            width: 6,
            length: 6,
            weight: 6,
            onSale: false,
            discount: 0,
            isFeatured: false,
            isNew: true,
            images: ["image1.jpg", "image2.jpg"],
            hasVariants: true,
        });

        expect(result.isRight()).toBeTruthy();
        if (result.isLeft()) {
            console.log("Error:", result.value?.message);
            throw new Error("Expected product to be created successfully");
        }

        const product = result.value.product;
        expect(product.hasVariants).toBe(true);

        const variantsResult =
            await mockProductVariantRepository.findByProductId(
                product.id.toString()
            );

        if (variantsResult.isLeft()) {
            throw new Error("Expected variants to be found, but got an error");
        }

        const variants = variantsResult.value;
        expect(variants.length).toBe(2);

        const variantSizes = variants.map((variant) =>
            variant.sizeId?.toString()
        );
        expect(variantSizes).toEqual(
            expect.arrayContaining([
                sizeId.toString(),
                anotherSizeId.toString(),
            ])
        );
    });

    it("should return an error when creating product with duplicate variants", async () => {
        const result = await createProductUseCase.execute({
            name: "Test Product with Duplicate Variants",
            description: "A test product description with duplicate variants",
            productColors: [colorId.toString(), colorId.toString()],
            productSizes: [sizeId.toString(), sizeId.toString()],
            productCategories: [],
            brandId: brandId.toString(),
            price: 120,
            stock: 15,
            height: 4,
            width: 4,
            length: 4,
            weight: 4,
            onSale: true,
            discount: 5,
            isFeatured: false,
            isNew: true,
            images: ["image1.jpg", "image2.jpg"],
            hasVariants: true,
        });

        expect(result.isLeft()).toBeTruthy();

        const error = result.value;

        if (error !== null && error instanceof Error) {
            expect(error.message).toMatch(/Duplicate/);
        } else {
            throw new Error(
                "Expected an Error with 'Duplicate' message, but got null or a different type"
            );
        }
    });
});
