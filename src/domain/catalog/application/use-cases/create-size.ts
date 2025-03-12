import { Size } from "../../enterprise/entities/size";
import { Either, left, right } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { ISizeRepository } from "../repositories/i-size-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface CreateSizeUseCaseRequest {
    name: string;
    erpId: string;
}

type CreateSizeUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        size: Size;
    }
>;

@Injectable()
export class CreateSizeUseCase {
    constructor(private sizeRepository: ISizeRepository) {}

    async execute({
        name,
        erpId,
    }: CreateSizeUseCaseRequest): Promise<CreateSizeUseCaseResponse> {
        try {
            const trimmedName = name.trim();
            const trimmedErpId = erpId.trim();

            if (!trimmedName || trimmedName.length === 0) {
                return left(new ResourceNotFoundError("Size name is required"));
            }

            if (trimmedName.length < 0) {
                return left(
                    new ResourceNotFoundError(
                        "Size name must be at least 1 characters long"
                    )
                );
            }

            if (trimmedName.length > 10) {
                return left(
                    new ResourceNotFoundError(
                        "Size name must be less than 10 characters long"
                    )
                );
            }

            const existingSize =
                await this.sizeRepository.findByName(trimmedName);
            if (existingSize.isRight()) {
                return left(
                    new ResourceNotFoundError(
                        "Size with this name already exists"
                    )
                );
            }
            const size = Size.create({
                name: trimmedName,
                erpId: trimmedErpId,
            });

            await this.sizeRepository.create(size);

            return right({
                size,
            });
        } catch (error) {
            return left(error as Error);
        }
    }
}
