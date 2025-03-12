import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";
import { Env } from "@/env/env";

interface PurchaseLabelsRequest {
    orders: string[];
    accessToken: string;
}

interface PurchaseLabelsResponse {
    success: boolean;
    data: any;
}

@Injectable()
export class PurchaseLabelsUseCase {
    private readonly MELHOR_ENVIO_API_URL =
        "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/checkout";

    async execute({
        orders,
        accessToken,
    }: PurchaseLabelsRequest): Promise<PurchaseLabelsResponse> {
        try {
            const response = await axios.post(
                this.MELHOR_ENVIO_API_URL,
                { orders },
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                        "User-Agent": "Aplicação (email@contato.com)", // Substitua pelo seu email de contato técnico
                    },
                }
            );

            if (response.status === 200) {
                return { success: true, data: response.data };
            } else {
                throw new HttpException(
                    "Failed to purchase labels",
                    HttpStatus.BAD_REQUEST
                );
            }
        } catch (error) {
            console.error("Error purchasing labels:", error);
            throw new HttpException(
                "Error purchasing labels",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
