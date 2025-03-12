import "module-alias/register";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Env } from "@/env/env";
import { resolve } from "path";
console.log("Using tsconfig:", resolve(__dirname, "../tsconfig.json"));

async function bootstrap() {
    console.log("==> Starting application bootstrap");
    console.log("==> NODE_ENV:", process.env.NODE_ENV);
    console.log("==> DATABASE_URL:", process.env.DATABASE_URL);
    console.log("Variáveis carregadas:", process.env);

    console.log("==> Using tsconfig:", resolve(__dirname, "../tsconfig.json"));

    const app = await NestFactory.create(AppModule, {
        cors: true,
        logger: ["error", "warn", "log", "debug", "verbose"],
    });

    const configService = app.get<ConfigService<Env, true>>(ConfigService);
    const port = configService.get("PORT", { infer: true });

    app.enableCors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    app.use((req, res, next) => {
        console.log(`Request received: ${req.method} ${req.url}`);
        res.on("finish", () => {
            console.log(`Response sent: ${res.statusCode}`);
        });
        next();
    });

    await app.listen(port, "0.0.0.0");
}
bootstrap();
