import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { IAddressRepository } from "../repositories/i-address-repository";
import { Address } from "../../enterprise/entities/address";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface CreateAddressUseCaseRequest {
    userId: string;
    street: string;
    number: number;
    complement?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

type CreateAddressUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        address: Address;
    }
>;

@Injectable()
export class CreateAddressUseCase {
    constructor(private addressRepository: IAddressRepository) {}

    async execute({
        userId,
        street,
        number,
        complement,
        city,
        state,
        country,
        zipCode,
    }: CreateAddressUseCaseRequest): Promise<CreateAddressUseCaseResponse> {
        if (
            !userId ||
            !street ||
            !number ||
            !city ||
            !state ||
            !country ||
            !zipCode
        ) {
            return left(
                new ResourceNotFoundError(
                    "All required fields must be provided"
                )
            );
        }
        try {
            const address = Address.create({
                userId,
                street,
                number,
                complement,
                city,
                state,
                country,
                zipCode,
            });

            await this.addressRepository.create(address);

            return right({
                address,
            });
        } catch (error) {
            return left(error as Error);
        }
    }
}
