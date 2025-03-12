import { Env } from "@/env/env";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import mercadopago from "mercadopago";

import * as crypto from "crypto";
import { PrismaCartRepository } from "@/infra/database/prisma/repositories/prisma-cart-repository";
import { PreferenceRequest } from "mercadopago/dist/clients/preference/commonTypes";
import { PrismaOrderRepository } from "@/infra/database/prisma/repositories/prisma-order-repository";
import { CreateOrderUseCase } from "./create-order";
import { OrderStatus } from "../../enterprise/entities/order-status";
import { FindCartByPreferenceIdUseCase } from "./find-cart-bt-preferenceId";
import {
    ArchiveCartRequest,
    ArchiveCartUseCase,
    mapCartToArchiveCartRequest,
} from "./archiveCart";
import { DeleteCartUseCase } from "./delete-cart";

interface Item {
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
    picture_url?: string;
    category_id?: string;
}

@Injectable()
export class MercadoPagoService {
    private secretKey: string;
    private readonly logger = new Logger(MercadoPagoService.name);
    private readonly client: MercadoPagoConfig;

    private preference: Preference;
    mercadopago: any;

    constructor(
        private configService: ConfigService<Env, true>,
        private archiveCartUseCase: ArchiveCartUseCase,
        private deleteCartUseCase: DeleteCartUseCase,
        private findCartByPreferenceId: FindCartByPreferenceIdUseCase,
        private orderUseCase: CreateOrderUseCase
    ) {
        const accessToken = configService.get<string>(
            "MERCADO_PAGO_ACCESS_TOKEN"
        );
        if (!accessToken) {
            throw new Error("MERCADO_PAGO_ACCESS_TOKEN is not defined");
        }

        this.client = new MercadoPagoConfig({
            accessToken,
            options: { timeout: 5000 },
        });

        this.preference = new Preference(this.client);

        this.secretKey = configService.get<string>(
            "MERCADO_PAGO_ASSINATURA_SECRETA_WEBHOOK"
        );
    }

    async createPreference(cartId: string, items: Item[]) {
        try {
            const preferenceData: PreferenceRequest = {
                items: items.map((item) => ({
                    id: item.id,
                    title: item.title,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    currency_id: item.currency_id || "BRL",
                    picture_url: item.picture_url,
                    category_id: item.category_id,
                    description: item.description,
                })),
                payment_methods: {
                    excluded_payment_methods: [{ id: "pec" }],
                    excluded_payment_types: [{ id: "debit_card" }],
                    installments: 3,
                },
                back_urls: {
                    success:
                        "https://wbstylosfrontend.sa.ngrok.io/pagamento-sucesso",
                    failure:
                        "https://wbstylosfrontend.sa.ngrok.io/pagamento-falhou",
                    pending:
                        "https://wbstylosfrontend.sa.ngrok.io/pagamento-pendente",
                },
                auto_return: "approved",
                external_reference: cartId,
                notification_url:
                    "https://wbstylosbackend.sa.ngrok.io/shipping/webhookpro",
            };

            const response = await this.preference.create({
                body: preferenceData,
            });

            console.log("Payment preference created successfully", response);

            const preferenceId = response.id;

            if (!preferenceId) {
                throw new Error("Failed to retrieve preference ID");
            }

            console.log("Payment preference preferenceId", preferenceId);

            const savedPreferenceId =
                await this.findCartByPreferenceId.savePreferenceId(
                    cartId,
                    preferenceId
                );

            console.log("savedPreferenceId", savedPreferenceId);
            console.log("payment response", response);

            const collectionId =
                response.collector_id ?? "default_collector_id";
            const merchantOrderId =
                response.additional_info ?? "default_order_id";

            console.log("payment merchantOrderId", merchantOrderId);
            console.log("payment collectionId", collectionId);

            // const savedCollection =
            // await this.findCartByPreferenceId.saveCollectionId(
            //     cartId,
            //     collectionId.toString(),
            //     response.additional_info,

            // );

            return response;
        } catch (error) {
            console.error("Error creating preference:", error);
            throw new Error("Error creating preference");
        }
    }

    async validateSignature(
        payload: any,
        xSignature: string,
        xRequestId: string
    ): Promise<boolean> {
        if (!this.secretKey) {
            throw new Error(
                "MERCADO_PAGO_SECRET_KEY is not set in environment variables"
            );
        }

        console.log("validateSignature entrou");

        const [tsPart, v1Part] = xSignature.split(",");

        if (!tsPart || !v1Part) {
            throw new HttpException(
                "Invalid signature format",
                HttpStatus.UNAUTHORIZED
            );
        }

        const ts = tsPart.split("=")[1];
        const v1 = v1Part.split("=")[1];

        const signatureTemplate = `id:${payload.data.id};request-id:${xRequestId};ts:${ts};`;

        const hash = crypto
            .createHmac("sha256", this.secretKey)
            .update(signatureTemplate)
            .digest("hex");

        console.log("Signature Template:", signatureTemplate);
        console.log("Calculated Hash:", hash);
        console.log("Provided Hash:", v1);
        console.log("this.secretKey", this.secretKey);

        console.log("Calculated Hash:", hash);

        if (hash !== v1) {
            throw new HttpException(
                "Invalid signature",
                HttpStatus.UNAUTHORIZED
            );
        }

        return true;
    }

    async processWebhookNotification(body: any, dataId: string, type: string) {
        console.log(
            "Processing webhook notification with dataId:",
            dataId,
            "and type:",
            type
        );
        const payment = new Payment(this.client);
        const paymentDetails = await payment.get({ id: dataId });
        console.log("payment processWebhookNotification", payment);
        console.log("payment processWebhookNotification", payment);

        const { external_reference, status } = paymentDetails;

        console.log("paymentDetails external_reference", external_reference);
        console.log("paymentDetails status", status);

        const cartId = external_reference;

        const action = type || body.action;
        console.log("paymentDetails status", status);

        const data = body.data || { id: dataId };
        console.log("dataaa", data);

        if (!action || !data.id) {
            console.error("Invalid webhook data:", body);
            throw new Error("Invalid webhook data");
        }

        const paymentId = data.id;
        const dateCreated = body.date_created;

        let cartResult = await this.findCartByPreferenceId.execute(cartId);

        console.log("processWebhookNotification cart", cartResult);
        console.log("processWebhookNotification cartId", cartId);

        if (!cartResult) {
            console.error(`Cart not found for payment ID: ${cartId}`);
            throw new Error("Cart not found for the given payment ID");
        }

        if (action === "payment.created") {
            const paymentId = data.id;
            console.log(
                `Processing payment created event for payment ID: ${paymentId}`
            );
        }

        if (cartResult.isRight()) {
            const cart = cartResult.value;

            if (status === "approved") {
                if (!cartId) {
                    throw new Error(
                        "Cart ID is missing. Cannot create order without cartId."
                    );
                }

                console.log("createOrderRequest before cartId", cartId);

                const createOrderRequest = {
                    userId: cart.userId,
                    cartId: cartId,
                    items: cart.items.map((item) => ({
                        productId: item.productId,
                        productName: item.productName,
                        imageUrl: item.imageUrl,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    status: OrderStatus.COMPLETED,
                    paymentId: paymentId,
                    paymentStatus: "APPROVED",
                    paymentMethod:
                        paymentDetails.payment_method_id || "unknown",
                    paymentDate: new Date(dateCreated),
                };
                console.log("createOrderRequest", createOrderRequest);

                const order =
                    await this.orderUseCase.execute(createOrderRequest);
                console.log("Order created successfully:", order);

                console.log("createOrderRequest cart", cart);

                const archivedCart = mapCartToArchiveCartRequest(cart);

                console.log("createOrderRequest archivedCart", archivedCart);

                const archiveCartRequest: ArchiveCartRequest = {
                    archivedCart: archivedCart,
                };

                console.log(
                    "createOrderRequest archiveCartRequest",
                    archiveCartRequest
                );

                const result =
                    this.archiveCartUseCase.execute(archiveCartRequest);

                console.log("archiveCartUseCase result:", result);
                console.log("archiveCartUseCase final cartId:", cartId);

                if (!cartId) {
                    console.error(`cartId not fn: ${cartId}`);
                    throw new Error("Cart not found for the given payment ID");
                }

                const deletedCart = this.deleteCartUseCase.execute({
                    cartId: cartId,
                });
                console.log("archiveCartUseCase deletedCart:", deletedCart);
            } else {
                console.log(
                    `Payment status (${status}) for payment ID: ${dataId}`
                );
            }
        } else {
            const error = cartResult.value;
            console.error(`Failed to find cart for ID ${cartId}:`, error);
            throw new HttpException(
                "Cart not found or another error occurred",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
