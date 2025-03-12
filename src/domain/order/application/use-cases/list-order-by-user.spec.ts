import { InMemoryOrderRepository } from "@test/repositories/in-memory-order-repository";

import { Order } from "@/domain/order/enterprise/entities/order";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { OrderItem } from "@/domain/order/enterprise/entities/order-item";
import { ListOrdersByUserUseCase } from "./list-order-by-user";
import { OrderStatus } from "../../enterprise/entities/order-status";

describe("ListOrdersByUserUseCase", () => {
    let listOrdersByUserUseCase: ListOrdersByUserUseCase;
    let mockOrderRepository: InMemoryOrderRepository;
    let userId: string;
    let orderId: string;

    beforeEach(() => {
        mockOrderRepository = new InMemoryOrderRepository();
        listOrdersByUserUseCase = new ListOrdersByUserUseCase(
            mockOrderRepository
        );
        userId = "user_test_id";
        orderId = "order_test_id";

        const orderItem = OrderItem.create({
            orderId,
            productId: "product_test_id",
            productName: "Test Product",
            imageUrl: "test_image_url",
            quantity: 2,
            price: 100,
        });

        const order = Order.create(
            {
                userId,
                items: [orderItem],
                status: OrderStatus.PENDING,
            },
            new UniqueEntityID(orderId)
        );

        mockOrderRepository.create(order);
    });

    it("should list all orders for a given user", async () => {
        const result = await listOrdersByUserUseCase.execute(userId);

        expect(result.isRight()).toBeTruthy();

        if (result.isRight()) {
            const orders = result.value;
            expect(orders).toHaveLength(1);
            expect(orders[0].userId).toBe(userId);
        }
    });

    it("should return an error if no orders found for the user", async () => {
        const result = await listOrdersByUserUseCase.execute(
            "non_existing_user_id"
        );

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            expect(error.message).toBe(
                "Orders not found for the given user id"
            );
        }
    });

    it("should return multiple orders for the same user", async () => {
        const secondOrderId = "second_order_test_id";

        const secondOrderItem = OrderItem.create({
            orderId: secondOrderId,
            productId: "second_product_test_id",
            productName: "Second Test Product",
            imageUrl: "second_test_image_url",
            quantity: 1,
            price: 200,
        });

        const secondOrder = Order.create(
            {
                userId,
                items: [secondOrderItem],
                status: OrderStatus.PENDING,
            },
            new UniqueEntityID(secondOrderId)
        );

        await mockOrderRepository.create(secondOrder);

        const result = await listOrdersByUserUseCase.execute(userId);

        expect(result.isRight()).toBeTruthy();

        if (result.isRight()) {
            const orders = result.value;
            expect(orders).toHaveLength(2);
            expect(orders[0].userId).toBe(userId);
            expect(orders[1].userId).toBe(userId);
        }
    });
});
