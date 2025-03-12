import {
    Body,
    Controller,
    Delete,
    HttpException,
    HttpStatus,
    Param,
    Get,
    Post,
    Request,
    Query,
    Put,
    Patch,
    UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";

import { ZodValidationsPipe } from "../../../pipes/zod-validations-pipe";

import { z } from "zod";
import { CreateProductUseCase } from "@/domain/catalog/application/use-cases/create-product";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { EditProductUseCase } from "@/domain/catalog/application/use-cases/edit-product";
import { PrismaService } from "@/prisma/prisma.service";
import { GetProductBySlugUseCase } from "@/domain/catalog/application/use-cases/get-product-by-slug";
import { GetProductsByCategoryIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-category";
import { FindProductByNameUseCase } from "@/domain/catalog/application/use-cases/find-all-products-by-name";
import { GetProductsByBrandIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-brand";
import { GetProductsByColorIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-color";
import { GetProductsBySizeIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-size";
import { GetProductsByPriceRangeUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-price-range";

import { GetProductByIdUseCase } from "@/domain/catalog/application/use-cases/get-product-by-id";


import { UpdateProductVariantUseCase } from "@/domain/catalog/application/use-cases/update-product-variant-use-case";
import { toDomainProductStatus } from "@/infra/database/prisma/utils/convert-product-status";
import {
    GetAllProductsUseCase,
    ProductObject,
} from "@/domain/catalog/application/use-cases/get-all-products";
import { AddCategoriesToProductUseCase } from "@/domain/catalog/application/use-cases/add-category-to-product";
import { GetFeaturedProductsUseCase } from "@/domain/catalog/application/use-cases/get-featured-products";

const createProductBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    productColors: z.array(z.string()).optional(),
    productSizes: z.array(z.string()).optional(),
    productCategories: z.array(z.string()),

    brandId: z.string(),
    sku: z.string().optional(),
    price: z.number(),
    erpId: z.string().optional(),
    stock: z.number(),
    discount: z.number().optional(),
    onSale: z.boolean().optional(),
    isNew: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    showInSite: z.boolean().optional(),
    images: z.array(z.string()).max(5).optional(),
    height: z.number(),
    width: z.number(),
    length: z.number(),
    weight: z.number(),
    hasVariants: z.boolean().optional(),
});

const bodyValidationPipe = new ZodValidationsPipe(createProductBodySchema);

type CreateProductBodySchema = z.infer<typeof createProductBodySchema>;

const pageQueryParamSchema = z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().min(1));

const editProductSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    productSizes: z
        .array(z.object({ id: z.string(), name: z.string() }))
        .optional(),
    productColors: z
        .array(z.object({ id: z.string(), name: z.string(), hex: z.string() }))
        .optional(),
    productCategories: z
        .array(z.object({ id: z.string(), name: z.string() }))
        .optional(),
    slug: z.array(z.string()).optional(),

    sizeId: z.array(z.string()).optional(),
    brandId: z.string().optional(),
    discount: z.number().optional(),
    price: z.number().optional(),
    stock: z.number().optional(),
    erpId: z.string().optional(),
    sku: z.string().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
    length: z.number().optional(),
    weight: z.number().optional(),
    onSale: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    showInSite: z.boolean().optional(),
    isNew: z.boolean().optional(),
    images: z.array(z.string()).optional(),
});

type EditProductBodySchema = z.infer<typeof editProductSchema>;
const queryValidationPipe = new ZodValidationsPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

export const updateProductVariantSchema = z.object({
    sku: z.string().optional(),
    stock: z.number().optional(),
    price: z.number().optional(),
    images: z.array(z.string()).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"]).optional(),
});

const updateProductVariantValidationPipe = new ZodValidationsPipe(
    updateProductVariantSchema
);

export type UpdateProductVariantSchema = z.infer<
    typeof updateProductVariantSchema
>;

@Controller("/products")
export class ProductController {
    constructor(
        private createProductUseCase: CreateProductUseCase,
        private prisma: PrismaService,
        private editProductUseCase: EditProductUseCase,
        private getProductBySlug: GetProductBySlugUseCase,
        private getAllProductsByCategoryId: GetProductsByCategoryIdUseCase,
        private getAllProductsByBrandId: GetProductsByBrandIdUseCase,

        private getAllProductsByColorId: GetProductsByColorIdUseCase,
        private getAllProductsBySizeId: GetProductsBySizeIdUseCase,
        private getAllProductsByIdUseCase: GetProductByIdUseCase,
        private updateProductVariantUseCase: UpdateProductVariantUseCase,
        private findProductByName: FindProductByNameUseCase,
        private getProductsByPriceRange: GetProductsByPriceRangeUseCase,
        private getAllProductsUseCase: GetAllProductsUseCase,
        private addCategoriesToProductUseCase: AddCategoriesToProductUseCase,
        private readonly getFeaturedProductsUseCase: GetFeaturedProductsUseCase
    ) {}

    @Post()
    @Roles("admin")
    async createProduct(
        @Body(bodyValidationPipe) body: CreateProductBodySchema
    ) {
        try {
            const result = await this.createProductUseCase.execute({
                name: body.name,
                description: body.description,
                productColors: body.productColors,
                productSizes: body.productSizes,
                productCategories: body.productCategories,

                brandId: body.brandId,
                price: body.price,
                stock: body.stock,
                erpId: body.erpId,
                sku: body.sku || "sku text",
                discount: body.discount || 0,
                onSale: body.onSale || false,
                isNew: body.isNew || false,
                isFeatured: body.isFeatured || false,
                showInSite: body.showInSite || true,
                images: body.images || [],
                height: body.height,
                width: body.width,
                length: body.length,
                weight: body.weight,
                hasVariants: body.hasVariants || false,
            });

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.BAD_REQUEST
                    );
                }
            } else {
                return { product: result.value.product };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                console.error("Error creating product:", error);
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(
                "Failed to create product",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("/search")
    async searchProducts(@Query("name") name: string) {
        if (!name) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    error: "Bad Request",
                    message: "Query parameter 'name' is required",
                },
                HttpStatus.BAD_REQUEST
            );
        }

        const result = await this.findProductByName.execute({ name });

        if (result.isLeft()) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.NOT_FOUND,
                    error: "Not Found",
                    message: `No products found for the specified name: ${name}.`,
                },
                HttpStatus.NOT_FOUND
            );
        }

        return { products: result.value };
    }

    @Get("/size/:sizeId")
    async allProductsBySize(@Param("sizeId") sizeId: string) {
        try {
            const result = await this.getAllProductsBySizeId.execute({
                sizeId,
            });

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    console.error(`Products not found: ${error.message}`);
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                } else {
                    throw new HttpException(
                        "An unexpected error occurred.",
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
                }
            } else {
                return result.value;
            }
        } catch (error) {}
    }

    @Get("/category/:categoryId")
    async allProductsByCategory(@Param("categoryId") categoryId: string) {
        try {
            const result = await this.getAllProductsByCategoryId.execute({
                categoryId,
            });

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    console.error(`Products not found: ${error.message}`);
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                } else {
                    throw new HttpException(
                        "An unexpected error occurred.",
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
                }
            } else {
                return result.value;
            }
        } catch (error) {}
    }

    @Get("/brand/:brandId")
    async allProductsByBrand(@Param("brandId") brandId: string) {
        try {
            const result = await this.getAllProductsByBrandId.execute({
                brandId,
            });

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    console.error(`Products not found: ${error.message}`);
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                } else {
                    throw new HttpException(
                        "An unexpected error occurred.",
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
                }
            } else {
                return result.value;
            }
        } catch (error) {}
    }

    @Get("/color/:colorId")
    async allProductsByColor(@Param("colorId") colorId: string) {
        try {
            const result = await this.getAllProductsByColorId.execute({
                colorId,
            });

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    console.error(`Products not found: ${error.message}`);
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                } else {
                    throw new HttpException(
                        "An unexpected error occurred.",
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
                }
            }
            return result.value;
        } catch (error) {}
    }

    @Get("/price-range")
    async allProductsByPriceRange(
        @Query("minPrice") minPrice: string,
        @Query("maxPrice") maxPrice: string
    ) {
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        if (isNaN(min) || isNaN(max)) {
            throw new HttpException(
                "Invalid price range",
                HttpStatus.BAD_REQUEST
            );
        }

        try {
            const result = await this.getProductsByPriceRange.execute({
                minPrice: min,
                maxPrice: max,
            });

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    console.error(`Products not found: ${error.message}`);
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                } else {
                    throw new HttpException(
                        "An unexpected error occurred.",
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
                }
            } else {
                return result.value;
            }
        } catch (error) {
            throw new HttpException(
                "Failed to retrieve products by price range",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("/featured-products")
    async feature() {
        try {
            const products = await this.getFeaturedProductsUseCase.execute();

            return { products };
        } catch (error) {
            console.error("Erro ao buscar produtos em destaque:", error);
            throw error;
        }
    }

    @Get("all")
    async getAll(
        @Query("page") page: PageQueryParamSchema
    ): Promise<{ products: ProductObject[] }> {
        try {
            const result = await this.getAllProductsUseCase.execute();

            if (result.isLeft()) {
                const error = result.value;

                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }

                throw new HttpException(
                    "Unexpected error occurred",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            const products = result.value;

            return { products };
        } catch (error) {
            console.error(
                "An error occurred while processing the request",
                error
            );
            throw new HttpException(
                "An internal server error occurred",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    @Get(":id")
    async getProduct(@Param("id") id: string, @Request() req: any) {
        try {
            const isAdmin = req.user?.role === "admin";
            console.log("isAdmin", isAdmin);
            console.log("req.user?.role", req.user?.role);
            console.log("req.user", req.user);

            const result = await this.getAllProductsByIdUseCase.execute({
                productId: id,
                isAdminContext: isAdmin,
            });

            if (result.isLeft()) {
                throw new HttpException(
                    "Failed to find product",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            const productWithVariants = result.value;
            return { product: productWithVariants };
        } catch (error) {
            throw new HttpException(
                "Failed to find product",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("slug/:slug")
    async getProductbySlug(@Param("slug") slug: string) {
        try {
            const result = await this.getProductBySlug.execute({ slug });

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    console.error(`Product not found: ${error.message}`);
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                } else {
                    throw new HttpException(
                        "An unexpected error occurred.",
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
                }
            } else {
                const {
                    product,
                    brandName = "Unknown Brand",
                    colors = [],
                    sizes = [],
                    categories = [],
                    variants = [],
                } = result.value;

                if (!product) {
                    throw new HttpException(
                        "Product not found",
                        HttpStatus.NOT_FOUND
                    );
                }
                return {
                    product: product,
                    slug: product.slug,

                    brandName,
                    colors,
                    sizes,
                    categories,
                    variants,
                };
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                console.error(`Failed to find slug: ${error.message}`);
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                "Failed to find slug",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Patch("update/variant/:variantId")
    @Roles("admin")
    async updateProductVariant(
        @Param("variantId") variantId: string,
        @Body(updateProductVariantValidationPipe)
        body: UpdateProductVariantSchema
    ) {
        const { status, ...rest } = body;
        const variantUpdate = {
            id: variantId,
            ...rest,
            status: status ? toDomainProductStatus(status) : undefined,
        };

        const result = await this.updateProductVariantUseCase.execute({
            variantUpdate,
        });

        if (result.isLeft()) {
            throw new HttpException(result.value.message, HttpStatus.NOT_FOUND);
        }

        return {
            message: "Product variant updated successfully",
        };
    }

    @Put("save/:id")
    async editProduct(@Param("id") id: string, @Body() body: any) {
        console.log("bateu no save/:id", id);
        const result = await this.editProductUseCase.execute({
            productId: id,
            ...body,
        });
        console.log("save/ result controller", result);
        console.log("save/ result controller body", body);

        if (result.isLeft()) {
            throw new HttpException(
                "Failed to update product",
                HttpStatus.BAD_REQUEST
            );
        }

        const productWithVariants = result.value;
        return { product: productWithVariants };
    }

    @Post("/add-categories/:productId")
    @Roles("admin")
    async addCategoryToProduct(
        @Param("productId") productId: string,
        @Body() body: { categories: string[] }
    ) {
        try {
            const result = await this.addCategoriesToProductUseCase.execute({
                productId,
                categories: body.categories,
            });

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new HttpException(
                        error.message,
                        HttpStatus.NOT_FOUND
                    );
                }
                throw new HttpException(
                    "Failed to add categories to product",
                    HttpStatus.BAD_REQUEST
                );
            }

            return {
                message: "Categories added successfully",
                product: result.value.product,
            };
        } catch (error) {
            console.error("Error adding categories to product:", error);
            throw new HttpException(
                "An error occurred while adding categories",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
