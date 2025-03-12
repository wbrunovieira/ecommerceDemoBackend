import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { Either, left, right } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { IProductRepository } from "../repositories/i-product-repository";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { ProductSize } from "../../enterprise/entities/product-size";
import { IProductSizeRepository } from "../repositories/i-product-size-repository";
import { ISizeRepository } from "../repositories/i-size-repository";

interface ProductSizeUseCaseRequest {
    sizeId: string;
    productId: string;
}

type ProductSizeUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        productSize: ProductSize;
    }
>;

@Injectable()
export class CreateProductSizeUseCase {
    constructor(
        private productRepository: IProductRepository,
        private sizeRepository: ISizeRepository,
        private productSizeRepository: IProductSizeRepository
    ) {}

    async execute({
        sizeId,
        productId,
    }: ProductSizeUseCaseRequest): Promise<ProductSizeUseCaseResponse> {
        try {
            const product = await this.productRepository.findById(productId);

            if (!product) {
                return left(new ResourceNotFoundError());
            }

            const size = await this.sizeRepository.findById(sizeId);

            if (!size) {
                return left(new ResourceNotFoundError());
            }

            const productSize = ProductSize.create({
                sizeId: new UniqueEntityID(sizeId),
                productId: new UniqueEntityID(productId),
            });

            await this.productSizeRepository.create(sizeId, productId);

            return right({
                productSize,
            });
        } catch (error) {
            console.error("Error creating product size:", error);
            return left(error as Error);
        }
    }
}
