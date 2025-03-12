import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";

import { IAccountRepository } from "../repositories/i-account-repository";
import { User } from "../../enterprise/entities/user";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface EditAccountUseCaseRequest {
    id: string;
    name?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    profileImageUrl?: string;
    lastLogin?: string;
}

type EditAccountUseCaseResponse = Either<
    ResourceNotFoundError | Error,
    {
        user: User;
    }
>;

@Injectable()
export class EditAccountUseCase {
    constructor(private accountRepository: IAccountRepository) {}

    async execute({
        id,
        name,

        profileImageUrl,

        phone,
        birthDate,
        gender,
    }: EditAccountUseCaseRequest): Promise<EditAccountUseCaseResponse> {
        try {
            const userOrError = await this.accountRepository.findById(id);

            if (userOrError.isLeft()) {
                return left(new ResourceNotFoundError("User not found"));
            }

            const user = userOrError.value;

            if (name !== undefined) user.name = name;

            if (profileImageUrl !== undefined)
                user.profileImageUrl = profileImageUrl;

            if (phone !== undefined) user.phone = phone;
            if (birthDate !== undefined) user.birthDate = new Date(birthDate);
            if (gender !== undefined) user.gender = gender;

            const saveOrError = await this.accountRepository.save(user);

            if (saveOrError.isLeft()) {
                return left(saveOrError.value);
            }

            return right({
                user,
            });
        } catch (error) {
            return left(error as Error);
        }
    }
}
