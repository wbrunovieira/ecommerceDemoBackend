import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { IAddressRepository } from "../repositories/i-address-repository";
import { Address } from "../../enterprise/entities/address";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface EditAddressUseCaseRequest {
    id: string;
    userId: string;
    street: string;
    number: number;
    complement?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

type EditAddressUseCaseResponse = Either<
    ResourceNotFoundError | Error,
    {
        address: Address;
    }
>;

@Injectable()
export class EditAddressUseCase {
    constructor(private addressRepository: IAddressRepository) {}

    async execute({
        id,
        userId,
        street,
        number,
        complement,
        city,
        state,
        country,
        zipCode,
    }: EditAddressUseCaseRequest): Promise<EditAddressUseCaseResponse> {
        try {
            const addressOrError = await this.addressRepository.findById(id);

            if (addressOrError.isLeft()) {
                return left(new ResourceNotFoundError("Address not found"));
            }

            const address = addressOrError.value;

            address.street = street;
            address.number = number;
            address.complement = complement;
            address.city = city;
            address.state = state;
            address.country = country;
            address.zipCode = zipCode;

            const saveOrError = await this.addressRepository.save(address);

            if (saveOrError.isLeft()) {
                return left(saveOrError.value);
            }

            return right({
                address,
            });
        } catch (error) {
            return left(error as Error);
        }
    }
}
