import { Injectable } from "@nestjs/common";
import { Product } from "../../enterprise/entities/product";
import { IProductRepository } from "../repositories/i-product-repository";

@Injectable()
export class GetFeaturedProductsUseCase {
    constructor(private productRepository: IProductRepository) {}

    async execute(): Promise<Product[]> {
        const products = await this.productRepository.getFeaturedProducts();

        const formattedProducts = products.map((product) => {
            return {
                id: product.id,
                name: product.name,
                slug: this.getSlug(product.slug),
                price: product.price,
                finalPrice: product.finalPrice,
                onSale: product.onSale,
                isNew: product.isNew,
                discount: product.discount,
                images: product.images,
                height: product.height,
                width: product.width,
                length: product.length,
                weight: product.weight,
                isFeatured: product.isFeatured,
                brand: {
                    name: product.brand?.name || "Unknown",
                    imageUrl: product.brand?.imageUrl || "",
                },
                productCategories:
                    product.productCategories?.map((category) => ({
                        name: category.name,
                    })) || [],
                hasVariants: product.hasVariants,

                colors: product.productColors?.map((color) => ({
                    name: color.name,
                    hex: color.hex,
                })),
                sizes: product.productSizes?.map((size) => ({
                    name: size.name,
                })),
            } as unknown as Product;
        });

        return formattedProducts;
    }

    private getSlug(slug: any): string {
        if (typeof slug === "object" && slug !== null && "value" in slug) {
            return slug.value || "";
        }
        return slug;
    }
}
