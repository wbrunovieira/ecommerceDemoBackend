import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { IOrderRepository } from "../repositories/i-order-repository";
import { Order } from "../../enterprise/entities/order";
import { OrderStatus } from "../../enterprise/entities/order-status";
import { Customer } from "@/domain/costumer/enterprise/entities/customer";
import { ICustomerRepository } from "@/domain/costumer/apllication/repositories/i-customer-repositor";
import { OrderItem } from "../../enterprise/entities/order-item";
import { IShippingRepository } from "../repositories/i-shipping-repository";

interface CreateOrderWithCustomerRequest {
    userId: string;
    cartId: string;
    items: Array<{
        productId: string;
        productName: string;
        imageUrl: string;
        quantity: number;
        price: number;
    }>;
    paymentId: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentDate: Date;
}

@Injectable()
export class CreateOrderUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private orderRepository: IOrderRepository,
        private shippingRepository: IShippingRepository
    ) {}

    async execute(
        request: CreateOrderWithCustomerRequest
    ): Promise<Either<Error, void>> {
        const existingCustomerResult =
            await this.customerRepository.findByUserId(request.userId);

        let customerId: string | null = null;

        if (existingCustomerResult.isRight() && existingCustomerResult.value) {
            customerId = existingCustomerResult.value.id.toString();
        } else {
            const newCustomer = Customer.create({
                userId: new UniqueEntityID(request.userId),
                firstOrderDate: request.paymentDate,
                customerSince: new Date(),
            });

            const customerCreationResult =
                await this.customerRepository.create(newCustomer);

            if (customerCreationResult.isLeft()) {
                return left(new Error("Failed to create customer"));
            }

            customerId = newCustomer.id.toString();
        }

        const orderItems = request.items.map((item) =>
            OrderItem.create({
                orderId: new UniqueEntityID().toString(),
                productId: new UniqueEntityID(item.productId).toString(),
                productName: item.productName,
                imageUrl: item.imageUrl,
                quantity: item.quantity,
                price: item.price,
            })
        );

        const order = Order.create({
            userId: request.userId,
            customerId: customerId,
            items: orderItems,
            status: OrderStatus.COMPLETED,
            paymentId: request.paymentId,
            paymentStatus: request.paymentStatus,
            paymentMethod: request.paymentMethod,
            paymentDate: request.paymentDate,
            cartId: request.cartId,
        });

        const orderCreationResult = await this.orderRepository.create(order);

        if (orderCreationResult.isLeft()) {
            return left(new Error("Failed to create order"));
        }

        const shippingfound = await this.shippingRepository.findByCartId(
            request.cartId
        );

        if (!shippingfound) {
            return left(new Error("Shipping not found for the given cart ID"));
        }

        console.log("shippingfound", shippingfound);

        shippingfound.orderId = order.id.toString();

        const updateShipmentResult =
            await this.shippingRepository.update(shippingfound);

        if (updateShipmentResult.isLeft()) {
            return left(new Error("Failed to update shipment with order ID"));
        }

        return right(undefined);
    }
}
