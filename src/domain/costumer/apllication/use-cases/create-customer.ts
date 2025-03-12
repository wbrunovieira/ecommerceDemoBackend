import { Injectable } from "@nestjs/common";

import { Either, left, right } from "@/core/either";

import { Customer } from "../../enterprise/entities/customer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id"; // Import necessário para UniqueEntityID
import { ICustomerRepository } from "../repositories/i-customer-repositor";

interface CreateCustomerRequest {
    userId: string;
    firstOrderDate?: Date;
    customerSince: Date;
}

@Injectable()
export class CreateCustomerUseCase {
    constructor(private customerRepository: ICustomerRepository) {}

    async execute(
        request: CreateCustomerRequest
    ): Promise<Either<Error, void>> {
        const customer = Customer.create({
            userId: new UniqueEntityID(request.userId),
            firstOrderDate: request.firstOrderDate,
            customerSince: request.customerSince,
        });

        return this.customerRepository.create(customer);
    }
}
