import { Either, left, right } from "@/core/either";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { Customer } from "../../enterprise/entities/customer";
import { ICustomerRepository } from "./i-customer-repositor";

@Injectable()
export class PrismaCustomerRepository implements ICustomerRepository {
    constructor(private prisma: PrismaService) {}

    async findCustomerById(
        customerId: string
    ): Promise<Either<Error, Customer>> {
        try {
            const customer = await this.prisma.customer.findUnique({
                where: {
                    id: customerId,
                },
                include: {
                    orders: true,
                },
            });

            if (!customer) {
                return left(new Error("Customer not found"));
            }

            const customerEntity = Customer.create(
                {
                    userId: new UniqueEntityID(customer.userId),
                    firstOrderDate: customer.firstOrderDate ?? undefined,
                    customerSince: customer.customerSince,
                },
                new UniqueEntityID(customer.id)
            );

            return right(customerEntity);
        } catch (error) {
            return left(new Error("Failed to find customer"));
        }
    }

    async create(customer: Customer): Promise<Either<Error, void>> {
        try {
            const customerData = customer.toObject();

            await this.prisma.customer.create({
                data: {
                    id: customerData.id,
                    userId: customerData.userId,
                    firstOrderDate: customerData.firstOrderDate,
                    customerSince: customerData.customerSince,
                },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create customer"));
        }
    }

    async listAllCustomers(): Promise<Either<Error, Customer[]>> {
        try {
            const customers = await this.prisma.customer.findMany({
                include: {
                    orders: true,
                },
            });

            const customerEntities = customers.map((customer) =>
                Customer.create(
                    {
                        userId: new UniqueEntityID(customer.userId),
                        firstOrderDate: customer.firstOrderDate ?? undefined,
                        customerSince: customer.customerSince,
                    },
                    new UniqueEntityID(customer.id)
                )
            );

            return right(customerEntities);
        } catch (error) {
            return left(new Error("Failed to list customers"));
        }
    }

    async findByUserId(
        userId: string
    ): Promise<Either<Error, Customer | null>> {
        try {
            const customer = await this.prisma.customer.findUnique({
                where: {
                    userId: userId,
                },
                include: {
                    orders: true,
                },
            });

            if (!customer) {
                return right(null); // Retornar null se o cliente não for encontrado
            }

            const customerEntity = Customer.create(
                {
                    userId: new UniqueEntityID(customer.userId),
                    firstOrderDate: customer.firstOrderDate ?? undefined,
                    customerSince: customer.customerSince,
                },
                new UniqueEntityID(customer.id)
            );

            return right(customerEntity);
        } catch (error) {
            return left(new Error("Failed to find customer by userId"));
        }
    }
}
