import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";

interface SenderInfo {
    name: string;
    document: string;
    email: string;
    phone: string;
    address: {
        street: string;
        complement?: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    economic_activity_code?: string;
}

interface RecipientInfo {
    name: string;
    document: string;
    email: string;
    phone: string;
    address: {
        street: string;
        complement?: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    economic_activity_code?: string;
}

interface ProductInfo {
    id: string;
    title: string;
    quantity: number;
    unit_value: number;
    weight: number;
}

interface VolumeInfo {
    height: number;
    width: number;
    length: number;
    weight: number;
}

interface ShippingOptions {
    insurance_value: number;
    receipt: boolean;
    own_hand: boolean;
    reverse: boolean;
    non_commercial: boolean;
    invoice?: {
        key: string; // Chave da NF
    };
    platform?: string;
    tags?: {
        tag: string;
        url: string;
    }[];
}

interface AddFreightToCartRequest {
    service: number;
    agency?: number;
    from: SenderInfo;
    to: RecipientInfo;
    products: ProductInfo[];
    volumes: VolumeInfo[];
    options: ShippingOptions;
    accessToken: string;
}

@Injectable()
export class AddFreightToCartUseCase {
    private readonly MELHOR_ENVIO_API_URL =
        "https://sandbox.melhorenvio.com.br/api/v2/me/cart";

    async execute(request: AddFreightToCartRequest): Promise<any> {
        const {
            service,
            agency,
            from,
            to,
            products,
            volumes,
            options,
            accessToken,
        } = request;

        try {
            const response = await axios.post(
                this.MELHOR_ENVIO_API_URL,
                {
                    service,
                    agency,
                    from,
                    to,
                    products,
                    volumes,
                    options,
                },
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                        "User-Agent": "Aplicação (email@contato.com)",
                    },
                }
            );

            if (response.status === 201) {
                return response.data;
            } else {
                throw new HttpException(
                    "Failed to add freight to cart",
                    HttpStatus.BAD_REQUEST
                );
            }
        } catch (error) {
            console.error("Error adding freight to cart:", error);
            throw new HttpException(
                "Error adding freight to cart",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
