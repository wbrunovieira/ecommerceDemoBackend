import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";

import { Color } from "../../enterprise/entities/color";
import { IColorRepository } from "../repositories/i-color-repository";

interface FindColorByIdUseCaseRequest {
    id: string;
}

type FindColorByIdUseCaseResponse = Either<
    ResourceNotFoundError,
    { color: Color }
>;

@Injectable()
export class FindColorByIdUseCase {
    constructor(private colorRepository: IColorRepository) {}

    async execute({
        id,
    }: FindColorByIdUseCaseRequest): Promise<FindColorByIdUseCaseResponse> {
        const colorResult = await this.colorRepository.findById(id);

        if (colorResult.isLeft()) {
            return left(new ResourceNotFoundError("Color not found"));
        }

        return right({
            color: colorResult.value,
        });
    }
}
