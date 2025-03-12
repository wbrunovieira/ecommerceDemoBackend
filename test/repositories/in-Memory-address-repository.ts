// test/repositories/in-memory-address-repository.ts
import { IAddressRepository } from "@/domain/auth/application/repositories/i-address-repository";
import { Address } from "@/domain/auth/enterprise/entities/address";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { PaginationParams } from "@/core/repositories/pagination-params";

export class InMemoryAddressRepository implements IAddressRepository {
    findAll(params: PaginationParams): Promise<Either<Error, Address[]>> {
        throw new Error("Method not implemented.");
    }

    public items: Address[] = [];

    async create(address: Address): Promise<Either<Error, void>> {
        this.items.push(address);
        return right(undefined);
    }

    async findById(id: string): Promise<Either<Error, Address>> {
        const address = this.items.find((item) => item.id.toString() === id);
        if (!address) {
            return left(new ResourceNotFoundError("Address not found"));
        }
        return right(address);
    }

    async delete(address: Address): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (item) => item.id.toString() === address.id.toString()
        );
        if (index === -1) {
            return left(new ResourceNotFoundError("Address not found"));
        }
        this.items.splice(index, 1);
        return right(undefined);
    }

    async save(address: Address): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (item) => item.id.toString() === address.id.toString()
        );
        if (index === -1) {
            return left(new ResourceNotFoundError("Address not found"));
        }
        this.items[index] = address;
        return right(undefined);
    }

    async findByUserId(userId: string): Promise<Either<Error, Address[]>> {
        const addresses = this.items.filter((item) => item.userId === userId);
        return right(addresses);
    }
}
