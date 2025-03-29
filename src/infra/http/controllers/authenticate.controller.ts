import {
    Body,
    ConflictException,
    Controller,
    HttpCode,
    Post,
    UnauthorizedException,
    UseGuards,
    UsePipes,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { z } from "zod";
import { ZodValidationsPipe } from "../../../pipes/zod-validations-pipe";
import { PrismaService } from "../../../prisma/prisma.service";

import { compare, hash } from "bcryptjs";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";


const autheticateBodySchema = z.object({
    email: z.string(),
    password: z.string(),
});
const createAdminAccountBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
});

const generateAuthUrlSchema = z.object({
    scopes: z.array(z.string()),
});

type AuthenticateBodySchema = z.infer<typeof autheticateBodySchema>;
type CreateAdminAccountBodySchema = z.infer<
    typeof createAdminAccountBodySchema
>;
type GenerateAuthUrlSchema = z.infer<typeof generateAuthUrlSchema>;
@Controller("/sessions")
export class AuthenticateController {
    constructor(
        private prisma: PrismaService,


        private jwt: JwtService
    ) {}

    @Post()
    @UsePipes(new ZodValidationsPipe(autheticateBodySchema))
    async handle(@Body() body: AuthenticateBodySchema) {
        const { email, password } = body;

        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                name: true,
                profileImageUrl: true,
                email: true,
                password: true,
                role: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }
        const accessToken = this.jwt.sign({ sub: user.id, role: user.role });

        const { password: _, ...userWithoutPassword } = user;

        return {
            access_token: accessToken,
            user: userWithoutPassword,
        };
    }

    @Post("/admin")
    @HttpCode(201)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UsePipes(new ZodValidationsPipe(createAdminAccountBodySchema))
    async handleAdminCreation(@Body() body: CreateAdminAccountBodySchema) {
        const { name, email, password } = body;

        const userAlreadyExists = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (userAlreadyExists) {
            throw new ConflictException("User already exists");
        }

        const hashPassword = await hash(password, 8);

        const admin = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                role: "admin",
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        const accessToken = this.jwt.sign({ sub: admin.id, role: admin.role });

        return { admin, accessToken };
    }

 


   
}
