import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Env } from "@/env/env";
import { JwtStrategy } from "./jwt.strategy";

import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtResetPasswordService } from "./jwtReset.strategy";

import { RolesGuard } from "./roles.guard";
@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            global: true,
            useFactory(config: ConfigService<Env, true>) {
                const privateKey = config.get("JWT_PRIVATE_KEY", {
                    infer: true,
                });
                const publicKey = config.get("JWT_PUBLIC_KEY", { infer: true });
                console.log(
                    "Private Key:",
                    Buffer.from(privateKey, "base64").toString("utf8")
                );
                console.log(
                    "Public Key:",
                    Buffer.from(publicKey, "base64").toString("utf8")
                );

                if (!privateKey || !publicKey) {
                    throw new Error(
                        "JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must be defined"
                    );
                }

                return {
                    signOptions: { algorithm: "RS256" },
                    privateKey: Buffer.from(privateKey, "base64").toString(),
                    publicKey: Buffer.from(publicKey, "base64").toString(),
                };
            },
        }),
    ],
    providers: [
        JwtStrategy,
        JwtAuthGuard,
        JwtResetPasswordService,

        RolesGuard,
    ],
    exports: [
        JwtAuthGuard,
        JwtModule,
        JwtResetPasswordService,

        RolesGuard,
    ],
})
export class AuthModule {}
