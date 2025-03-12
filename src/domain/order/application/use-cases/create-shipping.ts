import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { Shipping, ShippingStatus } from "../../enterprise/entities/shipping";
import { IShippingRepository } from "../repositories/i-shipping-repository";

interface SaveShippingUseCaseRequest {
    userId: string;
    name: string;
    orderId?: string;
    cartId: string;
    service?: string;
    trackingCode?: string;
    shippingCost: number;
    deliveryTime: number;
}

type SaveShippingUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        shipping: Shipping;
    }
>;

@Injectable()
export class SaveShippingUseCase {
    constructor(private shippingRepository: IShippingRepository) {}

    async execute({
        userId,
        cartId,
        name,
        orderId,
        service,
        trackingCode,
        shippingCost,
        deliveryTime,
    }: SaveShippingUseCaseRequest): Promise<SaveShippingUseCaseResponse> {
        try {
            const existingShipping =
                await this.shippingRepository.findByCartId(cartId);

            if (existingShipping) {
                existingShipping.update({
                    userId,
                    name,
                    orderId,
                    service,
                    trackingCode,
                    shippingCost,
                    deliveryTime,
                    status: ShippingStatus.PENDING,
                });

                const updateResult =
                    await this.shippingRepository.update(existingShipping);

                if (updateResult.isLeft()) {
                    throw new Error(updateResult.value.message);
                }

                return right({ shipping: existingShipping });
            } else {
                const newShipping = Shipping.create({
                    userId,
                    name,
                    orderId,
                    cartId,
                    service,
                    trackingCode,
                    shippingCost,
                    deliveryTime,
                    status: ShippingStatus.PENDING,
                });

                const createResult =
                    await this.shippingRepository.create(newShipping);

                if (createResult.isLeft()) {
                    throw new Error(createResult.value.message);
                }

                return right({ shipping: newShipping });
            }
        } catch (error) {
            return left(new Error("Failed to save or update shipping option"));
        }
    }
}
