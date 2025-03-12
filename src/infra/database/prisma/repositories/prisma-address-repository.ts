import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { Either, left, right } from "@/core/either";
import { IAddressRepository } from "@/domain/auth/application/repositories/i-address-repository";
import { Address } from "@/domain/auth/enterprise/entities/address";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { PaginationParams } from "@/core/repositories/pagination-params";

@Injectable()
export class PrismaAddressRepository implements IAddressRepository {
    constructor(private prisma: PrismaService) {}

    async findByUserId(
        userId: string,
        params: PaginationParams
    ): Promise<Either<Error, Address[]>> {
        try {
            const addressesData = await this.prisma.address.findMany({
                where: { userId },
                skip: (params.page - 1) * params.pageSize,
                take: params.pageSize,
            });

            const addresses = addressesData.map((addressData) =>
                Address.create(
                    {
                        userId: addressData.userId,
                        street: addressData.street,
                        number: addressData.number,
                        complement: addressData.complement ?? undefined,
                        city: addressData.city,
                        state: addressData.state,
                        country: addressData.country,
                        zipCode: addressData.zipCode,
                    },
                    new UniqueEntityID(addressData.id)
                )
            );

            return right(addresses);
        } catch (error) {
            return left(new Error("Failed to find addresses by userId"));
        }
    }

    async findById(id: string): Promise<Either<Error, Address>> {
        try {
            const addressData = await this.prisma.address.findUnique({
                where: { id },
            });

            if (!addressData) {
                return left(new ResourceNotFoundError("Address not found"));
            }

            const address = Address.create(
                {
                    userId: addressData.userId,
                    street: addressData.street,
                    number: addressData.number,
                    complement: addressData.complement ?? undefined,
                    city: addressData.city,
                    state: addressData.state,
                    country: addressData.country,
                    zipCode: addressData.zipCode,
                },
                new UniqueEntityID(addressData.id)
            );

            return right(address);
        } catch (error) {
            return left(new Error("Database error"));
        }
    }

    async create(address: Address): Promise<Either<Error, void>> {
        try {
            await this.prisma.address.create({
                data: {
                    id: address.id.toString(),
                    userId: address.userId,
                    street: address.street,
                    number: address.number,
                    complement: address.complement,
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    zipCode: address.zipCode,
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create address"));
        }
    }

    async delete(address: Address): Promise<Either<Error, void>> {
        try {
            await this.prisma.address.delete({
                where: { id: address.id.toString() },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to delete address"));
        }
    }

    async findAll(params: PaginationParams): Promise<Either<Error, Address[]>> {
        try {
            const addressesData = await this.prisma.address.findMany({
                skip: (params.page - 1) * params.pageSize,
                take: params.pageSize,
            });

            const addresses = addressesData.map((addressData) =>
                Address.create(
                    {
                        userId: addressData.userId,
                        street: addressData.street,
                        number: addressData.number,
                        complement: addressData.complement ?? undefined,
                        city: addressData.city,
                        state: addressData.state,
                        country: addressData.country,
                        zipCode: addressData.zipCode,
                    },
                    new UniqueEntityID(addressData.id)
                )
            );

            return right(addresses);
        } catch (error) {
            return left(new Error("Failed to find addresses"));
        }
    }

    async save(address: Address): Promise<Either<Error, void>> {
        try {
            await this.prisma.address.update({
                where: { id: address.id.toString() },
                data: {
                    userId: address.userId,
                    street: address.street,
                    number: address.number,
                    complement: address.complement,
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    zipCode: address.zipCode,
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to save address"));
        }
    }
}
