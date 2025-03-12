import { InMemoryOrderRepository } from "@test/repositories/in-memory-order-repository";
import { FindOrderByIdUseCase } from "@/domain/order/application/use-cases/find-order-by-id";
import { Order } from "@/domain/order/enterprise/entities/order";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { OrderItem } from "@/domain/order/enterprise/entities/order-item";
import { OrderStatus } from "../../enterprise/entities/order-status";

describe("FindOrderByIdUseCase", () => {
    let findOrderByIdUseCase: FindOrderByIdUseCase;
    let mockOrderRepository: InMemoryOrderRepository;
    let orderId: string;
    let userId: string;

    beforeEach(() => {
        mockOrderRepository = new InMemoryOrderRepository();
        findOrderByIdUseCase = new FindOrderByIdUseCase(mockOrderRepository);
        orderId = "order_test_id";
        userId = "user_test_id";

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

    it("should return the correct order with all items", async () => {
        const result = await findOrderByIdUseCase.execute(orderId);

        expect(result.isRight()).toBeTruthy();

        if (result.isRight()) {
            const order = result.value;
            expect(order.id.toString()).toBe(orderId);
            expect(order.userId).toBe(userId);
            expect(order.items).toHaveLength(1);
            expect(order.items[0].productId).toBe("product_test_id");
            expect(order.items[0].productName).toBe("Test Product");
        }
    });

    it("should return an error if order is not found", async () => {
        const result = await findOrderByIdUseCase.execute(
            "non_existing_order_id"
        );

        expect(result.isLeft()).toBeTruthy();

        if (result.isLeft()) {
            const error = result.value;
            expect(error.message).toBe("Order not found");
        }
    });

    it("should return multiple items for an order", async () => {
        const secondOrderItem = OrderItem.create({
            orderId,
            productId: "second_product_test_id",
            productName: "Second Test Product",
            imageUrl: "second_test_image_url",
            quantity: 1,
            price: 200,
        });

        const existingOrder = mockOrderRepository.orders.find(
            (order) => order.id.toString() === orderId
        );
        if (existingOrder) {
            existingOrder.items.push(secondOrderItem);
        }

        const result = await findOrderByIdUseCase.execute(orderId);

        expect(result.isRight()).toBeTruthy();

        if (result.isRight()) {
            const order = result.value;
            expect(order.items).toHaveLength(2);
            expect(order.items[0].productId).toBe("product_test_id");
            expect(order.items[1].productId).toBe("second_product_test_id");
        }
    });
});
