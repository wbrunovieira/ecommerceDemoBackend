import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { Either, left, right } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { IProductRepository } from "../repositories/i-product-repository";
import { IProductColorRepository } from "../repositories/i-product-color-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { ProductColor } from "../../enterprise/entities/product-color";
import { IColorRepository } from "../repositories/i-color-repository";

interface ProductColorUseCaseRequest {
    colorId: string;
    productId: string;
}

type ProductColorUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        productColor: ProductColor;
    }
>;

@Injectable()
export class CreateProductColorUseCase {
    constructor(
        private productRepository: IProductRepository,
        private colorRepository: IColorRepository,
        private productColorRepository: IProductColorRepository
    ) {}

    async execute({
        colorId,
        productId,
    }: ProductColorUseCaseRequest): Promise<ProductColorUseCaseResponse> {
        const product = await this.productRepository.findById(productId);

        if (!product) {
            return left(new ResourceNotFoundError());
        }
        const color = await this.colorRepository.findById(colorId);

        if (!color) {
            return left(new ResourceNotFoundError());
        }

        const productColor = ProductColor.create({
            colorId: new UniqueEntityID(colorId),
            productId: new UniqueEntityID(productId),
        });

        await this.productColorRepository.create(colorId, productId);

        return right({
            productColor,
        });
    }
}
