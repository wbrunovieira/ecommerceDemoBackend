import { Injectable } from "@nestjs/common";
import axios from "axios";
import { z } from "zod";

const BASE_URL = process.env.BASE_URL;
const AUTH_URL = process.env.AUTH_URL;
const API_URL_PRODUCTS = process.env.API_URL_PRODUCTS;
const API_URL_CREATE_PRODUCT = process.env.API_URL_CREATE_PRODUCT;
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_CONNECTPLUG = process.env.TOKEN_CONNECTPLUG;

const createProductSchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(100, "Name must not exceed 100 characters"),
    description: z.string().optional(),
    images: z
        .array(z.string().url("Invalid URL format"))
        .nonempty("Images must not be empty"),

    brandId: z.string().uuid("Invalid UUID format"),
    sku: z.string().optional(),
    price: z.number().positive("Price must be positive"),
    stock: z.number().nonnegative("Stock must not be negative"),
    height: z.number().nonnegative("Height must not be negative"),
    width: z.number().nonnegative("Width must not be negative"),
    length: z.number().nonnegative("Length must not be negative"),
    weight: z.number().nonnegative("Weight must not be negative"),
    productColors: z
        .array(z.string().uuid("Invalid UUID format"))
        .nonempty("Product colors must not be empty"),
    productCategories: z
        .array(z.string().uuid("Invalid UUID format"))
        .nonempty("Product categories must not be empty"),
    productSizes: z
        .array(z.string().uuid("Invalid UUID format"))
        .nonempty("Product sizes must not be empty"),
    integrationKey: z.string(),
});

@Injectable()
export class SyncProductsUseCase {
    async authenticate() {
        try {
            if (!AUTH_URL) {
                return null;
            }
            const response = await axios.post(
                AUTH_URL,
                {
                    email: EMAIL,
                    password: PASSWORD,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data.access_token;
        } catch (error) {
            console.error("Authentication error:", error);
            throw new Error("Failed to authenticate");
        }
    }

    async fetchProducts(token: string) {
        try {
            if (!API_URL_PRODUCTS) {
                return null;
            }

            const response = await axios.get(API_URL_PRODUCTS, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const products = response.data.data.filter(
                (product: any) => !product.properties.deleted_at
            );

            for (const product of products) {
                const productData = {
                    name: product.properties.name,
                    description: product.properties.description || "",
                    images: [
                        product.properties.image ||
                            "http://localhost:3000/public/default-image.svg",
                    ],

                    brandId: "bdc60ff1-29fb-460e-b9ba-e340c694c463",
                    sku: product.properties.code || "",
                    price: product.properties.unitary_value,
                    stock: product.properties.flg_stock_control ? 1 : 0,
                    height: 10,
                    width: 10,
                    length: 10,
                    weight: product.properties.net_weight || 0.1,
                    productColors: ["247b00b5-0b96-4713-a17c-8d05cf89fead"],
                    productCategories: ["b745e76b-4cbb-48ee-b3db-a6f1610dd572"],
                    productSizes: ["f4051ddb-e807-4f8f-8f50-6f3f06d7795d"],
                    integrationKey: product.properties.integration_key,
                };

                try {
                    createProductSchema.parse(productData);
                    await this.createProductIfNotExist(productData, token);
                } catch (error) {
                    console.error("Validation or creation error:", error);
                }
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    async productExists(
        integrationKey: string,
        token: string
    ): Promise<boolean> {
        try {
            const response = await axios.get(`${BASE_URL}/products`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const products = response.data.data;

            return products.some(
                (product: any) => product.integrationKey === integrationKey
            );
        } catch (error) {
            console.error("Error checking product existence:", error);
            return false;
        }
    }

    async createProductIfNotExist(
        productData: {
            name: string;
            description?: string;
            images: string[];
            brandId: string;
            sku?: string;
            price: number;
            stock: number;
            height: number;
            width: number;
            length: number;
            weight: number;
            productColors: string[];
            productCategories: string[];
            productSizes: string[];
            integrationKey: string;
        },
        token: string
    ) {
        const { integrationKey } = productData;

        if (await this.productExists(integrationKey, token)) {
            return;
        }

        await this.createProduct(productData, token);
    }

    async createProduct(
        productData: {
            name: string;
            description?: string;
            images: string[];
            brandId: string;
            sku?: string;
            price: number;
            stock: number;
            height: number;
            width: number;
            length: number;
            weight: number;
            productColors: string[];
            productCategories: string[];
            productSizes: string[];
            integrationKey: string;
        },
        token: string
    ) {
        try {
            const response = await axios.post(
                `${BASE_URL}/products`,
                productData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.error("Error creating product:", error);
        }
    }

    async syncProducts() {
        try {
            const token = await this.authenticate();
            await this.fetchProducts(token);
        } catch (error) {
            console.error("Error in main execution:", error);
        }
    }
}
