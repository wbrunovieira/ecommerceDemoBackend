import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Category Controller (E2E)", () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let authToken: string;
    let categoryId: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService);
        await app.init();

        const response = await request(app.getHttpServer())
            .post("/sessions")
            .send({ email: "admin@example.com", password: "Adminpassword@8" });

        authToken = response.body.access_token;

        if (!authToken) {
            throw new Error("Authentication failed: No token received");
        }
    });

    beforeEach(async () => {
        await prisma.category.deleteMany({});
        const category = await prisma.category.create({
            data: { name: "category 1" },
        });
        categoryId = category.id;
    });

    afterAll(async () => {
        await app.close();
    });

    test("[POST] /category", async () => {
        const response = await request(app.getHttpServer())
            .post("/category")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "category 2" });

        const categoryResponse = response.body.category.props;

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("category");
        expect(response.body.category).toHaveProperty("props");
        expect(categoryResponse.name).toEqual("category 2");
        expect(categoryResponse).toHaveProperty("createdAt");
        expect(categoryResponse).toHaveProperty("updatedAt");

        categoryId = response.body.category._id.value;
    });

    test("[POST] /category with invalid data", async () => {
        const response = await request(app.getHttpServer())
            .post("/category")
            .set("Authorization", `Bearer ${authToken}`)
            .send({});

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain("Validation failed");
    });

    test("[PUT] /category/:id", async () => {
        const updatedCategoryData = { name: "category 3" };
        const response = await request(app.getHttpServer())
            .put(`/category/${categoryId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(updatedCategoryData);

        expect(response.statusCode).toBe(200);

        expect(response.body.category.props.name).toEqual(
            updatedCategoryData.name
        );
    });

    test("[GET] /category/all", async () => {
        const response = await request(app.getHttpServer())
            .get("/category/all")
            .query({ page: 1, pageSize: 10 })
            .set("Authorization", `Bearer ${authToken}`)
            .expect(HttpStatus.OK);

        expect(response.body.categories).toHaveLength(1);
        expect(response.body.categories[0].props.name).toEqual("category 1");
    });

    test("[GET] /category/:id", async () => {
        const response = await request(app.getHttpServer())
            .get(`/category/${categoryId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(HttpStatus.OK);

        expect(response.body).toHaveProperty("category");
        expect(response.body.category.props.name).toEqual("category 1");
    });

    test("[GET] /category", async () => {
        const response = await request(app.getHttpServer())
            .get("/category")
            .query({ name: "category 1" })
            .set("Authorization", `Bearer ${authToken}`);

        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body).toHaveProperty("category");
        expect(response.body.category.props.name).toEqual("category 1");
    });

    test("[DELETE] /category/:id", async () => {
        const response = await request(app.getHttpServer())
            .delete(`/category/${categoryId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(HttpStatus.OK);

        expect(response.body.message).toEqual("Category deleted successfully");
    });
});
