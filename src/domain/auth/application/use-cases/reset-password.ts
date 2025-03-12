import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from "@nestjs/common";
import { IAccountRepository } from "../repositories/i-account-repository";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { Either, left, right } from "@/core/either";
import { hash } from "bcryptjs";
import { JwtResetPasswordService } from "@/auth/jwtReset.strategy";

const jwt = require("jsonwebtoken");

interface ResetPasswordUseCaseRequest {
    token: string;
    newPassword: string;
}

type ResetPasswordUseCaseResponse = Either<ResourceNotFoundError, null>;

@Injectable()
export class ResetPasswordUseCase {
    constructor(
        private accountRepository: IAccountRepository,
        private jwtResetPasswordService: JwtResetPasswordService
    ) {}

    async execute({
        newPassword,
        token,
    }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
        let decoded;

        try {
            decoded = this.jwtResetPasswordService.validateResetToken(token);

            if (!decoded) {
                throw new UnauthorizedException("Invalid or expired token");
            }
        } catch (error) {
            console.error("Invalid or expired token", error);
        }

        const userId = decoded.sub;

        const userOrError = await this.accountRepository.findById(userId);
        console.log("user", userOrError);
        console.log("user", userOrError);
        const user = userOrError.value;

        if (userOrError.isLeft()) {
            return left(new ResourceNotFoundError("User not found"));
        }

        const hashPassword = await hash(newPassword, 8);

        const result = await this.accountRepository.updatePassword(
            userId,
            hashPassword
        );
        if (result.isLeft()) {
            return left(
                new InternalServerErrorException("Failed to update password")
            );
        }

        return right(null);
    }
}
