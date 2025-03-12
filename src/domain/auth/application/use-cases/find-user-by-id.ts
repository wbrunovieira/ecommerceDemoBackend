import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";

import { IAccountRepository } from "../repositories/i-account-repository";
import { User } from "../../enterprise/entities/user";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface FindAccountByIdUseCaseRequest {
    id: string;
}

type FindAccountByIdUseCaseResponse = Either<
    ResourceNotFoundError | Error,
    {
        user: User;
    }
>;

@Injectable()
export class FindAccountByIdUseCase {
    constructor(private accountRepository: IAccountRepository) {}

    async execute({
        id,
    }: FindAccountByIdUseCaseRequest): Promise<FindAccountByIdUseCaseResponse> {
        try {
            const userOrError = await this.accountRepository.findById(id);

            if (userOrError.isLeft()) {
                return left(userOrError.value);
            }

            return right({ user: userOrError.value });
        } catch (error) {
            return left(new Error("An unexpected error occurred"));
        }
    }
}
