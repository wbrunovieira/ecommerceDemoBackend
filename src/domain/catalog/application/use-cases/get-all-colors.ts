import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";

import { PaginationParams } from "@/core/repositories/pagination-params";
import { Color } from "../../enterprise/entities/color";
import { IColorRepository } from "../repositories/i-color-repository";

type GetAllColorsUseCaseResponse = Either<Error, Color[]>;

@Injectable()
export class GetAllColorsUseCase {
    constructor(private colorsRepository: IColorRepository) {}

    async execute(
        params: PaginationParams
    ): Promise<GetAllColorsUseCaseResponse> {
        try {
            const colorsResult = await this.colorsRepository.findAll(params);
            if (colorsResult.isLeft()) {
                return left(new Error("Failed to find all colors"));
            }
            return right(colorsResult.value);
        } catch (error) {
            return left(new Error("Repository error"));
        }
    }
}
