import { Injectable } from "@nestjs/common";

import { Either, left, right } from "@/core/either";
import { ICustomerRepository } from "../repositories/i-customer-repositor";
import { Customer } from "../../enterprise/entities/customer";

@Injectable()
export class ListAllCustomersUseCase {
    constructor(private customerRepository: ICustomerRepository) {}

    async execute(): Promise<Either<Error, Customer[]>> {
        return this.customerRepository.listAllCustomers();
    }
}
