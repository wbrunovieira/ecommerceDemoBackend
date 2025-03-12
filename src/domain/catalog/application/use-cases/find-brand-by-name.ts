import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { IBrandRepository } from "../repositories/i-brand-repository";
import { Brand } from "../../enterprise/entities/brand";

interface FindBrandByNameUseCaseRequest {
    name: string;
}

type FindBrandByNameUseCaseResponse = Either<
    ResourceNotFoundError,
    { brand: Brand }
>;

@Injectable()
export class FindBrandByNameUseCase {
    constructor(private brandsRepository: IBrandRepository) {}

    async execute({
        name,
    }: FindBrandByNameUseCaseRequest): Promise<FindBrandByNameUseCaseResponse> {
        const brandResult = await this.brandsRepository.findByName(name);
        console.log("FindBrandByNameUseCaseRequest name", name);

        if (brandResult.isLeft()) {
            return left(new ResourceNotFoundError("Brand not found"));
        }

        return right({
            brand: brandResult.value,
        });
    }
}
