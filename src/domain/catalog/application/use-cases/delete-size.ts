import { Either, left, right } from "@/core/either";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";

import { ISizeRepository } from "../repositories/i-size-repository";

interface DeleteSizeUseCaseRequest {
    sizeId: string;
}

type DeleteSizeUseCaseResponse = Either<ResourceNotFoundError, {}>;

@Injectable()
export class DeleteSizeUseCase {
    constructor(private sizesRepository: ISizeRepository) {}

    async execute({
        sizeId,
    }: DeleteSizeUseCaseRequest): Promise<DeleteSizeUseCaseResponse> {
        const sizeResult = await this.sizesRepository.findById(sizeId);

        if (sizeResult.isLeft()) {
            return left(new ResourceNotFoundError("Size not found"));
        }

        const size = sizeResult.value;

        await this.sizesRepository.delete(size);

        return right({});
    }
}
