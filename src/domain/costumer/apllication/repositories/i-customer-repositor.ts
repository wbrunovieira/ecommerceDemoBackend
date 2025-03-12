import { Either } from "@/core/either";
import { Customer } from "../../enterprise/entities/customer";

export abstract class ICustomerRepository {
    abstract findCustomerById(
        customerId: string
    ): Promise<Either<Error, Customer>>;
    abstract create(customer: Customer): Promise<Either<Error, void>>;
    abstract listAllCustomers(): Promise<Either<Error, Customer[]>>;
    abstract findByUserId(
        userId: string
    ): Promise<Either<Error, Customer | null>>;
}
