import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { Color } from "../../enterprise/entities/color";
import { IColorRepository } from "../repositories/i-color-repository";

interface FindColorByNameUseCaseRequest {
    name: string;
}

type FindColorByNameUseCaseResponse = Either<
    ResourceNotFoundError,
    { color: Color }
>;

@Injectable()
export class FindColorByNameUseCase {
    constructor(private colorsRepository: IColorRepository) {}

    async execute({
        name,
    }: FindColorByNameUseCaseRequest): Promise<FindColorByNameUseCaseResponse> {
        const colorResult = await this.colorsRepository.findByName(name);

        if (colorResult.isLeft()) {
            return left(new ResourceNotFoundError("Color not found"));
        }

        return right({
            color: colorResult.value,
        });
    }
}
