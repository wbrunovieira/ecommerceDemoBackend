import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { IAddressRepository } from "../repositories/i-address-repository";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface DeleteAddressUseCaseRequest {
    id: string;
}

type DeleteAddressUseCaseResponse = Either<ResourceNotFoundError | Error, void>;

@Injectable()
export class DeleteAddressUseCase {
    constructor(private addressRepository: IAddressRepository) {}

    async execute({
        id,
    }: DeleteAddressUseCaseRequest): Promise<DeleteAddressUseCaseResponse> {
        try {
            const addressOrError = await this.addressRepository.findById(id);

            if (addressOrError.isLeft()) {
                return left(new ResourceNotFoundError("Address not found"));
            }

            const address = addressOrError.value;

            const deleteOrError = await this.addressRepository.delete(address);

            if (deleteOrError.isLeft()) {
                return left(deleteOrError.value);
            }

            return right(undefined);
        } catch (error) {
            return left(error as Error);
        }
    }
}
