import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, INestApplication } from "@nestjs/common";
import request from "supertest";

import { AppModule } from "@/app.module";
import { CreateCartUseCase } from "@/domain/order/application/use-cases/create-cart";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { CartController } from "@/infra/http/controllers/cart.controller";

describe("CartController", () => {
    let app: INestApplication;
    let createCartUseCase: CreateCartUseCase;
    let userAuthToken: string;
    let adminAuthToken: string;
    let createdProductId: string;
    let colorId1: string;
    let colorId2: string;
    let categoryId: string;
    let sizeId1: string;
    let sizeId2: string;

    let brandId: string;
    let userId;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            controllers: [CartController],
            providers: [
                {
                    provide: CreateCartUseCase,
                    useValue: {
                        execute: vi.fn(),
                    },
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        createCartUseCase =
            moduleFixture.get<CreateCartUseCase>(CreateCartUseCase);
        await app.init();

        let response = await request(app.getHttpServer())
            .post("/sessions")
            .send({ email: "admin@example.com", password: "Adminpassword@8" })
            .expect(201);

        adminAuthToken = response.body.access_token;

        response = await request(app.getHttpServer())
            .post("/colors")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({ name: "black" })
            .expect(201);

        colorId1 = response.body.color._id.value;

        response = await request(app.getHttpServer())
            .post("/colors")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({ name: "white" })
            .expect(201);
        colorId2 = response.body.color._id.value;

        response = await request(app.getHttpServer())
            .post("/category")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({ name: "category 8" })
            .expect(201);
        categoryId = response.body.category._id.value;

        response = await request(app.getHttpServer())
            .post("/size")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({ name: "MM" })
            .expect(201);
        sizeId1 = response.body.size._id.value;

        response = await request(app.getHttpServer())
            .post("/size")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({ name: "LL" })
            .expect(201);
        sizeId2 = response.body.size._id.value;

        response = await request(app.getHttpServer())
            .post("/brands")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({ name: "marca 112sss" })
            .expect(201);
        brandId = response.body.brand._id.value;

        response = await request(app.getHttpServer())
            .post("/products")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({
                name: "Test Product",
                description: "Test Product Description",
                images: ["/images/test.jpg"],

                brandId: brandId,
                sku: "test-sku",
                price: 100,
                stock: 10,
                productColors: [colorId1, colorId2],
                productCategories: [categoryId],
                productSizes: [sizeId1, sizeId2],
            })
            .expect(201);

        createdProductId = response.body.product._id.value;

        response = await request(app.getHttpServer())
            .post("/accounts")
            .send({
                name: "Test User",
                email: "testuser@example.com",
                password: "Password@123",
                role: "user",
            })
            .expect(201);
        userId = response.body.user._id.value;

        response = await request(app.getHttpServer())
            .post("/sessions")
            .send({ email: "testuser@example.com", password: "Password@123" })
            .expect(201);

        userAuthToken = response.body.access_token;
    });

    afterAll(async () => {
        await app.close();
    });

    it("should create a cart successfully", async () => {
        const response = await request(app.getHttpServer())
            .post("/cart")
            .set("Authorization", `Bearer ${userAuthToken}`)
            .send({
                userId: userId,
                items: [
                    { productId: createdProductId, quantity: 1, price: 100 },
                ],
            })
            .expect(201);
    });

    // it("should return a conflict error if product does not exist", async () => {
    //   vi.spyOn(createCartUseCase, "execute").mockResolvedValue(
    //     left(new ResourceNotFoundError("Product not found"))
    //   );

    //   const response = await request(app.getHttpServer())
    //     .post("/cart")
    //     .set("Authorization", `Bearer ${userAuthToken}`)
    //     .send({
    //       userId: "user-123",
    //       items: [{ productId: "nonexistent-product", quantity: 1, price: 100 }],
    //     })
    //     .expect(409);

    //   expect(response.body.message).toBe("Product not found");
    // });

    // it("should return a conflict error if there is insufficient stock", async () => {
    //   vi.spyOn(createCartUseCase, "execute").mockResolvedValue(
    //     left(new ResourceNotFoundError("Insufficient stock"))
    //   );

    //   const response = await request(app.getHttpServer())
    //     .post("/cart")
    //     .set("Authorization", `Bearer ${userAuthToken}`)
    //     .send({
    //       userId: "user-123",
    //       items: [{ productId: "product-1", quantity: 20, price: 100 }],
    //     })
    //     .expect(409);

    //   expect(response.body.message).toBe("Insufficient stock");
    // });

    // it("should return a conflict error if quantity is invalid", async () => {
    //   vi.spyOn(createCartUseCase, "execute").mockResolvedValue(
    //     left(new ResourceNotFoundError("Quantity must be greater than zero"))
    //   );

    //   const response = await request(app.getHttpServer())
    //     .post("/cart")
    //     .set("Authorization", `Bearer ${userAuthToken}`)
    //     .send({
    //       userId: "user-123",
    //       items: [{ productId: "product-1", quantity: 0, price: 100 }],
    //     })
    //     .expect(409);

    //   expect(response.body.message).toBe("Quantity must be greater than zero");
    // });
});
