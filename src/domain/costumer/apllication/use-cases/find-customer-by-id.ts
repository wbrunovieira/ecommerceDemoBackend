import { Injectable } from "@nestjs/common";

import { Either } from "@/core/either";
import { Customer } from "../../enterprise/entities/customer";
import { ICustomerRepository } from "../repositories/i-customer-repositor";

@Injectable()
export class FindCustomerByIdUseCase {
    constructor(private customerRepository: ICustomerRepository) {}

    async execute(customerId: string): Promise<Either<Error, Customer>> {
        return this.customerRepository.findCustomerById(customerId);
    }
}
