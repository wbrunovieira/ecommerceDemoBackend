import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";
import { CreateProductUseCase } from "./create-product";

import { InMemoryProductRepository } from "@test/repositories/in-memory-product-repository";
import { InMemoryProductColorRepository } from "@test/repositories/in-memory-product-color-repository";
import { InMemoryProductSizeRepository } from "@test/repositories/in-memory-product-size-repository";
import { InMemoryProductCategoryRepository } from "@test/repositories/in-memory-product-category";

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
import { fail } from "assert";

describe("CreateProductUseCase", () => {
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
    let variantRepository: IProductVariantRepository;

    let brandId: UniqueEntityID;

    let sizeId: UniqueEntityID;
    let colorId: UniqueEntityID;
    let categoryId: UniqueEntityID;
    let productId: UniqueEntityID;

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
            variantRepository
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

        mockProductSizeRepository.addItem(
            new ProductSize({
                productId: new UniqueEntityID("existing_product_id"),
                sizeId: sizeId,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
        );

        mockProductSizeRepository.findByProductId = vi.fn((productId) => {
            return Promise.resolve(
                mockProductSizeRepository.items.filter(
                    (item) => item.productId.toString() === productId
                )
            );
        });

        mockProductColorRepository.create = vi.fn(
            (productId: string, colorId: string) => {
                mockProductColorRepository.addItem(
                    new ProductColor({
                        productId: new UniqueEntityID(productId),
                        colorId: new UniqueEntityID(colorId),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })
                );
                return Promise.resolve(right(undefined));
            }
        );

        mockProductCategoryRepository.create = vi.fn(
            (productId: string, categoryId: string) => {
                mockProductCategoryRepository.addItem(
                    new ProductCategory({
                        productId: new UniqueEntityID(productId),
                        categoryId: new UniqueEntityID(categoryId),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })
                );
                return Promise.resolve(right(undefined));
            }
        );
    });

    it("should create a product", async () => {
        const result = await createProductUseCase.execute({
            name: "Test Product",
            description: "A test product description",
            productColors: [],
            productSizes: [],
            productCategories: [],
            brandId: brandId.toString(),
            price: 100,
            stock: 10,
            onSale: false,
            discount: 0,
            isFeatured: false,
            showInSite: true,
            isNew: false,
            images: [],
            height: 100,
            width: 100,
            length: 100,
            weight: 100,
        });
        console.log("create prod test result", result);
        if (result.isLeft()) {
            console.log("Error:", result.value?.message);
            throw new Error("Expected product to be created successfully");
        }
        const product = result.value.product;
        console.log("create prod test esult.value product", product);
        const productId = product.id.toString();

        expect(product).toBeDefined();
        expect(product.name).toEqual("Test Product");
        expect(product.description).toEqual("A test product description");
        expect(product.stock).toEqual(10);
    });

    it("should create a product with Brands repo and fields", async () => {
        const request = {
            name: "Test Product",
            description: "A test product description",
            productColors: [
                new UniqueEntityID("color_id_as_string").toString(),
            ],
            productSizes: [new UniqueEntityID("size_id_as_string").toString()],
            productCategories: [],

            brandId: brandId.toString(),
            price: 200,
            stock: 20,
            height: 2,
            width: 2,
            length: 2,
            weight: 2,
            onSale: true,
            discount: 10,
            isFeatured: true,
            showInSite: true,
            isNew: true,
            images: ["image1.jpg", "image2.jpg"],
            hasVariants: false,
        };

        const result = await createProductUseCase.execute(request);

        if (result.isLeft()) {
            const error = result.value;
            if (error !== null) {
                expect(error).toBeInstanceOf(ResourceNotFoundError);
                expect(error.message).toMatch(/Brand not found/);
            } else {
                throw new Error("Expected ResourceNotFoundError but got null");
            }
        } else {
            const product = result.value.product;
            const productId = product.id.toString();

            const variantsResult =
                await mockProductVariantRepository.findByProductId(productId);

            if (variantsResult.isLeft()) {
                throw new Error(
                    "Expected variants to be found, but got an error"
                );
            }

            const variants = variantsResult.value;
            expect(variants).toHaveLength(1);

            expect(result.isRight()).toBeTruthy();
        }
    });

    it("should return an error if brandId is invalid", async () => {
        const result = await createProductUseCase.execute({
            name: "Test Product",
            description: "A test product description",
            productColors: [],
            productSizes: [],
            productCategories: [],

            brandId: "invalid_brand_id",
            price: 100,
            stock: 10,
            onSale: false,
            discount: 0,
            isFeatured: false,
            showInSite: true,
            isNew: false,
            images: [],
            height: 2,
            width: 2,
            length: 2,
            weight: 2,
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            if (error !== null) {
                expect(error).toBeInstanceOf(ResourceNotFoundError);
                expect(error.message).toMatch(/Brand not found/);
            } else {
                throw new Error("Expected ResourceNotFoundError but got null");
            }
        }
    });

    it("should fail if required name fields are missing", async () => {
        const request = {
            name: "",
            description: "A test product description",
            productColors: [],
            productSizes: [],
            productCategories: [],

            brandId: "1",
            price: 100,
            stock: 10,
            onSale: false,
            discount: 0,
            isFeatured: false,
            showInSite: true,
            isNew: false,
            images: [],
            height: 2,
            width: 2,
            length: 2,
            weight: 2,
        };
        const result = await createProductUseCase.execute(request);

        if (result.isLeft()) {
            const errorMessage = result.value?.message || "";
            expect(errorMessage).toBe("Product name is required");
        }
    });

    it("should not allow negative stock values", async () => {
        const request = {
            name: "Test Product",
            description: "A test product description",
            productColors: [],
            productSizes: [],
            productCategories: [],

            brandId: "1",
            price: 100,
            stock: -1,
            onSale: false,
            discount: 0,
            isFeatured: false,
            showInSite: true,
            isNew: false,
            images: [],
            height: 2,
            width: 2,
            length: 2,
            weight: 2,
        };

        const result = await createProductUseCase.execute(request);

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const errorMessage = result.value?.message || "";
            expect(errorMessage).toBe("Stock cannot be negative");
        }
    });

    it("should return an error if price is negative", async () => {
        const result = await createProductUseCase.execute({
            name: "Test Product",
            description: "A test product description",
            productColors: [],
            productSizes: [],
            productCategories: [],

            brandId: brandId.toString(),
            price: -100,
            stock: 10,
            onSale: false,
            discount: 0,
            isFeatured: false,
            showInSite: true,
            isNew: false,
            images: [],
            height: 2,
            width: 2,
            length: 2,
            weight: 2,
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const errorMessage = result.value?.message || "";
            expect(errorMessage).toBe("Price cannot be negative");
        }
    });

    it("should handle errors when fetching brand data", async () => {
        const request = {
            name: "Test Product",
            description: "A test product description",
            productColors: [],
            productSizes: [],
            productCategories: [],

            brandId: "wrong id",
            price: 100,
            stock: 10,
            onSale: false,
            discount: 0,
            isFeatured: false,
            showInSite: true,
            isNew: false,
            images: [],
            height: 2,
            width: 2,
            length: 2,
            weight: 2,
        };

        const result = await createProductUseCase.execute(request);

        expect(result.isLeft()).toBeTruthy();
        if (result.isLeft()) {
            const errorMessage = result.value?.message || "";
            expect(errorMessage).toBe("Brand not found");
        }
    });

    it("should create a product with a valid brandId ", async () => {
        const result = await createProductUseCase.execute({
            name: "Test Product with valid Brand",
            description: "A test product description",
            productColors: [],
            productSizes: [],
            productCategories: [],
            brandId: brandId.toString(),
            price: 100,
            stock: 10,
            onSale: false,
            discount: 0,
            isFeatured: false,
            showInSite: true,
            isNew: false,
            images: [],
            height: 2,
            width: 2,
            length: 2,
            weight: 2,
        });

        if (result.isLeft()) {
            throw new Error("Expected product to be created successfully");
        }

        const product = result.value.product;
        const productId = product.id.toString();

        const variantsResult =
            await mockProductVariantRepository.findByProductId(productId);

        if (variantsResult.isLeft()) {
            throw new Error("Expected variants to be found, but got an error");
        }

        const variants = variantsResult.value;
        expect(variants).toHaveLength(1);

        expect(result.isRight()).toBeTruthy();

        if (result.isRight()) {
            const createdProduct = result.value.product;
            expect(createdProduct.brandId.toString()).toBe(brandId.toString());
        } else {
            fail("Expected a Right with the created product but got Left");
        }
    });

    it("should create a product with all fields provided", async () => {
        const result = await createProductUseCase.execute({
            name: "Complete Test Product",
            description: "A complete test product description",
            productColors: [
                new UniqueEntityID("color_id_as_string").toString(),
            ],
            productSizes: [new UniqueEntityID("size_id_as_string").toString()],
            productCategories: [],

            brandId: brandId.toString(),
            price: 250,
            stock: 50,
            height: 10,
            width: 5,
            length: 15,
            weight: 20,
            onSale: true,
            discount: 20,
            isFeatured: true,
            showInSite: true,
            isNew: true,
            images: ["image1.jpg", "image2.jpg"],
        });

        if (result.isLeft()) {
            throw new Error("Expected product to be created successfully");
        }

        const createdProduct = result.value.product; // Defina a variável aqui
        const productId = createdProduct.id.toString();

        const colors =
            await mockProductColorRepository.findByProductId(productId);
        expect(colors).toHaveLength(1);
        expect(colors[0].colorId?.toString()).toBe(colorId.toString());

        const sizes =
            await mockProductSizeRepository.findByProductId(productId);
        expect(sizes).toHaveLength(1);
        expect(sizes[0].sizeId?.toString()).toBe(sizeId.toString());

        expect(result.isRight()).toBeTruthy();

        const variantsResult =
            await mockProductVariantRepository.findByProductId(productId);

        if (variantsResult.isLeft()) {
            throw new Error("Expected variants to be found, but got an error");
        }

        const variants = variantsResult.value;
        expect(variants).toHaveLength(1);
        expect(variants[0].colorId?.toString()).toBe(colorId.toString());
        expect(variants[0].sizeId?.toString()).toBe(sizeId.toString());

        // Verificações do produto criado
        expect(createdProduct.price).toBe(250);
        expect(createdProduct.stock).toBe(50);
        expect(createdProduct.height).toBe(10);
        expect(createdProduct.width).toBe(5);
        expect(createdProduct.length).toBe(15);
        expect(createdProduct.weight).toBe(20);
        expect(createdProduct.onSale).toBe(true);
        expect(createdProduct.discount).toBe(20);
        expect(createdProduct.isFeatured).toBe(true);
        expect(createdProduct.isNew).toBe(true);
        expect(createdProduct.images).toEqual(["image1.jpg", "image2.jpg"]);
    });

    it("should return an error if  brandId  are invalid", async () => {
        const result = await createProductUseCase.execute({
            name: "Test Product",
            description: "A test product description",
            productColors: [],
            productSizes: [],
            productCategories: [],
            brandId: "invalid_brand_id",
            price: 100,
            stock: 10,
            onSale: false,
            discount: 0,
            isFeatured: false,
            showInSite: true,
            isNew: false,
            images: [],
            height: 2,
            width: 2,
            length: 2,
            weight: 2,
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            if (error !== null) {
                expect(error).toBeInstanceOf(ResourceNotFoundError);
                expect(error.message).toMatch(/Brand not found/);
            } else {
                throw new Error("Expected ResourceNotFoundError but got null");
            }
        }
    });

    it("should create a product with a valid sizeId", async () => {
        const result = await createProductUseCase.execute({
            name: "Test Product with Size",
            description: "A test product description",
            productColors: [],
            productSizes: [sizeId.toString()],
            productCategories: [],
            brandId: brandId.toString(),
            price: 200,
            stock: 20,
            height: 2,
            width: 2,
            length: 2,
            weight: 2,
            onSale: true,
            discount: 10,
            isFeatured: true,
            showInSite: true,
            isNew: true,
            images: ["image1.jpg", "image2.jpg"],
        });

        expect(result.isRight()).toBeTruthy();

        if (result.isRight()) {
            const createdProduct = result.value.product;
            const productId = createdProduct.id.toString();

            const sizes = await mockProductSizeRepository.findByProductId(
                createdProduct.id.toString()
            );

            expect(sizes).toHaveLength(1);
            expect(sizes[0].sizeId.toString()).toBe(sizeId.toString());

            const variantsResult =
                await mockProductVariantRepository.findByProductId(productId);

            if (variantsResult.isLeft()) {
                throw new Error(
                    "Expected variants to be found, but got an error"
                );
            }

            const variants = variantsResult.value;
            expect(variants).toHaveLength(1);
            expect(variants[0].sizeId?.toString()).toBe(sizeId.toString());
        } else {
            fail("Expected a Right with the created product but got Left");
        }
    });

    it("should create a product with multiple valid sizeIds", async () => {
        const anotherSizeId = new UniqueEntityID("another_size_id_as_string");
        const anotherConsistentSize = makeSize(
            { name: "Another Test Size Name" },
            anotherSizeId
        );
        mockSizeRepository.create(anotherConsistentSize);

        const result = await createProductUseCase.execute({
            name: "Test Product with Multiple Sizes",
            description: "A test product description",
            productColors: [],
            productSizes: [sizeId.toString(), anotherSizeId.toString()],
            productCategories: [],
            brandId: brandId.toString(),
            price: 250,
            stock: 25,
            height: 3,
            width: 3,
            length: 3,
            weight: 3,
            onSale: true,
            discount: 15,
            isFeatured: true,
            showInSite: true,
            isNew: true,
            images: ["image1.jpg", "image2.jpg"],
        });

        expect(result.isRight()).toBeTruthy();

        if (result.isLeft()) {
            throw new Error("Expected product to be created successfully");
        }

        const product = result.value.product;
        const productId = product.id.toString();

        const variantsResult =
            await mockProductVariantRepository.findByProductId(productId);

        if (variantsResult.isLeft()) {
            throw new Error("Expected variants to be found, but got an error");
        }

        const variants = variantsResult.value;
        expect(variants).toHaveLength(2);

        const sizes = mockProductSizeRepository.items.filter(
            (item) => item.productId.toString() === product.id.toString()
        );
        expect(sizes).toHaveLength(2);
        expect(sizes.map((size) => size.sizeId.toString())).toEqual(
            expect.arrayContaining([
                sizeId.toString(),
                anotherSizeId.toString(),
            ])
        );
    });

    it("should not allow creating a ProductSize with invalid sizeId", async () => {
        const invalidSizeId = "invalid_size_id";
        const result = await createProductUseCase.execute({
            name: "Test Product with Multiple Sizes",
            description: "A test product description",
            productColors: [],
            productSizes: [invalidSizeId],
            productCategories: [],

            brandId: brandId.toString(),
            price: 250,
            stock: 25,
            height: 3,
            width: 3,
            length: 3,
            weight: 3,
            onSale: true,
            discount: 15,
            isFeatured: true,
            showInSite: true,
            isNew: true,
            images: ["image1.jpg", "image2.jpg"],
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            if (error !== null) {
                expect(error).toBeInstanceOf(ResourceNotFoundError);
                expect(error.message).toBe(`Size not found: ${invalidSizeId}`);
            } else {
                throw new Error("Expected ResourceNotFoundError but got null");
            }
        }
    });

    it("should not allow duplicate sizes for the same product", async () => {
        const result = await createProductUseCase.execute({
            name: "Test Product",
            description: "A test product description",
            productColors: [],
            productSizes: [sizeId.toString(), sizeId.toString()],
            productCategories: [],

            brandId: brandId.toString(),
            price: 100,
            stock: 10,
            height: 10,
            width: 10,
            length: 10,
            weight: 10,
            onSale: false,
            showInSite: true,
            discount: 0,
            isFeatured: false,
            isNew: false,
            images: [],
        });

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            if (error !== null) {
                expect(error).toBeInstanceOf(ResourceNotFoundError);
                expect(error.message).toBe(
                    `Duplicate size: ${sizeId.toString()}`
                );
            } else {
                throw new Error("Expected ResourceNotFoundError but got null");
            }
        }
    });

    it("should list all sizes for a given product", async () => {
        const createResult = await createProductUseCase.execute({
            name: "Test Product",
            description: "A test product description",
            productColors: [],
            productSizes: [sizeId.toString()],
            productCategories: [],

            brandId: brandId.toString(),
            price: 100,
            stock: 10,
            height: 10,
            width: 10,
            length: 10,
            weight: 10,
            onSale: false,
            showInSite: true,
            discount: 0,
            isFeatured: false,
            isNew: false,
            images: [],
        });

        if (createResult.isLeft()) {
            throw new Error("Expected product to be created successfully");
        }

        const product = createResult.value.product;
        const productId = product.id.toString();

        const variantResult =
            await mockProductVariantRepository.findByProductId(productId);

        if (variantResult.isLeft()) {
            throw new Error("Expected to find product variants successfully");
        }

        const variants = variantResult.value; // Access the ProductVariant[] array
        const sizes = variants.map((variant) => variant.sizeId);

        expect(sizes).toContainEqual(sizeId);
    });
});
