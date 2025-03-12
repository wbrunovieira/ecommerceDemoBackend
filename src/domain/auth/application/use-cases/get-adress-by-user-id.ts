import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { IAddressRepository } from "../repositories/i-address-repository";
import { Address } from "../../enterprise/entities/address";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface FindAddressesByUserIdUseCaseRequest {
    userId: string;
    pagination: PaginationParams;
}

type FindAddressesByUserIdUseCaseResponse = Either<
    ResourceNotFoundError | Error,
    {
        addresses: Address[];
    }
>;

@Injectable()
export class FindAddressesByUserIdUseCase {
    constructor(private addressRepository: IAddressRepository) {}

    async execute({
        userId,
        pagination,
    }: FindAddressesByUserIdUseCaseRequest): Promise<FindAddressesByUserIdUseCaseResponse> {
        if (!userId) {
            return left(new ResourceNotFoundError("UserId must be provided"));
        }

        try {
            const result = await this.addressRepository.findByUserId(
                userId,
                pagination
            );

            if (result.isLeft()) {
                return left(result.value);
            }

            const addresses = result.value;
            return right({ addresses });
        } catch (error) {
            return left(new Error("Failed to find addresses by userId"));
        }
    }
}
