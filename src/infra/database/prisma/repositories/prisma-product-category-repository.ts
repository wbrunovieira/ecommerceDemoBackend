import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

import { IProductCategoryRepository } from "@/domain/catalog/application/repositories/i-product-category-repository";
import { Either, left, right } from "@/core/either";
import { ProductCategory } from "@/domain/catalog/enterprise/entities/product-category";
import { PrismaCategoryRepository } from "./prisma-category-repository";

@Injectable()
export class PrismaProductCategoryRepository
    implements IProductCategoryRepository
{
    constructor(
        private prisma: PrismaService,
        private categoryRepository: PrismaCategoryRepository
    ) {}
    async create(
        productId: string,
        categoryId: string
    ): Promise<Either<Error, void>> {
        try {
            const catergoryExists =
                await this.categoryRepository.findById(categoryId);
            if (catergoryExists.isLeft()) {
                return left(new Error("Category not found"));
            }
            console.log(
                "PrismaProductCategoryRepository create catergoryExists",
                catergoryExists
            );

            const productExists = await this.prisma.product.findUnique({
                where: { id: productId },
            });
            if (!productExists) {
                return left(new Error("Product not found"));
            }

            await this.prisma.productCategory.create({
                data: { productId, categoryId },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create product category"));
        }
    }
    findByProductId(productId: string): Promise<ProductCategory[]> {
        throw new Error("Method not implemented.");
    }
    findByCategoyId(ColorId: string): Promise<ProductCategory[]> {
        throw new Error("Method not implemented.");
    }
    addItem(productcategory: any): void {
        throw new Error("Method not implemented.");
    }
    delete(productcategory: ProductCategory): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
