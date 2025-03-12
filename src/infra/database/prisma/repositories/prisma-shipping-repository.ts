import { Injectable } from "@nestjs/common";

import { Either, left, right } from "@/core/either";
import { PrismaService } from "@/prisma/prisma.service";
import {
    Shipping,
    ShippingStatus,
} from "@/domain/order/enterprise/entities/shipping";
import { IShippingRepository } from "@/domain/order/application/repositories/i-shipping-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

@Injectable()
export class ShippingRepository implements IShippingRepository {
    constructor(private prisma: PrismaService) {}

    async findByCartId(cartId: string): Promise<Shipping | null> {
        const shippingData = await this.prisma.shipping.findFirst({
            where: { cartId },
        });

        if (!shippingData) {
            return null;
        }

        return Shipping.create(
            {
                userId: shippingData.userId,
                cartId: shippingData.cartId,
                orderId: shippingData.orderId || undefined,
                name: shippingData.name,
                service: shippingData.service || undefined,
                trackingCode: shippingData.trackingCode || undefined,
                shippingCost: shippingData.shippingCost,
                deliveryTime: shippingData.deliveryTime,
                status: shippingData.status as ShippingStatus,
            },
            new UniqueEntityID(shippingData.id)
        );
    }

    async update(shipping: Shipping): Promise<Either<Error, void>> {
        try {
            await this.prisma.shipping.update({
                where: { id: shipping.id.toString() },
                data: {
                    userId: shipping.userId,
                    cartId: shipping.cartId,
                    orderId: shipping.orderId || null,
                    name: shipping.name,
                    service: shipping.service,
                    trackingCode: shipping.trackingCode || null,
                    shippingCost: shipping.shippingCost,
                    deliveryTime: shipping.deliveryTime,
                    status: shipping.status,
                },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to update shipping"));
        }
    }

    async create(shipping: Shipping): Promise<Either<Error, void>> {
        try {
            await this.prisma.shipping.create({
                data: {
                    id: shipping.id.toString(),
                    userId: shipping.userId,
                    cartId: shipping.cartId,
                    orderId: shipping.orderId || null,
                    name: shipping.name,
                    service: shipping.service,
                    trackingCode: shipping.trackingCode || null,
                    shippingCost: shipping.shippingCost,
                    deliveryTime: shipping.deliveryTime,
                    status: shipping.status,
                },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create shipping"));
        }
    }
}
