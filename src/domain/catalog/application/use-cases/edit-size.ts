import { Size } from "../../enterprise/entities/size";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";

import { ISizeRepository } from "../repositories/i-size-repository";

interface EditSizeUseCaseRequest {
    sizeId: string;
    name: string;
}

type EditSizeUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        size: Size;
    }
>;
@Injectable()
export class EditSizeUseCase {
    constructor(private sizesRepository: ISizeRepository) {}

    async execute({
        sizeId,
        name,
    }: EditSizeUseCaseRequest): Promise<EditSizeUseCaseResponse> {
        const sizeResult = await this.sizesRepository.findById(sizeId);

        if (sizeResult.isLeft()) {
            return left(new ResourceNotFoundError("Size not found"));
        }

        const size = sizeResult.value;
        size.name = name;
        const saveResult = await this.sizesRepository.save(size);

        if (saveResult.isLeft()) {
            return left(new ResourceNotFoundError("Failed to update size"));
        }

        return right({
            size,
        });
    }
}
