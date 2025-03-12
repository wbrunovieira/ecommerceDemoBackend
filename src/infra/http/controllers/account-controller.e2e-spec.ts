import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";

import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Create Account (E2E)", () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();

        await app.init();
        prisma = app.get(PrismaService);
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        "checkuser@example.com",
                        "googleuser@example.com",
                        "bruno@example.com",
                        "duplicate@example.com",
                    ],
                },
            },
        });

        await app.close();
    });

    test("[POST] /accounts  - Success", async () => {
        const response = await request(app.getHttpServer())
            .post("/accounts")
            .send({
                name: "Bruno Vieira",
                email: "bruno@example.com",
                password: "12345@aA",
            });

        expect(response.statusCode).toBe(201);

        const userOnDatabase = await prisma.user.findUnique({
            where: {
                email: "bruno@example.com",
            },
        });

        expect(userOnDatabase).toBeTruthy();
    });

    test("[POST] /accounts - Missing Name", async () => {
        const response = await request(app.getHttpServer())
            .post("/accounts")
            .send({
                email: "missingname@example.com",
                password: "12345@aA",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors.details).toContainEqual({
            code: "invalid_type",
            expected: "string",
            message: "Required",
            path: ["name"],
            received: "undefined",
        });
    });

    test("[POST] /accounts - Invalid Email", async () => {
        const response = await request(app.getHttpServer())
            .post("/accounts")
            .send({
                name: "Invalid Email",
                email: "invalid-email",
                password: "12345@aA",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors.details).toContainEqual({
            code: "invalid_string",
            validation: "email",
            message: "Invalid email",
            path: ["email"],
        });
    });

    test("[POST] /accounts - Weak Password", async () => {
        const response = await request(app.getHttpServer())
            .post("/accounts")
            .send({
                name: "Weak Password",
                email: "weakpassword@example.com",
                password: "weak",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors.details).toContainEqual({
            code: "too_small",
            minimum: 6,
            inclusive: true,
            exact: false,
            message: "Password must be at least 6 characters long",
            path: ["password"],
            type: "string",
        });
        expect(response.body.errors.details).toContainEqual({
            code: "invalid_string",
            message: "Password must contain at least one uppercase letter",
            path: ["password"],
            validation: "regex",
        });
        expect(response.body.errors.details).toContainEqual({
            code: "invalid_string",
            message: "Password must contain at least one number",
            path: ["password"],
            validation: "regex",
        });
        expect(response.body.errors.details).toContainEqual({
            code: "invalid_string",
            message: "Password must contain at least one special character",
            path: ["password"],
            validation: "regex",
        });
    });

    test("[POST] /accounts - Email Conflict", async () => {
        await request(app.getHttpServer()).post("/accounts").send({
            name: "Duplicate User",
            email: "duplicate@example.com",
            password: "12345@aA",
        });

        const response = await request(app.getHttpServer())
            .post("/accounts")
            .send({
                name: "Duplicate User",
                email: "duplicate@example.com",
                password: "12345@aA",
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toContain("User already exists");
    });

    test("[POST] /accounts/google - Success", async () => {
        const response = await request(app.getHttpServer())
            .post("/accounts/google")
            .send({
                name: "Google User",
                email: "googleuser@example.com",
                googleUserId: "google-id-123",
                profileImageUrl: "http://example.com/profile.jpg",
                role: "user",
            });

        expect(response.statusCode).toBe(201);

        const userOnDatabase = await prisma.user.findUnique({
            where: {
                email: "googleuser@example.com",
            },
        });

        expect(userOnDatabase).toBeTruthy();
    });

    test("[POST] /accounts/google - Missing Name", async () => {
        const response = await request(app.getHttpServer())
            .post("/accounts/google")
            .send({
                email: "missingname@example.com",
                googleUserId: "google-id-123",
                profileImageUrl: "http://example.com/profile.jpg",
                role: "user",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors.details).toContainEqual({
            code: "invalid_type",
            expected: "string",
            message: "Required",
            path: ["name"],
            received: "undefined",
        });
    });

    test("[POST] /accounts/google - Invalid Email", async () => {
        const response = await request(app.getHttpServer())
            .post("/accounts/google")
            .send({
                name: "Invalid Email",
                email: "invalid-email",
                googleUserId: "google-id-123",
                profileImageUrl: "http://example.com/profile.jpg",
                role: "user",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain("Validation failed");
        expect(response.body.errors.details).toContainEqual({
            code: "invalid_string",
            validation: "email",
            message: "Invalid email",
            path: ["email"],
        });
    });

    test("[POST] /accounts/google - Email Conflict", async () => {
        await request(app.getHttpServer()).post("/accounts/google").send({
            name: "Duplicate Google User",
            email: "duplicategoogle@example.com",
            googleUserId: "google-id-123",
            profileImageUrl: "http://example.com/profile.jpg",
            role: "user",
        });

        const response = await request(app.getHttpServer())
            .post("/accounts/google")
            .send({
                name: "Duplicate Google User",
                email: "duplicategoogle@example.com",
                googleUserId: "google-id-124",
                profileImageUrl: "http://example.com/profile.jpg",
                role: "user",
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toContain("User already exists");
    });

    test("[POST] /accounts/check - User Exists", async () => {
        await prisma.user.create({
            data: {
                name: "Check User",
                email: "checkuser@example.com",
                password: "12345@aA",
                role: "user",
            },
        });

        const response = await request(app.getHttpServer())
            .post("/accounts/check")
            .send({
                email: "checkuser@example.com",
            });

        expect(response.statusCode).toBe(201);
        expect(response.text).toBe("true");
    });

    test("[POST] /accounts/check - User Does Not Exist", async () => {
        const response = await request(app.getHttpServer())
            .post("/accounts/check")
            .send({
                email: "nonexistent@example.com",
            });

        expect(response.statusCode).toBe(201);
        expect(response.text).toBe("false");
    });

    test("[POST] /accounts/check - Missing Email", async () => {
        const response = await request(app.getHttpServer())
            .post("/accounts/check")
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain(
            "Email is required in request body"
        );
    });
});
