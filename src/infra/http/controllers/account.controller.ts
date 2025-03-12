import {
    ConflictException,
    Get,
    HttpException,
    HttpStatus,
    NotFoundException,
    Param,
    Patch,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import { Body, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";


import { z } from "zod";
import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { CreateAccountUseCase } from "@/domain/auth/application/use-cases/create-account";
import { CreateGoogleAccountUseCase } from "@/domain/auth/application/use-cases/create-account-with-google";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { EditAccountUseCase } from "@/domain/auth/application/use-cases/edit-account";
import { UserProps } from "@/domain/auth/enterprise/entities/user";
import { FindAccountByIdUseCase } from "@/domain/auth/application/use-cases/find-user-by-id";
import { VerifyEmailUseCase } from "@/domain/auth/application/use-cases/verify-email";
import { ResetPasswordUseCase } from "@/domain/auth/application/use-cases/reset-password";
import { ForgotPasswordUseCase } from "@/domain/auth/application/use-cases/forgot-password";

const passwordSchema = z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
    );

const createAccountBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),

    password: passwordSchema,
    role: z.enum(["user", "admin"]).default("user"),
});

const createGoogleAccountBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    googleUserId: z.string(),
    profileImageUrl: z.string().url(),
    role: z.enum(["user", "admin"]).default("user"),
});

const updateUserBodySchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.string().optional(),
    lastLogin: z.string().optional(),
    profileImageUrl: z.string().optional(),
});

type UpdateUserBodySchema = z.infer<typeof updateUserBodySchema>;

type CreateGoogleAccountBodySchema = z.infer<
    typeof createGoogleAccountBodySchema
>;

type CreateAccountBodyBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller("/accounts")
export class AccountController {
    constructor(
        private createAccountUseCase: CreateAccountUseCase,
        private createGoogleAccountUseCase: CreateGoogleAccountUseCase,
        private editAccountUseCase: EditAccountUseCase,
        private findAccountByIdUseCase: FindAccountByIdUseCase,
        private verifyEmailUseCase: VerifyEmailUseCase,
        private prisma: PrismaService,
        private resetPasswordUseCase: ResetPasswordUseCase,
        private forgotPasswordUseCase: ForgotPasswordUseCase,
        private jwt: JwtService
    ) {}

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationsPipe(createAccountBodySchema))
    async handle(@Body() body: CreateAccountBodyBodySchema) {
        const { name, email, password, role } = body;

        const result = await this.createAccountUseCase.execute({
            name,
            email,

            password,
            role,
        });

        if (result.isLeft()) {
            const error = result.value;
            if (error) {
                throw new ConflictException(error.message);
            }
            throw new ConflictException("An unexpected error occurred");
        }

        const { user } = result.value;

        return { user };
    }

    @Post("/google")
    @HttpCode(201)
    @UsePipes(new ZodValidationsPipe(createGoogleAccountBodySchema))
    async handleGoogleAccountCreation(
        @Body() body: CreateGoogleAccountBodySchema
    ) {
        const { name, email, googleUserId, profileImageUrl, role } = body;

        const result = await this.createGoogleAccountUseCase.execute({
            name,
            email,
            googleUserId,
            profileImageUrl,
            role,
        });

        if (result.isLeft()) {
            const error = result.value;

            if (error) {
                throw new ConflictException(error.message);
            }
            throw new ConflictException("An unexpected error occurred");
        }

        return { user: result.value.user };
    }

    @Put("edit/:id")
    // @UsePipes(new ZodValidationsPipe(updateUserBodySchema))
    async handleEditAccount(
        @Param("id") id: string,
        @Body() body: any
    ): Promise<{ user: Omit<UserProps, "password"> & { id: string } }> {
        const result = await this.editAccountUseCase.execute({
            id,
            ...body,
        });

        if (result.isLeft()) {
            const error = result.value;
            if (error instanceof ResourceNotFoundError) {
                throw new NotFoundException(error.message);
            }
            throw new ConflictException(error.message);
        }

        const { user } = result.value;
        return { user: user.toResponseObject() };
    }

    @Post("/check")
    async checkUserByEmail(@Body("email") email: string) {
        if (!email) {
            throw new HttpException(
                "Email is required in request body",
                HttpStatus.BAD_REQUEST
            );
        }

        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (user) {
            return { found: true, user };
        }

        return { found: false };
    }

    @Get("/verify/:token")
    async verifyEmail(@Param("token") token: string) {
        console.log("entrou no verify email token", token);
        if (!token) {
            throw new HttpException(
                "Query parameter 'token' is required",
                HttpStatus.BAD_REQUEST
            );
        }
        console.log("entrou no verify email token2", token);
        const result = await this.verifyEmailUseCase.execute({ token });
        console.log("entrou no verify email result", result);

        if (result.isLeft()) {
            const error = result.value;
            throw new NotFoundException(error.message);
        }

        return { message: "Email verified successfully" };
    }

    @Post("reset-password")
    async resetPassword(
        @Body("token") token: string,
        @Body("newPassword") newPassword: string
    ) {
        const result = await this.resetPasswordUseCase.execute({
            token,
            newPassword,
        });

        if (result.isLeft()) {
            throw result.value;
        }

        return {
            message: "Password has been successfully reset",
        };
    }

    @Post("forgot-password")
    async forgotPassword(@Body("email") email: string) {
        const result = await this.forgotPasswordUseCase.execute({ email });

        if (result.isLeft()) {
            throw result.value;
        }

        return {
            message:
                "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.",
        };
    }

    @Get("/:id")
    async handleGetAccountById(@Param("id") id: string) {
        const result = await this.findAccountByIdUseCase.execute({ id });

        if (result.isLeft()) {
            const error = result.value;
            if (error instanceof ResourceNotFoundError) {
                throw new NotFoundException(error.message);
            }
            throw new ConflictException(error.message);
        }

        const { user } = result.value;
        return { user: user.toResponseObjectPartial() };
    }
}
