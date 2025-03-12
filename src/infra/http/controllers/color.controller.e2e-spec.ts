import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { HttpStatus, INestApplication } from "@nestjs/common";

import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Colors Controller (E2E)", () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let authToken: string;
    let colorId: string;

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
        await prisma.color.deleteMany({});

        const color = await prisma.color.create({
            data: { name: "blue" },
        });
        colorId = color.id;
    });

    test("[POST] /colors", async () => {
        const response = await request(app.getHttpServer())
            .post("/colors")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "red" });

        const colorResponse = response.body.color.props;

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("color");
        expect(response.body.color).toHaveProperty("props");
        expect(colorResponse.name).toEqual("red");
        expect(colorResponse).toHaveProperty("createdAt");
        expect(colorResponse).toHaveProperty("updatedAt");

        colorId = response.body.color._id.value;
    });

    test("[POST] /colors with invalid data", async () => {
        const response = await request(app.getHttpServer())
            .post("/colors")
            .set("Authorization", `Bearer ${authToken}`)
            .send({});

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain("Validation failed");
    });

    test("[GET] /colors", async () => {
        const response = await request(app.getHttpServer())
            .get("/colors")
            .query({ name: "blue" })
            .set("Authorization", `Bearer ${authToken}`);

        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body).toHaveProperty("color");
        expect(response.body.color.props.name).toEqual("blue");
    });

    test("[GET] /colors/:id", async () => {
        const response = await request(app.getHttpServer())
            .get(`/colors/${colorId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(HttpStatus.OK);

        expect(response.statusCode).toBe(200);

        expect(response.body.color.props.name).toEqual("blue");
    });

    test("[GET] /colors/all", async () => {
        const response = await request(app.getHttpServer())
            .get("/colors/all")
            .query({ page: 1, pageSize: 10 })
            .set("Authorization", `Bearer ${authToken}`)
            .expect(HttpStatus.OK);

        expect(response.body.colors).toHaveLength(1);
        expect(response.body.colors[0].props.name).toEqual("blue");
    });

    test("[PUT] /colors/:id", async () => {
        const updatedColorData = { name: "green" };
        const response = await request(app.getHttpServer())
            .put(`/colors/${colorId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(updatedColorData);

        expect(response.statusCode).toBe(200);

        expect(response.body.color.props.name).toEqual(updatedColorData.name);
    });

    test("[DELETE] /colors/:id", async () => {
        const response = await request(app.getHttpServer())
            .delete(`/colors/${colorId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(HttpStatus.OK);

        expect(response.body.message).toEqual("Color deleted successfully");
    });

    afterAll(async () => {
        await app.close();
    });
});
