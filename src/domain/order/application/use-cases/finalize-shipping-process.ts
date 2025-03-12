import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PurchaseLabelsUseCase } from "./purchase-labels";

interface FinalizeShippingProcessRequest {
    cartId: string;
    orders: string[];
    accessToken: string;
}

@Injectable()
export class FinalizeShippingProcessUseCase {
    constructor(
        private readonly purchaseLabelsUseCase: PurchaseLabelsUseCase
    ) {}

    async execute({
        cartId,
        orders,
        accessToken,
    }: FinalizeShippingProcessRequest): Promise<void> {
        try {
            // Passo 1: Realizar a compra das etiquetas de envio
            const purchaseResponse = await this.purchaseLabelsUseCase.execute({
                orders,
                accessToken,
            });

            if (!purchaseResponse.success) {
                throw new HttpException(
                    "Failed to finalize shipping process",
                    HttpStatus.BAD_REQUEST
                );
            }

            // Passo 3: Confirmar o processo de envio (pode incluir atualizações no status do pedido)
            console.log(
                "Shipping process finalized successfully for cart:",
                cartId
            );
        } catch (error) {
            console.error("Error finalizing shipping process:", error);
            throw new HttpException(
                "Error finalizing shipping process",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
