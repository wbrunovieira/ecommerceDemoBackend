import { Product } from "../../enterprise/entities/product";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";

interface GetProductsByCategoryIdUseCaseRequest {
    categoryId: string;
}

type GetProductsByCategoryIdUseCaseResponse = Either<
    ResourceNotFoundError,
    Product[]
>;

@Injectable()
export class GetProductsByCategoryIdUseCase {
    constructor(private productRepository: IProductRepository) {}

    async execute({
        categoryId,
    }: GetProductsByCategoryIdUseCaseRequest): Promise<GetProductsByCategoryIdUseCaseResponse> {
        const result =
            await this.productRepository.findByCategoryId(categoryId);

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
