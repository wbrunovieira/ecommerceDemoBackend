import { OrderStatus as PrismaOrderStatus } from "@prisma/client";

export enum OrderStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
}

export function mapPrismaOrderStatusToDomain(
    status: PrismaOrderStatus
): OrderStatus {
    switch (status) {
        case PrismaOrderStatus.PENDING:
            return OrderStatus.PENDING;
        case PrismaOrderStatus.COMPLETED:
            return OrderStatus.COMPLETED;
        case PrismaOrderStatus.CANCELLED:
            return OrderStatus.CANCELLED;
        default:
            throw new Error(`Unknown order status: ${status}`);
    }
}
