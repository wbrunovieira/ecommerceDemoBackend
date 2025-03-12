import { Color } from "../../enterprise/entities/color";
import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { IColorRepository } from "../repositories/i-color-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface CreateColorUseCaseRequest {
    name: string;
    hex: string;
    erpId: string;
}

type CreateColorUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        color: Color;
    }
>;

@Injectable()
export class CreateColorUseCase {
    constructor(private colorRepository: IColorRepository) {}

    async execute({
        name,
        hex,
        erpId,
    }: CreateColorUseCaseRequest): Promise<CreateColorUseCaseResponse> {
        try {
            const trimmedName = name.trim();
            if (!trimmedName || trimmedName.length === 0) {
                return left(
                    new ResourceNotFoundError("Color name is required")
                );
            }

            if (trimmedName.length < 3) {
                return left(
                    new ResourceNotFoundError(
                        "Color name must be at least 3 characters long"
                    )
                );
            }

            if (trimmedName.length > 20) {
                return left(
                    new ResourceNotFoundError(
                        "Color name must be less than 20 characters long"
                    )
                );
            }

            const existingColor =
                await this.colorRepository.findByName(trimmedName);
            if (existingColor.isRight()) {
                return left(
                    new ResourceNotFoundError(
                        "Color with this name already exists"
                    )
                );
            }
            const color = Color.create({
                name: trimmedName,
                hex,
                erpId,
            });

            await this.colorRepository.create(color);

            return right({
                color,
            });
        } catch (error) {
            return left(error as Error);
        }
    }
}
