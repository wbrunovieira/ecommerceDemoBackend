import { Injectable } from "@nestjs/common";
import axios from "axios";

export interface Supplier {
    id: number;
    trade_name: string;
    company_name: string;
    document: string;
    address?: any;
}

@Injectable()
export class FetchAllSuppliersUseCase {
    private readonly baseUrl = "https://connectplug.com.br/api/v2/product";
    private readonly initialDelayTime = 800;
    private readonly maxDelayTime = 16000;
    private readonly maxRetries = 10;
    private readonly tokenConnectPlug: string;

    constructor() {
        this.tokenConnectPlug = process.env.TOKEN_CONNECTPLUG || "";
    }

    async fetchAllSuppliers(): Promise<Supplier[]> {
        const suppliersMap: Record<number, Supplier> = {};

        let productId = 1;
        let delayTime = this.initialDelayTime;

        // IDs para busca: 1 a 414, 4800 a 4900, 5020 a 5026, 4900 a 5019, 4500 a 4799,4000 A 4499
        while (productId <= 2) {
            let attempts = 0;
            let success = false;

            while (attempts < this.maxRetries && !success) {
                try {
                    const response =
                        await this.fetchProductSuppliers(productId);
                    const data = response.data.data;

                    if (
                        response.status === 200 &&
                        response.headers["x-ratelimit-remaining"]
                    ) {
                        console.log(
                            `Received response with X-RateLimit-Remaining: ${response.headers["x-ratelimit-remaining"]}`
                        );

                        if (data && data.length > 0) {
                            data.forEach((item: any) => {
                                const supplier =
                                    item.relationships.supplier.data;
                                if (!suppliersMap[supplier.id]) {
                                    suppliersMap[supplier.id] = {
                                        id: supplier.id,
                                        trade_name:
                                            supplier.properties.trade_name,
                                        company_name:
                                            supplier.properties.company_name,
                                        document: supplier.properties.document,
                                        address:
                                            supplier.relationships?.address
                                                ?.data,
                                    };
                                }
                            });
                            success = true;
                            delayTime = this.initialDelayTime;
                        } else {
                            console.log(
                                `No suppliers found for product ID ${productId}. Continuing to next ID.`
                            );
                            break;
                        }
                    } else {
                        console.log(
                            `Unexpected response structure or missing headers for product ID ${productId}.`
                        );
                    }
                } catch (error: any) {
                    if (error.response && error.response.status === 401) {
                        console.error(
                            `Error fetching product ID ${productId}: Unauthorized (401).`
                        );
                        return Object.values(suppliersMap);
                    } else if (
                        error.response &&
                        error.response.status === 429
                    ) {
                        console.warn(
                            `Rate limit exceeded for product ID ${productId}. Retrying after delay.`
                        );
                        delayTime = Math.min(
                            delayTime * 1.5,
                            this.maxDelayTime
                        );
                        await this.delay(delayTime);
                        console.log(`delayTime ${delayTime}`);
                        console.log(`attempts ${attempts}`);
                        attempts++;
                    } else if (
                        error.response &&
                        error.response.status !== 404
                    ) {
                        console.error(
                            `Error fetching product ID ${productId}:`,
                            error.message
                        );
                        attempts++;
                    } else {
                        break;
                    }
                }
            }
            if (productId >= 4799) {
                console.log(
                    `Final product ID reached: ${productId}. Ending loop.`
                );
                break;
            } else {
                console.log(
                    "Object.values(suppliersMap)",
                    Object.values(suppliersMap)
                );
                productId++;
            }
        }

        return Object.values(suppliersMap);
    }

    private async fetchProductSuppliers(productId: number) {
        return axios.get(`${this.baseUrl}/${productId}/supplier`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: this.tokenConnectPlug,
            },
        });
    }

    private delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
