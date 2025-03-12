import { Product } from "../../enterprise/entities/product";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";

interface GetProductsByPriceRangeUseCaseRequest {
    minPrice: number;
    maxPrice: number;
}

type GetProductsByPriceRangeUseCaseResponse = Either<
    ResourceNotFoundError,
    Product[]
>;

@Injectable()
export class GetProductsByPriceRangeUseCase {
    constructor(private productRepository: IProductRepository) {}

    async execute({
        minPrice,
        maxPrice,
    }: GetProductsByPriceRangeUseCaseRequest): Promise<GetProductsByPriceRangeUseCaseResponse> {
        const result = await this.productRepository.findByPriceRange(
            minPrice,
            maxPrice
        );

        if (result.isLeft()) {
            return left(
                new ResourceNotFoundError(
                    "Products not found within the specified price range"
                )
            );
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
