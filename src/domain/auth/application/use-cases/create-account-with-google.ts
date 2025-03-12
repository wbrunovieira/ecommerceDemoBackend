import { Injectable, ConflictException } from "@nestjs/common";
import { IAccountRepository } from "../repositories/i-account-repository";
import { hash } from "bcryptjs";
import { User } from "../../enterprise/entities/user";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface CreateGoogleAccountUseCaseRequest {
    name: string;
    email: string;
    googleUserId: string;
    profileImageUrl: string;
    role: "user" | "admin";
}

type CreateGoogleAccountUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        user: User;
    }
>;

@Injectable()
export class CreateGoogleAccountUseCase {
    constructor(private accountRepository: IAccountRepository) {}

    async execute({
        name,
        email,
        googleUserId,
        profileImageUrl,
        role,
    }: CreateGoogleAccountUseCaseRequest): Promise<CreateGoogleAccountUseCaseResponse> {
        try {
            const userAlreadyExists =
                await this.accountRepository.findByEmail(email);

            if (userAlreadyExists.isRight()) {
                return left(new ResourceNotFoundError("User already exists"));
            }

            const hashPassword = await hash("123456aA@", 8);

            const user = User.create({
                name,
                email,
                password: hashPassword,
                googleUserId,
                isGoogleUser: true,
                profileImageUrl,
                role,
            });

            const createResult = await this.accountRepository.create(user);

            return right({ user });
        } catch (error) {
            return left(error as Error);
        }
    }
}
