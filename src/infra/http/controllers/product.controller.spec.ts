import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Reflector } from "@nestjs/core";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { vi } from "vitest";

import { CreateProductUseCase } from "@/domain/catalog/application/use-cases/create-product";
import { ProductController } from "./product.controller";
import { Product } from "@/domain/catalog/enterprise/entities/product";
import { PrismaService } from "@/prisma/prisma.service";
import { EditProductUseCase } from "@/domain/catalog/application/use-cases/edit-product";
import { GetAllProductsByIdUseCase } from "@/domain/catalog/application/use-cases/get-product-by-id";
import { GetProductBySlugUseCase } from "@/domain/catalog/application/use-cases/get-product-by-slug";
import { GetProductsByCategoryIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-category";
import { GetProductsByBrandIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-brand";
import { GetProductsByColorIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-color";
import { GetProductsBySizeIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-size";
import { UpdateProductVariantUseCase } from "@/domain/catalog/application/use-cases/update-product-variant-use-case";
import { FindProductByNameUseCase } from "@/domain/catalog/application/use-cases/find-all-products-by-name";
import { GetProductsByPriceRangeUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-price-range";
import { GetAllProductsUseCase } from "@/domain/catalog/application/use-cases/get-all-products";

describe("ProductController", () => {
    let productController: ProductController;
    let createProductUseCase: CreateProductUseCase;
    let editProductUseCase: EditProductUseCase;
    let findProductByIdUseCase: GetAllProductsByIdUseCase;
    let getProductBySlugUseCase: GetProductBySlugUseCase;
    let getProductsByCategoryIdUseCase: GetProductsByCategoryIdUseCase;
    let getAllProductsUseCase: GetAllProductsUseCase;
    let getProductsByBrandIdUseCase: GetProductsByBrandIdUseCase;
    let getProductsByColorIdUseCase: GetProductsByColorIdUseCase;
    let getProductsBySizeIdUseCase: GetProductsBySizeIdUseCase;
    let updateProductVariantUseCase: UpdateProductVariantUseCase;
    let findProductByNameUseCase: FindProductByNameUseCase;
    let getProductsByPriceRangeUseCase: GetProductsByPriceRangeUseCase;
    let prismaService: PrismaService;

    let consoleErrorSpy: any;

    beforeEach(async () => {
        consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [
                PrismaService,
                {
                    provide: CreateProductUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },

                {
                    provide: EditProductUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: GetAllProductsByIdUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: GetProductBySlugUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: GetProductsByCategoryIdUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: GetProductsByBrandIdUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: GetProductsByColorIdUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: GetProductsBySizeIdUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: UpdateProductVariantUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: FindProductByNameUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
                {
                    provide: GetProductsByPriceRangeUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },

                // {
                //   provide: DeleteProductUseCase,
                //   useValue: {
                //     execute: vi.fn(),
                //   },
                // },
                Reflector,
                {
                    provide: JwtAuthGuard,
                    useValue: {
                        canActivate: (context: ExecutionContext) => {
                            const request = context.switchToHttp().getRequest();
                            request.user = { role: "admin" };
                            return true;
                        },
                    },
                },
                {
                    provide: RolesGuard,
                    useValue: {
                        canActivate: (context: ExecutionContext) => {
                            const request = context.switchToHttp().getRequest();
                            request.user = { role: "admin" };
                            return true;
                        },
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: () => "test-token",
                        verify: () => ({ id: "admin-id", role: "admin" }),
                    },
                },
            ],
        }).compile();

        productController = module.get<ProductController>(ProductController);
        createProductUseCase =
            module.get<CreateProductUseCase>(CreateProductUseCase);
        prismaService = module.get<PrismaService>(PrismaService);
        editProductUseCase = module.get<EditProductUseCase>(EditProductUseCase);
        findProductByIdUseCase = module.get<GetAllProductsByIdUseCase>(
            GetAllProductsByIdUseCase
        );
        getProductBySlugUseCase = module.get<GetProductBySlugUseCase>(
            GetProductBySlugUseCase
        );
        getProductsByCategoryIdUseCase =
            module.get<GetProductsByCategoryIdUseCase>(
                GetProductsByCategoryIdUseCase
            );
        getProductsByBrandIdUseCase = module.get<GetProductsByBrandIdUseCase>(
            GetProductsByBrandIdUseCase
        );
        getProductsByColorIdUseCase = module.get<GetProductsByColorIdUseCase>(
            GetProductsByColorIdUseCase
        );
        getProductsBySizeIdUseCase = module.get<GetProductsBySizeIdUseCase>(
            GetProductsBySizeIdUseCase
        );
        updateProductVariantUseCase = module.get<UpdateProductVariantUseCase>(
            UpdateProductVariantUseCase
        );
        findProductByNameUseCase = module.get<FindProductByNameUseCase>(
            FindProductByNameUseCase
        );
        getProductsByPriceRangeUseCase =
            module.get<GetProductsByPriceRangeUseCase>(
                GetProductsByPriceRangeUseCase
            );

        // deleteProductUseCase =
        //   module.get<DeleteProductUseCase>(DeleteProductUseCase);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("should create a product successfully", async () => {
        const mockProduct = Product.create(
            {
                name: "ProductName",
                description: "ProductDescription",
                brandId: new UniqueEntityID(),
                price: 100,
                stock: 10,
                images: [],
                onSale: false,
                discount: 0,
                isFeatured: false,
                isNew: false,
                sku: "sku-123",
                length: 10,
                height: 10,
                width: 10,
                weight: 10,
                hasVariants: false,
            },
            new UniqueEntityID()
        );

        const mockResult = right({ product: mockProduct }) as Either<
            ResourceNotFoundError,
            { product: Product }
        >;

        vi.spyOn(createProductUseCase, "execute").mockResolvedValue(mockResult);

        const result = await productController.createProduct({
            name: "ProductName",
            description: "ProductDescription",
            productCategories: ["category1", "category2"],
            brandId: "brand-id",
            price: 100,
            stock: 10,
            images: [],
            onSale: false,
            discount: 0,
            isFeatured: false,
            isNew: false,
            length: 10,
            height: 10,
            width: 10,
            weight: 10,
            hasVariants: false,
            sku: "sku text",
            erpId: undefined,
            productColors: undefined,
            productSizes: undefined,
        });

        expect(result).toEqual({ product: mockProduct });
        expect(createProductUseCase.execute).toHaveBeenCalledWith({
            name: "ProductName",
            description: "ProductDescription",
            brandId: "brand-id",
            price: 100,
            stock: 10,
            images: [],
            onSale: false,
            discount: 0,
            isFeatured: false,
            isNew: false,
            length: 10,
            height: 10,
            width: 10,
            weight: 10,
            sku: "sku text",
            erpId: undefined,
            productColors: undefined,
            productSizes: undefined,
            productCategories: ["category1", "category2"],
            hasVariants: false,
        });
    });

    it("should handle errors thrown by CreateProductUseCase", async () => {
        vi.spyOn(createProductUseCase, "execute").mockImplementation(() => {
            throw new Error("CreateProductUseCase error");
        });

        try {
            await productController.createProduct({
                name: "ProductWithError",
                description: "DescriptionWithError",
                productCategories: ["category1", "category2"],

                brandId: "brand-id",
                price: 100,
                stock: 10,
                images: [],
                onSale: false,
                discount: 0,
                isFeatured: false,
                isNew: false,
                productColors: ["color1", "color2"],
                productSizes: ["size1", "size2"],
                sku: "sku-123",
                length: 0,
                height: 0,
                width: 0,
                weight: 0,
            });
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to create product");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should find a product by id successfully", async () => {
        const mockProduct = Product.create(
            {
                name: "ProductName",
                description: "ProductDescription",
                brandId: new UniqueEntityID(),
                price: 100,
                stock: 10,
                images: [],
                onSale: false,
                discount: 0,
                isFeatured: false,
                isNew: false,
                sku: "sku-123",
                length: 10,
                height: 10,
                width: 10,
                weight: 10,
                hasVariants: false,
            },
            new UniqueEntityID("product-1")
        );

        const mockResult = right(mockProduct) as Either<
            ResourceNotFoundError,
            Product
        >;

        vi.spyOn(findProductByIdUseCase, "execute").mockResolvedValue(
            mockResult
        );

        const result = await productController.getProduct("product-1");

        expect(result).toEqual({ product: mockProduct });
        expect(findProductByIdUseCase.execute).toHaveBeenCalledWith({
            productId: "product-1",
        });
    });

    it("should handle errors thrown by FindProductByIdUseCase", async () => {
        vi.spyOn(findProductByIdUseCase, "execute").mockImplementation(() => {
            throw new Error("FindProductByIdUseCase error");
        });

        try {
            await productController.getProduct("ProductWithError");
        } catch (error) {
            if (error instanceof HttpException) {
                expect(error.message).toBe("Failed to find product");
                expect(error.getStatus()).toBe(
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            } else {
                throw new Error("Expected HttpException");
            }
        }
    });

    it("should get all products successfully", async () => {
        const mockProduct1 = Product.create(
            {
                name: "ProductName1",
                description: "ProductDescription1",
                brandId: new UniqueEntityID(),
                price: 100,
                stock: 10,
                images: [],
                onSale: false,
                discount: 0,
                isFeatured: false,
                isNew: false,
                sku: "sku-123",
                length: 10,
                height: 10,
                width: 10,
                weight: 10,
                hasVariants: false,
            },
            new UniqueEntityID()
        );

        const mockProduct2 = Product.create(
            {
                name: "ProductName2",
                description: "ProductDescription2",
                brandId: new UniqueEntityID(),
                price: 100,
                stock: 10,
                images: [],
                onSale: false,
                discount: 0,
                isFeatured: false,
                isNew: false,
                sku: "sku-123",
                length: 10,
                height: 10,
                width: 10,
                weight: 10,
                hasVariants: false,
            },
            new UniqueEntityID()
        );
        const mockResult = right([mockProduct1, mockProduct2]) as Either<
            ResourceNotFoundError,
            Product[]
        >;

        vi.spyOn(getAllProductsUseCase, "execute").mockResolvedValue(
            mockResult
        );

        const result = await productController.getAllProducts({
            page: 1,
            pageSize: 10,
        });

        expect(result).toEqual({ products: mockResult.value });
        expect(getAllProductsUseCase.execute).toHaveBeenCalledWith({
            page: 1,
            pageSize: 10,
        });
    });

    //   it("should handle errors thrown by GetAllProductsUseCase", async () => {
    //     vi.spyOn(getAllProductsUseCase, "execute").mockImplementation(() => {
    //       throw new Error("GetAllProductsUseCase error");
    //     });

    //     try {
    //       await productController.getAllProducts({ page: 1, pageSize: 10 });
    //     } catch (error) {
    //       if (error instanceof HttpException) {
    //         expect(error.message).toBe("Failed to retrieve products");
    //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    //       } else {
    //         throw new Error("Expected HttpException");
    //       }
    //     }
    //   });

    //   it("should delete a product successfully", async () => {
    //     const mockResult = right({}) as Either<ResourceNotFoundError, {}>;
    //     vi.spyOn(deleteProductUseCase, "execute").mockResolvedValue(mockResult);

    //     const result = await productController.deleteProduct("product-1");

    //     expect(result).toEqual({ message: "Product deleted successfully" });
    //     expect(deleteProductUseCase.execute).toHaveBeenCalledWith({
    //       productId: "product-1",
    //     });
    //   });

    //   it("should handle errors thrown by DeleteProductUseCase", async () => {
    //     vi.spyOn(deleteProductUseCase, "execute").mockImplementation(() => {
    //       throw new Error("DeleteProductUseCase error");
    //     });

    //     try {
    //       await productController.deleteProduct("ProductWithError");
    //     } catch (error) {
    //       if (error instanceof HttpException) {
    //         expect(error.message).toBe("Failed to delete product");
    //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    //       } else {
    //         throw new Error("Expected HttpException");
    //       }
    //     }
    //   });
});
