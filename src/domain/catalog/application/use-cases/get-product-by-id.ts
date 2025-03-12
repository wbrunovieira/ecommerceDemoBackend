import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";

import { Product } from "../../enterprise/entities/product";

interface GetProductByIdUseCaseRequest {
    productId: string;
    isAdminContext?: boolean;
}

type GetAllProductsByIdUseCaseResponse = Either<ResourceNotFoundError, Product>;

@Injectable()
export class GetProductByIdUseCase {
    constructor(private productRepository: IProductRepository) {}

    async execute({
        productId,
        isAdminContext = false,
    }: GetProductByIdUseCaseRequest): Promise<GetAllProductsByIdUseCaseResponse> {
        const result = await this.productRepository.findById(productId);
        console.log("use case result", result);
        console.log("use case isAdminContext inicio", isAdminContext);

        if (result.isLeft()) {
            return left(new ResourceNotFoundError("Product not found"));
        }

        const product = result.value;

        if (!isAdminContext && !product.showInSite) {
            return left(
                new ResourceNotFoundError("Product not available for display")
            );
        }

        return right(product);
    }
}
