import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { IAccountRepository } from "../repositories/i-account-repository";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface VerifyEmailUseCaseRequest {
    token: string;
}

type VerifyEmailUseCaseResponse = Either<ResourceNotFoundError, null>;

@Injectable()
export class VerifyEmailUseCase {
    constructor(private accountRepository: IAccountRepository) {}

    async execute({
        token,
    }: VerifyEmailUseCaseRequest): Promise<VerifyEmailUseCaseResponse> {
        console.log("ENTROU NA VerifyEmailUseCase token", token);
        const user =
            await this.accountRepository.findByVerificationToken(token);
        console.log(" VerifyEmailUseCase user", user);

        if (!user) {
            return left(new ResourceNotFoundError("Invalid or expired token"));
        }

        user.isVerified = true;
        user.verificationToken = null;
        console.log("VerifyEmailUseCase use settour", user);

        const userSaved = await this.accountRepository.save(user);
        console.log("VerifyEmailUseCase use userSaved", userSaved);

        return right(null);
    }
}
