import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { IBrandRepository } from "../repositories/i-brand-repository";
import { Brand } from "../../enterprise/entities/brand";

interface FindBrandByIdUseCaseRequest {
    id: string;
}

type FindBrandByIdUseCaseResponse = Either<
    ResourceNotFoundError,
    { brand: Brand }
>;

@Injectable()
export class FindBrandByIdUseCase {
    constructor(private brandsRepository: IBrandRepository) {}

    async execute({
        id,
    }: FindBrandByIdUseCaseRequest): Promise<FindBrandByIdUseCaseResponse> {
        const brandResult = await this.brandsRepository.findById(id);

        if (brandResult.isLeft()) {
            return left(new ResourceNotFoundError("Brand not found"));
        }

        return right({
            brand: brandResult.value,
        });
    }
}
