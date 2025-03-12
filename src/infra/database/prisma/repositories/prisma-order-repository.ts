import { Either, left, right } from "@/core/either";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import {
    Order,
    OrderDTO,
} from "@/domain/order/enterprise/entities/order";

import { IOrderRepository } from "@/domain/order/application/repositories/i-order-repository";
import {
    OrderStatus,
    mapPrismaOrderStatusToDomain,
} from "@/domain/order/enterprise/entities/order-status";
import { OrderItem } from "@/domain/order/enterprise/entities/order-item";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
    constructor(private prisma: PrismaService) {}

    private convertOrderStatus(status: any): OrderStatus {
        switch (status) {
            case "PENDING":
                return OrderStatus.PENDING;
            case "COMPLETED":
                return OrderStatus.COMPLETED;
            case "CANCELLED":
                return OrderStatus.CANCELLED;
            default:
                throw new Error(`Unknown order status: ${status}`);
        }
    }

    async findTopSellingProductsByTotalValue(): Promise<Either<Error, any>> {
        try {
            const orderItems = await this.prisma.orderItem.findMany({
                include: {
                    product: true,
                },
            });

            const productSales = {};

            orderItems.forEach((item) => {
                if (item.product) {
                    const productId = item.product.id;
                    const productName = item.product.name;
                    const totalValue = item.price * item.quantity;

                    if (!productSales[productId]) {
                        productSales[productId] = {
                            productId,
                            productName,
                            totalValue: 0,
                        };
                    }

                    productSales[productId].totalValue += totalValue;
                }
            });

            const topProducts = Object.values(productSales).sort(
                (a: any, b: any) => b.totalValue - a.totalValue
            );

            return right(topProducts.slice(0, 10));
        } catch (error) {
            console.error(
                "Error fetching top selling products by total value:",
                error
            );
            return left(
                new Error("Failed to fetch top selling products by total value")
            );
        }
    }

    async findTopSellingCategoriesByTotalValue(): Promise<Either<Error, any>> {
        try {
            const orderItems = await this.prisma.orderItem.findMany({
                include: {
                    product: {
                        include: {
                            productCategories: {
                                include: {
                                    category: true,
                                },
                            },
                        },
                    },
                },
            });

            const categorySales = {};

            orderItems.forEach((item) => {
                if (item.product && item.product.productCategories.length > 0) {
                    item.product.productCategories.forEach(
                        (productCategory) => {
                            const categoryId = productCategory.category.id;
                            const categoryName = productCategory.category.name;
                            const totalValue = item.price * item.quantity;

                            if (!categorySales[categoryId]) {
                                categorySales[categoryId] = {
                                    categoryId,
                                    categoryName,
                                    totalValue: 0,
                                };
                            }

                            categorySales[categoryId].totalValue += totalValue;
                        }
                    );
                }
            });

            const topCategories = Object.values(categorySales).sort(
                (a: any, b: any) => b.totalValue - a.totalValue
            );

            return right(topCategories.slice(0, 10));
        } catch (error) {
            console.error(
                "Error fetching top selling categories by total value:",
                error
            );
            return left(
                new Error(
                    "Failed to fetch top selling categories by total value"
                )
            );
        }
    }

    async findTopSellingBrandsByTotalValue(): Promise<Either<Error, any>> {
        try {
            const orderItems = await this.prisma.orderItem.findMany({
                include: {
                    product: {
                        include: {
                            brand: true,
                        },
                    },
                },
            });

            const brandSales = {};

            orderItems.forEach((item) => {
                if (item.product && item.product.brand) {
                    const brandId = item.product.brand.id;
                    const brandName = item.product.brand.name;
                    const totalValue = item.price * item.quantity;

                    if (!brandSales[brandId]) {
                        brandSales[brandId] = {
                            brandId,
                            brandName,
                            totalValue: 0,
                        };
                    }

                    brandSales[brandId].totalValue += totalValue;
                }
            });

            const topBrands = Object.values(brandSales).sort(
                (a: any, b: any) => b.totalValue - a.totalValue
            );

            return right(topBrands.slice(0, 10));
        } catch (error) {
            console.error(
                "Error fetching top selling brands by total value:",
                error
            );
            return left(
                new Error("Failed to fetch top selling brands by total value")
            );
        }
    }

    async findOrdersByBrand(brandId: string): Promise<Either<Error, Order[]>> {
        try {
            const orders = await this.prisma.order.findMany({
                where: {
                    items: {
                        some: {
                            product: {
                                brandId: brandId,
                            },
                        },
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            const orderEntities = orders.map((order) =>
                Order.create(
                    {
                        userId: order.userId,
                        items: order.items.map((item) =>
                            OrderItem.create({
                                orderId: item.orderId,
                                productId: item.product.id,
                                productName: item.product.name,
                                imageUrl: item.product.images[0] || "",
                                quantity: item.quantity,
                                price: item.price,
                            })
                        ),
                        status: mapPrismaOrderStatusToDomain(order.status),
                        paymentId: order.paymentId || undefined,
                        paymentStatus: order.paymentStatus || undefined,
                        paymentMethod: order.paymentMethod || undefined,
                        paymentDate: order.paymentDate || undefined,
                    },
                    new UniqueEntityID(order.id)
                )
            );

            return right(orderEntities);
        } catch (error) {
            console.error("Error finding orders by brand:", error);
            return left(new Error("Failed to find orders by brand"));
        }
    }

    async findOrdersByCategory(
        categoryId: string
    ): Promise<Either<Error, Order[]>> {
        try {
            const orders = await this.prisma.order.findMany({
                where: {
                    items: {
                        some: {
                            product: {
                                productCategories: {
                                    some: { categoryId: categoryId },
                                },
                            },
                        },
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            // Mapeia os resultados do Prisma para entidades Order
            const orderEntities = orders.map((order) =>
                Order.create(
                    {
                        userId: order.userId,
                        items: order.items.map((item) =>
                            OrderItem.create({
                                orderId: item.orderId,
                                productId: item.product.id,
                                productName: item.product.name,
                                imageUrl: item.product.images[0] || "",
                                quantity: item.quantity,
                                price: item.price,
                            })
                        ),
                        status: mapPrismaOrderStatusToDomain(order.status),
                        paymentId: order.paymentId || undefined,
                        paymentStatus: order.paymentStatus || undefined,
                        paymentMethod: order.paymentMethod || undefined,
                        paymentDate: order.paymentDate || undefined,
                    },
                    new UniqueEntityID(order.id)
                )
            );

            return right(orderEntities);
        } catch (error) {
            console.error("Error finding orders by category:", error);
            return left(new Error("Failed to find orders by category"));
        }
    }

    async findOrdersByProduct(
        productId: string
    ): Promise<Either<Error, Order[]>> {
        try {
            const orders = await this.prisma.order.findMany({
                where: {
                    items: {
                        some: { productId: productId },
                    },
                },
                include: {
                    items: true,
                },
            });

            const orderEntities = orders.map((order) =>
                Order.create(
                    {
                        userId: order.userId,
                        items: order.items.map((item) =>
                            OrderItem.create({
                                orderId: item.orderId,
                                productId: item.productId,
                                productName: item.productName,
                                imageUrl: item.imageUrl,
                                quantity: item.quantity,
                                price: item.price,
                            })
                        ),
                        status: mapPrismaOrderStatusToDomain(order.status),
                        paymentId: order.paymentId || undefined,
                        paymentStatus: order.paymentStatus || undefined,
                        paymentMethod: order.paymentMethod || undefined,
                        paymentDate: order.paymentDate || undefined,
                    },
                    new UniqueEntityID(order.id)
                )
            );

            return right(orderEntities);
        } catch (error) {
            console.error("Error finding orders by product:", error);
            return left(new Error("Failed to find orders by product"));
        }
    }

    async findOrderById(orderId: string): Promise<Either<Error, Order>> {
        try {
            const order = await this.prisma.order.findUnique({
                where: {
                    id: orderId,
                },
                include: {
                    items: true,
                },
            });

            if (!order) {
                return left(new Error("Order not found"));
            }

            const orderEntity = Order.create(
                {
                    userId: order.userId,
                    items: order.items.map((item) =>
                        OrderItem.create({
                            orderId: item.orderId,
                            productId: item.productId,
                            productName: item.productName,
                            imageUrl: item.imageUrl,
                            quantity: item.quantity,
                            price: item.price,
                        })
                    ),
                    status: order.status as OrderStatus,
                    paymentId: order.paymentId || undefined,
                    paymentStatus: order.paymentStatus || undefined,
                    paymentMethod: order.paymentMethod || undefined,
                    paymentDate: order.paymentDate || undefined,
                },
                new UniqueEntityID(order.id)
            );

            return right(orderEntity);
        } catch (error) {
            return left(new Error("Failed to find order"));
        }
    }

    async create(order: Order): Promise<Either<Error, void>> {
        try {
            const orderData = order.toObject();

            const customer = await this.prisma.customer.findUnique({
                where: { userId: orderData.userId },
            });

            if (!customer) {
                return left(new Error("Customer not found"));
            }

            const createdOrder = await this.prisma.order.create({
                data: {
                    id: orderData.id.toString(),
                    userId: orderData.userId,
                    customerId: customer.id,
                    status: orderData.status as OrderStatus,
                    paymentId: orderData.paymentId,
                    paymentStatus: orderData.paymentStatus,
                    paymentMethod: orderData.paymentMethod,
                    paymentDate: orderData.paymentDate,
                    cartId: order.cartId,
                    items: {
                        create: orderData.items.map((item) => ({
                            id: item.id?.toString(),
                            productId: item.productId.toString(),
                            productName: item.productName,
                            imageUrl: item.imageUrl,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create order"));
        }
    }

    async listAllOrders(): Promise<Either<Error, OrderDTO[]>> {
        try {
            const orders = await this.prisma.order.findMany({
                include: {
                    items: true,
                    user: true,
                },
            });

            const orderDTOs = orders.map((order) => ({
                id: order.id,
                userId: order.userId,
                userName: order.user.name,
                cartId: order.cartId ?? undefined,
                customerId: order.customerId ?? undefined,
                items: order.items.map((item) => ({
                    orderId: item.orderId,
                    productId: item.productId,
                    productName: item.productName,
                    imageUrl: item.imageUrl,
                    quantity: item.quantity,
                    price: item.price,
                })),
                status: this.convertOrderStatus(order.status),
                paymentId: order.paymentId || undefined,
                paymentStatus: order.paymentStatus || undefined,
                paymentMethod: order.paymentMethod || undefined,
                paymentDate: order.paymentDate || undefined,
            }));

            return right(orderDTOs);
        } catch (error) {
            return left(new Error("Failed to list orders"));
        }
    }

    async listOrdersByUserId(userId: string): Promise<Either<Error, Order[]>> {
        try {
            const orders = await this.prisma.order.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    items: true,
                },
            });

            const orderEntities = orders.map((order) =>
                Order.create(
                    {
                        userId: order.userId,
                        items: order.items.map((item) =>
                            OrderItem.create({
                                orderId: item.orderId,
                                productId: item.productId,
                                productName: item.productName,
                                imageUrl: item.imageUrl,
                                quantity: item.quantity,
                                price: item.price,
                            })
                        ),
                        status: OrderStatus.PENDING,
                        paymentId: order.paymentId || undefined,
                        paymentStatus: order.paymentStatus || undefined,
                        paymentMethod: order.paymentMethod || undefined,
                        paymentDate: order.paymentDate || undefined,
                    },
                    new UniqueEntityID(order.id)
                )
            );

            return right(orderEntities);
        } catch (error) {
            return left(new Error("Failed to list orders for user"));
        }
    }
}
