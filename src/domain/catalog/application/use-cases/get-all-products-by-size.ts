import { Product } from "../../enterprise/entities/product";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";

interface GetProductsBySizeIdUseCaseRequest {
    sizeId: string;
}

type GetProductsBySizeIdUseCaseResponse = Either<
    ResourceNotFoundError,
    Product[]
>;

@Injectable()
export class GetProductsBySizeIdUseCase {
    constructor(private productRepository: IProductRepository) {}

    async execute({
        sizeId,
    }: GetProductsBySizeIdUseCaseRequest): Promise<GetProductsBySizeIdUseCaseResponse> {
        const result = await this.productRepository.findBySizeId(sizeId);

        if (result.isLeft()) {
            return left(new ResourceNotFoundError("Products not found"));
        }

        const products = result.value.filter((product) => product.showInSite);

        if (products.length === 0) {
            return left(
                new ResourceNotFoundError(
                    "No available products for this brand"
                )
            );
        }

        return right(products);
    }
}
