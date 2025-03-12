import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { PrismaService } from "./prisma/prisma.service";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { envSchema } from "@/env/env";
import { ListAllAccountsController } from "./infra/http/controllers/list-all-accounts.controller";
import { DatabaseModule } from "./infra/database/database.module";
import { HttpModule } from "./infra/http/http.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./auth/roles.guard";
import { AuthenticateController } from "./infra/http/controllers/authenticate.controller";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath:
                process.env.NODE_ENV === "production"
                    ? undefined
                    : ".env.development",
            validate: (env) => envSchema.parse(env),
            ignoreEnvFile: process.env.NODE_ENV === "production",
        }),

        AuthModule,
        HttpModule,
        DatabaseModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "public"),
            serveRoot: "/public",
        }),
    ],
    controllers: [AuthenticateController, ListAllAccountsController],
    providers: [PrismaService],
})
export class AppModule {}
