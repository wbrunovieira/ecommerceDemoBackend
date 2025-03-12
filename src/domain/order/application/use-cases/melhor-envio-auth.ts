import { Env } from "@/env/env";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
("@nestjs/common");
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class AuthMelhorEnvioUseCase {
    private readonly clientId;
    private readonly clientSecret;
    private readonly urlCallBack;

    constructor(private configService: ConfigService<Env, true>) {
        this.configService = configService;
        let url = configService.get("MELHOR_ENVIO_API_URL_TEST");
        this.urlCallBack = configService.get(
            "MELHOR_ENVIO_API_URL_CALLBACK_TEST"
        );
        this.clientId = configService.get("MELHOR_ENVIO_CLIENTID_TEST");
        this.clientSecret = configService.get("MELHOR_ENVIO_SECRET_TEST");
    }

    generateAuthUrl(): string {
        const baseUrl = "https://sandbox.melhorenvio.com.br/oauth/authorize";
        const scopes = ["shipping-calculate", "shipping-checkout"];
        const scope = scopes.join(" ");

        const url = `${baseUrl}?client_id=${this.clientId}&redirect_uri=${this.urlCallBack}&response_type=code&scope=${scope}`;
        console.log("this.urlCallBack", this.urlCallBack);
        return url;
    }

    async requestToken(authCode: string): Promise<any> {
        const url = "https://sandbox.melhorenvio.com.br/oauth/token";
        const headers = {
            "Content-Type": "application/json",
            "User-Agent": "StylosTeste3 (bruno@wbdigitalsolutions.com)",
            Accept: "application/json",
        };
        const body = {
            grant_type: "authorization_code",
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.urlCallBack,
            code: authCode,
        };
        try {
            console.log("AuthMelhorEnvioUseCase body", body);
            const response = await axios.post(url, body, { headers });
            console.log("AuthMelhorEnvioUseCase response", response);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.log(
                    "AuthMelhorEnvioUseCase error.response",
                    error.response
                );
                throw new HttpException(
                    error.response.data,
                    error.response.status
                );
            } else {
                throw new HttpException(
                    "An error occurred while requesting the token",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async refreshToken(refreshToken: string): Promise<any> {
        const url = "https://sandbox.melhorenvio.com.br/oauth/token";
        const headers = {
            "Content-Type": "application/json",
            "User-Agent": "StylosTeste3 (bruno@wbdigitalsolutions.com)",
            Accept: "application/json",
        };
        const body = {
            grant_type: "refresh_token",
            client_id: this.clientId,
            client_secret: this.clientSecret,
            refresh_token: refreshToken,
        };
        try {
            console.log("AuthMelhorEnvioUseCase refreshToken body", body);
            const response = await axios.post(url, body, { headers });
            console.log(
                "AuthMelhorEnvioUseCase refreshToken response",
                response
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.log(
                    "AuthMelhorEnvioUseCase refreshToken error.response",
                    error.response
                );
                throw new HttpException(
                    error.response.data,
                    error.response.status
                );
            } else {
                throw new HttpException(
                    "An error occurred while refreshing the token",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
}
