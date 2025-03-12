import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { IAccountRepository } from "../repositories/i-account-repository";

import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

import { Either, left, right } from "@/core/either";
import { MailerService } from "./mailer.service";

import { JwtResetPasswordService } from "@/auth/jwtReset.strategy";

interface ForgotPasswordUseCaseRequest {
    email: string;
}

type ForgotPasswordUseCaseResponse = Either<ResourceNotFoundError, null>;

@Injectable()
export class ForgotPasswordUseCase {
    constructor(
        private accountRepository: IAccountRepository,
        private mailerService: MailerService,
        private jwtResetPasswordService: JwtResetPasswordService
    ) {}

    async execute({
        email,
    }: ForgotPasswordUseCaseRequest): Promise<ForgotPasswordUseCaseResponse> {
        const userOrError = await this.accountRepository.findByEmail(email);
        if (userOrError.isLeft()) {
            return left(new ResourceNotFoundError("User not found"));
        }
        const user = userOrError.value;

        const token = this.jwtResetPasswordService.generateResetToken(
            user.id.toString()
        );

        try {
            await this.mailerService.sendResetPasswordEmail(user.email, token);
        } catch (error) {
            throw new InternalServerErrorException(
                "Failed to send reset password email"
            );
        }

        return right(null);
    }
}
