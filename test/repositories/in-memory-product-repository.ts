import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";

import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";

import { Product } from "@/domain/catalog/enterprise/entities/product";

import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";

@Injectable()
export class InMemoryProductRepository implements IProductRepository {
    variantRepository: IProductVariantRepository;
    items: Product[] = [];

    constructor(variantRepository: IProductVariantRepository) {
        this.variantRepository = variantRepository;
        this.items = [];
    }
    nameAlreadyExists(name: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    private async generateUniqueSlug(
        baseSlug: string,
        productId?: string
    ): Promise<string> {
        let slug = baseSlug;
        let count = 0;
        let existingProduct;

        do {
            existingProduct = this.items.find(
                (item) =>
                    item.slug.value === slug && item.id.toString() !== productId
            );

            if (existingProduct) {
                count++;
                slug = `${baseSlug}-${count}`;
            }
        } while (existingProduct);

        return slug;
    }

    async getFeaturedProducts(): Promise<Product[]> {
        const featuredProducts = this.items
            .filter((product) => product.isFeatured)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 12);

        return featuredProducts;
    }

    async getAllProducts(): Promise<Either<Error, Product[]>> {
        console.log("bateu no async getAllProducts");
        if (this.items.length === 0) {
            return left(new ResourceNotFoundError("No products found"));
        }
        return right(this.items);
    }

    async create(product: Product): Promise<Either<Error, Product>> {
        console.log("async create inmemory repo product bateu");
        const existingProduct = this.items.find(
            (item) => item.id.toString() === product.id.toString()
        );
        if (existingProduct) {
            return left(new Error("Product already exists"));
        }
        console.log("async create inmemory repo product", product);

        this.items.push(product);
        console.log("async create inmemory repo this.items", this.items);
        return right(product);
    }

    async findByColorId(colorId: string): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) => product.productColors.toString() === colorId
        );

        if (!products.length) {
            return left(new Error("Products not found for the given color id"));
        }

        return right(products);
    }

    async findByCategoryId(
        categoryId: string
    ): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) =>
                product.productCategories &&
                product.productCategories.some(
                    (category) => category.id.toString() === categoryId
                )
        );

        if (!products.length) {
            return left(
                new Error("Products not found for the given category id")
            );
        }

        return right(products);
    }

    async findByBrandId(brandId: string): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) => product.brandId.toString() === brandId
        );

        if (!products.length) {
            return left(new Error("Products not found for the given brand id"));
        }

        return right(products);
    }

    async findByPriceRange(
        minPrice: number,
        maxPrice: number
    ): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) => product.price >= minPrice && product.price <= maxPrice
        );

        if (!products.length) {
            return left(
                new Error("Products not found for the given price range")
            );
        }

        return right(products);
    }

    async findBySizeId(sizeId: string): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) =>
                product.productSizes &&
                product.productSizes.some(
                    (size) => size.id.toString() === sizeId
                )
        );

        if (!products.length) {
            return left(new Error("Products not found for the given size id"));
        }

        return right(products);
    }

    async findByName(name: string): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) => product.name.toString() === name
        );

        if (!products.length) {
            return left(new Error("Products not found with the given name"));
        }

        return right(products);
    }

    async findById(productId: string): Promise<Either<Error, Product>> {
        console.log("async findById repo memo productId", productId);
        const product = this.items.find(
            (product) => product.id.toString() === productId
        );

        if (!product) {
            return left(new Error("Product not found"));
        }
        return right(product);
    }

    async findBySlug(slug: string): Promise<
        Either<
            Error,
            {
                product: Product;
                brandName?: string;
                colors: { id: string; name: string; hex: string }[];
                sizes: { id: string; name: string }[];
                categories: { id: string; name: string }[];
                variants: {
                    id: string;
                    sizeId?: string;
                    colorId?: string;
                    stock: number;
                    price: number;
                    images: string[];
                    sku: string;
                }[];
            }
        >
    > {
        const product = this.items.find((item) => item.slug.value === slug);

        if (!product) {
            return left(new ResourceNotFoundError("Product not found"));
        }

        const brandName = this.getBrandNameByProductId(
            product.brandId.toString()
        );

        const colors = (product.productColors ?? []).map((color) => ({
            id: color.id.toString(),
            name: color.name,
            hex: color.hex,
        }));
        const sizes = (product.productSizes ?? []).map((size) => ({
            id: size.id.toString(),
            name: size.name,
        }));
        const categories = (product.productCategories ?? []).map(
            (category) => ({
                id: category.id.toString(),
                name: category.name,
            })
        );
        const productIdVariant = product.productIdVariant;
        if (productIdVariant) {
            const variantsResult =
                await this.variantRepository.findByProductId(productIdVariant);

            if (variantsResult.isRight()) {
                const variants = variantsResult.value;

                return right({
                    product,
                    brandName,
                    colors,
                    sizes,
                    categories,
                    variants: variants.map((variant) => ({
                        id: variant.id.toString(),
                        sizeId: variant.sizeId?.toString(),
                        colorId: variant.colorId?.toString(),
                        stock: variant.stock,
                        price: variant.price,
                        images: variant.images,
                        sku: variant.sku,
                    })),
                });
            } else {
                // Handle the case where fetching variants results in an error
                return left(
                    new Error(
                        "Variants not found for the given product variant ID"
                    )
                );
            }
        } else {
            return left(new Error("Product variant ID is undefined"));
        }
    }

    async save(product: Product): Promise<Either<ResourceNotFoundError, void>> {
        try {
            console.log("async save(product: Product): bateu");
            console.log("save(product: Product product save1", product);

            const index = this.items.findIndex(
                (item) => item.id.toString() === product.id.toString()
            );
            console.log("save(product: Product product index", index);
            console.log("save(product: Product product product2", product);

            if (index === -1) {
                return left(new ResourceNotFoundError("Product not found"));
            }
            if (!product || !product.slug) {
                throw new Error("Product or its slug is undefined");
            }

            if (!product.slug.value) {
                throw new Error("Product slug value is undefined");
            }

            const baseSlug = product.slug.value;
            const uniqueSlug = await this.generateUniqueSlug(
                baseSlug,
                product.id.toString()
            );
            console.log("baseSlug insave", baseSlug);
            console.log("uniqueSlug insave", uniqueSlug);

            product.slug.value = uniqueSlug;
            console.log("product.slug.value insave", product.slug.value);
            console.log("product la embaixo insave", product);
            console.log("product.slug insave", product.slug);
            console.log(
                "product.productCategories insave",
                product.productCategories
            );

            const updatedProduct = Product.create(
                {
                    name: product.name,
                    description: product.description,
                    brandId: product.brandId,
                    price: product.price,
                    productCategories: product.productCategories || [],
                    finalPrice: product.finalPrice ?? 0,
                    stock: product.stock,
                    sku: product.sku || "",
                    erpId: product.erpId,
                    height: product.height,
                    width: product.width,
                    length: product.length,
                    weight: product.weight,
                    onSale: product.onSale,
                    discount: product.discount,
                    isFeatured: product.isFeatured,
                    showInSite: product.showInSite,
                    isNew: product.isNew,
                    hasVariants: product.hasVariants,
                    images: product.images || [],
                    slug: product.slug,
                    createdAt: this.items[index].createdAt,
                    updatedAt: new Date(),
                },
                product.id
            );

            console.log(
                "InMemoryProductRepository save updatedProduct",
                updatedProduct
            );
            this.items[index] = updatedProduct;
            console.log(
                "InMemoryProductRepository save updatedProduct2",
                updatedProduct
            );

            return right(undefined);
        } catch (error) {
            console.error("Error in save method:", error);
            return left(new Error("Failed to save product"));
        }
    }

    async delete(product: Product): Promise<void> {
        this.items = this.items.filter(
            (item) => item.id.toString() !== product.id.toString()
        );
    }

    private getBrandNameByProductId(productId: string): string | undefined {
        // Implementação fictícia, substitua pela lógica real
        return "Example Brand";
    }
}
