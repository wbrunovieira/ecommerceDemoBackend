import { Env } from "@/env/env";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

interface ShipmentData {
    from: {
        postal_code: string;
    };
    to: {
        postal_code: string;
    };
    products: {
        id: string;
        width: number;
        height: number;
        length: number;
        weight: number;
        insurance_value: number;
        quantity: number;
    }[];
    options: {
        receipt: boolean;
        own_hand: boolean;
    };
    services?: string;
}

@Injectable()
export class CalculateShipmentUseCase {
    private readonly clientId;
    private readonly clientSecret;
    private readonly urlCallBack;
    private readonly tokenMelhorEnvio;
    constructor(private configService: ConfigService<Env, true>) {
        this.configService = configService;
        let url = configService.get("MELHOR_ENVIO_API_URL_TEST");
        this.urlCallBack = configService.get(
            "MELHOR_ENVIO_API_URL_CALLBACK_TEST"
        );
        this.clientId = configService.get("MELHOR_ENVIO_CLIENTID_TEST");
        this.clientSecret = configService.get("MELHOR_ENVIO_SECRET_TEST");
        this.tokenMelhorEnvio = configService.get(
            "MELHOR_ENVIO_API_URL_TOKEN_TEST"
        );
    }

    async calculateShipment(data: any) {
        console.log(" calculateShipment use case data", data);
        const url =
            "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate";
        const headers = {
            "Content-Type": "application/json",

            "User-Agent": "StylosTeste3 (bruno@wbdigitalsolutions.com)",
            Authorization: `Bearer ${this.tokenMelhorEnvio}`,
            Accept: "application/json",
        };

        try {
            const response = await axios.post(url, data, { headers });
            console.log(" calculateShipment use case response", response);
            return response.data;
        } catch (error) {
            console.error("Error calculating shipment:", error);
            throw new Error("Failed to calculate shipment");
        }
    }
}
