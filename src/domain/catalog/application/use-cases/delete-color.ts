import { Either, left, right } from "@/core/either";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { PrismaColorRepository } from "../../../../infra/database/prisma/repositories/prisma-color-repository";
import { IColorRepository } from "../repositories/i-color-repository";

interface DeleteColorUseCaseRequest {
    colorId: string;
}

type DeleteColorUseCaseResponse = Either<ResourceNotFoundError, {}>;

@Injectable()
export class DeleteColorUseCase {
    constructor(private colorsRepository: IColorRepository) {}

    async execute({
        colorId,
    }: DeleteColorUseCaseRequest): Promise<DeleteColorUseCaseResponse> {
        const colorResult = await this.colorsRepository.findById(colorId);

        if (colorResult.isLeft()) {
            return left(new ResourceNotFoundError("Color not found"));
        }

        const color = colorResult.value;

        await this.colorsRepository.delete(color);

        return right({});
    }
}
