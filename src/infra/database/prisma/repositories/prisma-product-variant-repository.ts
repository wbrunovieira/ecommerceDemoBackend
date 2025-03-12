import { Either, left, right } from "@/core/either";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";
import { ProductVariant } from "@/domain/catalog/enterprise/entities/product-variant";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { ProductStatus } from "@/domain/catalog/enterprise/entities/product-status";
import {
    toDomainProductStatus,
    toPrismaProductStatus,
} from "../utils/convert-product-status";

@Injectable()
export class PrismaProductVariantRepository
    implements IProductVariantRepository
{
    constructor(private prisma: PrismaService) {}

    async create(productVariant: ProductVariant): Promise<Either<Error, void>> {
        try {
            await this.prisma.productVariant.create({
                data: {
                    id: productVariant.id.toString(),
                    productId: productVariant.productId.toString(),
                    sizeId: productVariant.sizeId?.toString(),
                    colorId: productVariant.colorId?.toString(),
                    sku: productVariant.sku,
                    stock: productVariant.stock,
                    price: productVariant.price,
                    status: toPrismaProductStatus(productVariant.status),
                    images: productVariant.images,
                    createdAt: productVariant.createdAt,
                    updatedAt: productVariant.updatedAt,
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create product variant"));
        }
    }

    async findByProductId(
        productId: string
    ): Promise<Either<ResourceNotFoundError, ProductVariant[]>> {
        console.log("entrou prisma repo findByProductId productId", productId);

        const variants = await this.prisma.productVariant.findMany({
            where: { productId },
        });
        console.log("prisma repo findByProductId variants", variants);

        if (variants.length === 0) {
            return left(
                new ResourceNotFoundError(
                    `Variants not found for product id: ${productId}`
                )
            );
        }

        const productVariants = variants.map((variant) =>
            ProductVariant.create({
                productId: new UniqueEntityID(variant.productId),
                colorId: variant.colorId
                    ? new UniqueEntityID(variant.colorId)
                    : undefined,
                sizeId: variant.sizeId
                    ? new UniqueEntityID(variant.sizeId)
                    : undefined,
                sku: variant.sku,
                upc: variant.upc ? "" : undefined,
                stock: variant.stock,
                price: variant.price,
                images: variant.images,
                status: variant.status as ProductStatus,
                createdAt: new Date(variant.createdAt),
                updatedAt: variant.updatedAt
                    ? new Date(variant.updatedAt)
                    : undefined,
            })
        );

        console.log(
            "prisma repo findByProductId productVariants",
            productVariants
        );
        return right(productVariants);
    }

    async findById(
        id: string
    ): Promise<Either<ResourceNotFoundError, ProductVariant>> {
        console.log("entrou prisma repo findByProductId id", id);

        const variant = await this.prisma.productVariant.findFirst({
            where: { id },
        });
        console.log("entrou prisma repo findByProductId variant", variant);

        if (!variant) {
            return left(
                new ResourceNotFoundError(
                    `Variant not  in prisma findnyId found for id: ${id}`
                )
            );
        }

        const productVariant = ProductVariant.create(
            {
                productId: new UniqueEntityID(variant.productId),
                colorId: variant.colorId
                    ? new UniqueEntityID(variant.colorId)
                    : undefined,
                sizeId: variant.sizeId
                    ? new UniqueEntityID(variant.sizeId)
                    : undefined,
                sku: variant.sku,
                upc: variant.upc ?? undefined,
                stock: variant.stock,
                price: variant.price,
                images: variant.images,
                status: variant.status as ProductStatus,
                createdAt: new Date(variant.createdAt),
                updatedAt: variant.updatedAt
                    ? new Date(variant.updatedAt)
                    : undefined,
            },
            new UniqueEntityID(variant.id)
        );
        console.log(
            "entrou prisma repo findByProductId productVariant",
            productVariant
        );

        return right(productVariant);
    }

    async findByProductIds(productIds: string[]): Promise<ProductVariant[]> {
        const variants = await this.prisma.productVariant.findMany({
            where: {
                productId: {
                    in: productIds,
                },
            },
        });
        return variants.map((variant) =>
            ProductVariant.create(
                {
                    productId: new UniqueEntityID(variant.productId),
                    sizeId: variant.sizeId
                        ? new UniqueEntityID(variant.sizeId)
                        : undefined,
                    colorId: variant.colorId
                        ? new UniqueEntityID(variant.colorId)
                        : undefined,
                    stock: variant.stock,
                    price: variant.price,
                    status: toDomainProductStatus(variant.status),
                    images: variant.images,
                    createdAt: variant.createdAt,
                },
                new UniqueEntityID(variant.id)
            )
        );
    }

    async update(
        variant: ProductVariant
    ): Promise<Either<ResourceNotFoundError, void>> {
        try {
            const variantIdString = variant.idString;

            const todasVAriants = await this.prisma.productVariant.findMany();

            const existingVariant = await this.prisma.productVariant.findUnique(
                {
                    where: { id: variantIdString },
                }
            );

            if (!existingVariant) {
                return left(
                    new ResourceNotFoundError(
                        `Variant not found for id: ${variant.id.toString()}`
                    )
                );
            }

            await this.prisma.productVariant.update({
                where: { id: variant.id.toString() },
                data: {
                    productId: variant.productId.toString(),
                    colorId: variant.colorId?.toString(),
                    sizeId: variant.sizeId?.toString(),
                    sku: variant.sku,
                    upc: variant.upc,
                    stock: variant.stock,
                    price: variant.price,
                    images: variant.images,
                    status: toPrismaProductStatus(variant.status),
                    updatedAt: new Date(),
                },
            });

            return right(undefined);
        } catch (error) {
            return left(
                new ResourceNotFoundError(
                    `Failed to update variant with id: ${variant.id.toString()}`
                )
            );
        }
    }
}
