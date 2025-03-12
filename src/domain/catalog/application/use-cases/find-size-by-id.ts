import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { Size } from "../../enterprise/entities/size";
import { ISizeRepository } from "../repositories/i-size-repository";

interface FindSizeByIdUseCaseRequest {
    id: string;
}

type FindSizeByIdUseCaseResponse = Either<
    ResourceNotFoundError,
    { size: Size }
>;

@Injectable()
export class FindSizeByIdUseCase {
    constructor(private sizeRepository: ISizeRepository) {}

    async execute({
        id,
    }: FindSizeByIdUseCaseRequest): Promise<FindSizeByIdUseCaseResponse> {
        const sizeResult = await this.sizeRepository.findById(id);

        if (sizeResult.isLeft()) {
            return left(new ResourceNotFoundError("Size not found"));
        }

        return right({
            size: sizeResult.value,
        });
    }
}
