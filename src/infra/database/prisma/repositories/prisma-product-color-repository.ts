import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { IProductColorRepository } from "@/domain/catalog/application/repositories/i-product-color-repository";
import { Either, left, right } from "@/core/either";
import { ProductColor } from "@/domain/catalog/enterprise/entities/product-color";
import { PrismaColorRepository } from "./prisma-color-repository";

@Injectable()
export class PrismaProductColorRepository implements IProductColorRepository {
    constructor(
        private prisma: PrismaService,
        private colorRepository: PrismaColorRepository
    ) {}
    findByProductId(productId: string): Promise<ProductColor[]> {
        throw new Error("Method not implemented.");
    }
    findByColorId(ColorId: string): Promise<ProductColor[]> {
        throw new Error("Method not implemented.");
    }
    addItem(ProductColor: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(productColor: ProductColor): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async create(
        productId: string,
        colorId: string
    ): Promise<Either<Error, void>> {
        try {
            const colorExists = await this.colorRepository.findById(colorId);
            if (colorExists.isLeft()) {
                return left(new Error("Color not found"));
            }

            const productExists = await this.prisma.product.findUnique({
                where: { id: productId },
            });
            if (!productExists) {
                return left(new Error("Product not found"));
            }

            await this.prisma.productColor.create({
                data: { productId, colorId },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create product color"));
        }
    }
}
