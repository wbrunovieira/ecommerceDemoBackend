import { Color } from "../../enterprise/entities/color";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { Injectable } from "@nestjs/common";
import { IColorRepository } from "../repositories/i-color-repository";

interface EditColorUseCaseRequest {
    colorId: string;
    name: string;
    hex: string;
}

type EditColorUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        color: Color;
    }
>;
@Injectable()
export class EditColorUseCase {
    constructor(private colorsRepository: IColorRepository) {}

    async execute({
        colorId,
        name,
        hex,
    }: EditColorUseCaseRequest): Promise<EditColorUseCaseResponse> {
        const colorResult = await this.colorsRepository.findById(colorId);

        if (colorResult.isLeft()) {
            return left(new ResourceNotFoundError("Color not found"));
        }

        const color = colorResult.value;
        color.name = name;
        color.hex = hex;
        const saveResult = await this.colorsRepository.save(color);

        if (saveResult.isLeft()) {
            return left(new ResourceNotFoundError("Failed to update brand"));
        }

        return right({
            color,
        });
    }
}
