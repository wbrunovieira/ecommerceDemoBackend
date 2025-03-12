import { FindOrdersByBrandUseCase } from "@/domain/order/application/use-cases/find-all-orders-by-brand";
import { FindOrdersByCategoryUseCase } from "@/domain/order/application/use-cases/find-all-orders-by-categories";
import { FindOrdersByProductUseCase } from "@/domain/order/application/use-cases/find-all-orders-by-products";
import { FindOrderByIdUseCase } from "@/domain/order/application/use-cases/find-order-by-id";
import { FindTopSellingBrandsByTotalValueUseCase } from "@/domain/order/application/use-cases/find-top-brands-selling";
import { FindTopSellingCategoriesByTotalValueUseCase } from "@/domain/order/application/use-cases/find-top-categories-selling-by-values";
import { FindTopSellingProductsByTotalValueUseCase } from "@/domain/order/application/use-cases/find-top-selling-product-by-value";
import { ListAllOrdersUseCase } from "@/domain/order/application/use-cases/get-all-orders";
import { ListOrdersByUserUseCase } from "@/domain/order/application/use-cases/list-order-by-user";
import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
} from "@nestjs/common";

@Controller("orders")
export class OrderController {
    constructor(
        private readonly listAllOrdersUseCase: ListAllOrdersUseCase,
        private readonly listOrdersByUserUseCase: ListOrdersByUserUseCase,
        private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
        private readonly findOrdersByProductUseCase: FindOrdersByProductUseCase,
        private readonly findOrdersByCategoryUseCase: FindOrdersByCategoryUseCase,
        private readonly findOrdersByBrandUseCase: FindOrdersByBrandUseCase,
        private readonly findTopSellingBrandsByTotalValueUseCase: FindTopSellingBrandsByTotalValueUseCase,
        private readonly findTopSellingCategoriesByTotalValueUseCase: FindTopSellingCategoriesByTotalValueUseCase,
        private readonly findTopSellingProductsByTotalValueUseCase: FindTopSellingProductsByTotalValueUseCase
    ) {}

    @Get("top-selling-products-by-value")
    async findTopSellingProductsByTotalValue() {
        try {
            const result =
                await this.findTopSellingProductsByTotalValueUseCase.execute();

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.NOT_FOUND
                );
            }

            return result.value;
        } catch (error) {
            console.error(
                "Error fetching top selling products by total value:",
                error
            );
            throw new HttpException(
                "Failed to fetch top selling products by total value",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("top-selling-categories-by-value")
    async findTopSellingCategoriesByTotalValue() {
        try {
            const result =
                await this.findTopSellingCategoriesByTotalValueUseCase.execute();

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.NOT_FOUND
                );
            }

            return result.value;
        } catch (error) {
            console.error(
                "Error fetching top selling categories by total value:",
                error
            );
            throw new HttpException(
                "Failed to fetch top selling categories by total value",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("top-selling-brands-by-value")
    async findTopSellingBrandsByTotalValue() {
        try {
            const result =
                await this.findTopSellingBrandsByTotalValueUseCase.execute();

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.NOT_FOUND
                );
            }

            return result.value;
        } catch (error) {
            console.error(
                "Error fetching top selling brands by total value:",
                error
            );
            throw new HttpException(
                "Failed to fetch top selling brands by total value",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("brand/:brandId")
    async findOrdersByBrand(@Param("brandId") brandId: string) {
        try {
            const result = await this.findOrdersByBrandUseCase.execute(brandId);

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.NOT_FOUND
                );
            }

            return result.value;
        } catch (error) {
            console.error("Error finding orders by brand:", error);
            throw new HttpException(
                "Failed to find orders by brand",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("category/:categoryId")
    async findOrdersByCategory(@Param("categoryId") categoryId: string) {
        try {
            const result =
                await this.findOrdersByCategoryUseCase.execute(categoryId);

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.NOT_FOUND
                );
            }

            return result.value;
        } catch (error) {
            console.error("Error finding orders by category:", error);
            throw new HttpException(
                "Failed to find orders by category",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("product/:productId")
    async findOrdersByProduct(@Param("productId") productId: string) {
        try {
            const result =
                await this.findOrdersByProductUseCase.execute(productId);

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return result.value;
        } catch (error) {
            console.error("Error finding orders by product:", error);
            throw new HttpException(
                "Failed to find orders by product",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("all")
    async listAllOrders() {
        try {
            const result = await this.listAllOrdersUseCase.execute();

            console.log("listAllOrders result", result);

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return result.value;
        } catch (error) {
            console.error("Error listing all orders:", error);
            throw new HttpException(
                "Failed to list orders",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("user/:userId")
    async listOrdersByUser(@Param("userId") userId: string) {
        try {
            const result = await this.listOrdersByUserUseCase.execute(userId);

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return result.value;
        } catch (error) {
            console.error("Error listing orders by user:", error);
            throw new HttpException(
                "Failed to list orders for user",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("order/:orderId")
    async findOrderById(@Param("orderId") orderId: string) {
        try {
            const result = await this.findOrderByIdUseCase.execute(orderId);

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.NOT_FOUND
                );
            }

            return result.value;
        } catch (error) {
            console.error("Error finding order by id:", error);
            throw new HttpException(
                "Failed to find order",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
