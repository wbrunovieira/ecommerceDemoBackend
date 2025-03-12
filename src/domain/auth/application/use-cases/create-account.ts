import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";

import { IAccountRepository } from "../repositories/i-account-repository";
import { hash } from "bcryptjs";
import { User, UserProps } from "../../enterprise/entities/user";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { MailerService } from "./mailer.service";

interface CreateAccountUseCaseRequest {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
}

type CreateAccountUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        user: Omit<UserProps, "password"> & { id: string };
    }
>;

@Injectable()
export class CreateAccountUseCase {
    constructor(
        private accountRepository: IAccountRepository,
        private mailerService: MailerService
    ) {}

    async execute({
        name,
        email,
        password,
        role,
    }: CreateAccountUseCaseRequest): Promise<CreateAccountUseCaseResponse> {
        try {
            if (!name) {
                return left(new ResourceNotFoundError("User name is required"));
            }

            if (name.length < 3) {
                return left(
                    new ResourceNotFoundError(
                        "User name must be at least 3 characters long"
                    )
                );
            }

            if (password.length < 6) {
                return left(
                    new ResourceNotFoundError(
                        "Password must be at least 6 characters long"
                    )
                );
            }

            const userAlreadyExists =
                await this.accountRepository.findByEmail(email);

            if (userAlreadyExists.isRight()) {
                return left(new ResourceNotFoundError("User already exists"));
            }

            const hashPassword = await hash(password, 8);
            const verificationToken = Math.random().toString(36).substr(2);

            const user = User.create({
                name,
                email,
                password: hashPassword,

                role,
                verificationToken,
            });

            console.log("create account user", user);
            const usercreated = await this.accountRepository.create(user);
            console.log("create account usercreated", usercreated);
            const userSendEmail =
                await this.mailerService.sendVerificationEmail(
                    email,
                    verificationToken
                );
            console.log("create account userSendEmail", userSendEmail);

            return right({
                user: user.toResponseObject(),
            });
        } catch (error) {
            return left(error as Error);
        }
    }
}
