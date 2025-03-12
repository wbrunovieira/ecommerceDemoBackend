import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { IProductVariantRepository } from "../repositories/i-product-variant-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import {
    toDomainProductStatus,
    toPrismaProductStatus,
} from "@/infra/database/prisma/utils/convert-product-status";
import { ProductStatus as DomainProductStatus } from "../../enterprise/entities/product-status";

interface UpdateProductVariantUseCaseRequest {
    variantUpdate: {
        id: string;
        sku?: string;
        stock?: number;
        price?: number;
        images?: string[];
        status?: DomainProductStatus;
    };
}

type UpdateProductVariantUseCaseResponse = Either<ResourceNotFoundError, void>;

@Injectable()
export class UpdateProductVariantUseCase {
    constructor(private productVariantRepository: IProductVariantRepository) {}

    async execute({
        variantUpdate,
    }: UpdateProductVariantUseCaseRequest): Promise<UpdateProductVariantUseCaseResponse> {
        const variantOrError = await this.productVariantRepository.findById(
            variantUpdate.id
        );

        if (variantOrError.isLeft()) {
            return left(
                new ResourceNotFoundError(
                    `Variant not found for id: ${variantUpdate.id}`
                )
            );
        }

        const variant = variantOrError.value;

        if (variantUpdate.sku !== undefined) variant.sku = variantUpdate.sku;
        if (variantUpdate.stock !== undefined)
            variant.stock = variantUpdate.stock;
        if (variantUpdate.price !== undefined)
            variant.price = variantUpdate.price;
        if (variantUpdate.images !== undefined)
            variant.images = variantUpdate.images;
        if (variantUpdate.status !== undefined) {
            const prismaStatus = toPrismaProductStatus(variantUpdate.status);
            variant.status = toDomainProductStatus(prismaStatus);
        }

        const updateResult =
            await this.productVariantRepository.update(variant);

        if (updateResult.isLeft()) {
            return left(
                new ResourceNotFoundError(
                    `Failed do Usecase to update variant with  id: ${variantUpdate.id}`
                )
            );
        }

        return right(undefined);
    }
}
