import { Roles } from "@/auth/roles.decorator";
import { CreateCustomerUseCase } from "@/domain/costumer/apllication/use-cases/create-customer";
import { FindCustomerByIdUseCase } from "@/domain/costumer/apllication/use-cases/find-customer-by-id";
import { ListAllCustomersUseCase } from "@/domain/costumer/apllication/use-cases/list-all-customers";
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpException,
    HttpStatus,
} from "@nestjs/common";

@Controller("customers")
export class CustomerController {
    constructor(
        private readonly listAllCustomersUseCase: ListAllCustomersUseCase,
        private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase,
        private readonly createCustomerUseCase: CreateCustomerUseCase
    ) {}

    @Get("all")
    @Roles("admin")
    async listAllCustomers() {
        try {
            const result = await this.listAllCustomersUseCase.execute();

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return result.value;
        } catch (error) {
            throw new HttpException(
                "Failed to list customers",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Roles("admin")
    @Get(":id")
    async findCustomerById(@Param("id") id: string) {
        try {
            const result = await this.findCustomerByIdUseCase.execute(id);

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.NOT_FOUND
                );
            }

            return result.value;
        } catch (error) {
            throw new HttpException(
                "Failed to find customer",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post("create")
    async createCustomer(
        @Body()
        body: {
            userId: string;
            firstOrderDate?: Date;
            customerSince: Date;
        }
    ) {
        try {
            const result = await this.createCustomerUseCase.execute(body);

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.BAD_REQUEST
                );
            }

            return {
                message: "Customer created successfully",
            };
        } catch (error) {
            throw new HttpException(
                "Failed to create customer",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
