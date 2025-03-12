import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("List all products (E2E)", () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();

        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test("[GET] /products", async () => {
        const user = await prisma.user.create({
            data: {
                name: "Bruno Vieira",
                email: "bruno@example.com",
                password: "123456",
            },
        });

        const accessToken = jwt.sign({ sub: user.id });

        await prisma.product.createMany({
            data: [
                {
                    name: "calcinha 1",
                    description: "calcinha 1 description",
                    color: "blue",
                    size: "M",

                    brand: "brand 1",
                    price: 100.0,
                    stock: 10,
                },
                {
                    name: "calcinha 2",
                    description: "calcinha 2 description",
                    color: "black",
                    size: "G",

                    brand: "brand 2",
                    price: "200.00",
                    stock: 10,
                },
            ],
        });

        const response = await request(app.getHttpServer())
            .get("/products")
            .set("Authorization", `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            products: [
                expect.objectContaining({ name: "calcinha 1" }),
                expect.objectContaining({ name: "calcinha 2" }),
            ],
        });
    });
});
