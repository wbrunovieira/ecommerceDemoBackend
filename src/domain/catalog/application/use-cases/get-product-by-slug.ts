import { Product } from "../../enterprise/entities/product";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";

interface GetProductBySlugUseCaseRequest {
    slug: string;
}

type GetProductBySlugUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        product: Product;

        brandName?: string;
        colors: { id: string; name: string; hex: string }[];
        sizes: { id: string; name: string }[];
        categories: { imageUrl: any; id: string; name: string }[];
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
>;

@Injectable()
export class GetProductBySlugUseCase {
    constructor(private productRepository: IProductRepository) {}
    pro;
    async execute({
        slug,
    }: GetProductBySlugUseCaseRequest): Promise<GetProductBySlugUseCaseResponse> {
        const result = await this.productRepository.findBySlug(slug);

        if (result.isLeft()) {
            return left(new ResourceNotFoundError("Product not found"));
        }

        const {
            product,
            brandName = "Unknown Brand",
            colors = [],
            sizes = [],
            categories = [],
            variants = [],
        } = result.value;

        if (!product.showInSite) {
            return left(
                new ResourceNotFoundError("Product not available for sale")
            );
        }

        const formattedCategories =
            categories && categories.length > 0
                ? categories.map((category) => ({
                      id: category.id,
                      name: category.name,
                      imageUrl: category.imageUrl || "default-image-url.png",
                  }))
                : [];

        return right({
            product,

            brandName,
            colors,
            sizes,
            categories: formattedCategories,
            variants,
        });
    }
}
