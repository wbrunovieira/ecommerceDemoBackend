import { Injectable } from "@nestjs/common";
import axios from "axios";
import { z } from "zod";

const BASE_URL = process.env.BASE_URL;
const AUTH_URL = process.env.AUTH_URL;
const API_URL_PRODUCT_ATTRIBUTE = process.env.API_URL_PRODUCT_ATTRIBUTE;
const API_URL_CREATE_SIZE = process.env.API_URL_CREATE_SIZE;
const API_URL_CREATE_COLOR = process.env.API_URL_CREATE_COLOR;
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_CONNECTPLUG = process.env.TOKEN_CONNECTPLUG;

const createSizeSchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(50, "Name must not exceed 50 characters"),
    erpId: z.string().optional(),
});

const createColorSchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(50, "Name must not exceed 50 characters"),
    hex: z
        .string()
        .min(4, "Hex code must not be empty")
        .max(7, "Hex code must not exceed 7 characters"),
    erpId: z.string().optional(),
});

@Injectable()
export class SyncAttributesUseCase {
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
            throw new Error("Failed to authenticate");
        }
    }

    async fetchAttributes(token: string) {
        try {
            if (!API_URL_PRODUCT_ATTRIBUTE) {
                return null;
            }

            const response = await axios.get(API_URL_PRODUCT_ATTRIBUTE, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `${TOKEN_CONNECTPLUG}`,
                },
            });

            const attributes = response.data.data.filter(
                (attribute: any) => !attribute.properties.deleted_at
            );

            for (const attribute of attributes) {
                if (this.isSize(attribute)) {
                    await this.syncSizeAttributes(attribute, token);
                } else if (this.isColor(attribute)) {
                    await this.syncColorAttributes(attribute, token);
                }
            }
        } catch (error) {
            console.error("Error fetching attributes:", error);
        }
    }

    isSize(attribute: { properties: { code: string } }): boolean {
        return attribute.properties.code === "TM";
    }

    isColor(attribute: { properties: { code: string } }): boolean {
        return attribute.properties.code === "CR";
    }

    normalizeString(str: string): string {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    async sizeExists(name: string, token: string): Promise<boolean> {
        try {
            const response = await axios.get(
                `${BASE_URL}/size/all?page=1&pageSize=10`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const sizes = response.data.data;

            const normalizedNewName = this.normalizeString(name);

            return sizes?.some(
                (size: any) =>
                    this.normalizeString(size.name) === normalizedNewName
            );
        } catch (error) {
            console.error("Error checking size existence:", error);
            return false;
        }
    }

    async colorExists(name: string, token: string): Promise<boolean> {
        try {
            const response = await axios.get(
                `${BASE_URL}/colors/all?page=1&pageSize=10`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const colors = response.data.data;
            const normalizedNewName = this.normalizeString(name);

            return colors?.some(
                (color: any) =>
                    this.normalizeString(color.name) === normalizedNewName
            );
        } catch (error) {
            console.error("Error checking color existence:", error);
            return false;
        }
    }

    async syncSizeAttributes(attribute: any, token: string) {
        const options = attribute.relationships.options.data;
        for (const option of options) {
            const { name } = option.properties;
            const { id } = option;
            if (await this.sizeExists(name, token)) {
                continue;
            }
            await this.createSize({ name, erpId: id.toString() }, token);
        }
    }

    async syncColorAttributes(attribute: any, token: string) {
        const options = attribute.relationships.options.data;
        for (const option of options) {
            const { name } = option.properties;
            const { id } = option;
            if (await this.colorExists(name, token)) {
                continue;
            }
            const colorData = this.getColorData(name, id);
            if (colorData) {
                await this.createColor(colorData, token);
            } else {
            }
        }
    }

    getColorData(
        name: string,
        id: number
    ): { name: string; hex: string; erpId: string } | null {
        const colors = {
            cereja: "#DE3163",
            azul: "#0000FF",
            branco: "#ffffff",
            cristal: "#E0FFFF",
            preto: "#000000",
            tango: "#F28500",
            blush: "#DE5D83",
            areia: "#C2B280",
            malva: "#993366",
            paprica: "#D94E1F",
            chocolate: "#7B3F00",
            ameixa: "#8E4585",
            hibisco: "#B43757",
        };

        const normalizedColorName = this.normalizeString(name);
        const hex = colors[normalizedColorName as keyof typeof colors];

        if (hex) {
            return { name, hex, erpId: id.toString() };
        }
        return null;
    }

    async createSize(sizeData: { name: string; erpId: string }, token: string) {
        try {
            const response = await axios.post(`${BASE_URL}/size`, sizeData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        } catch (error) {
            console.error("Error creating size:", error);
        }
    }

    async createColor(
        colorData: { name: string; hex: string; erpId: string },
        token: string
    ) {
        try {
            const response = await axios.post(`${BASE_URL}/colors`, colorData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        } catch (error) {
            console.error("Error creating color:", error);
        }
    }

    async syncAttributes() {
        try {
            const token = await this.authenticate();
            await this.fetchAttributes(token);
        } catch (error) {
            console.error("Error in main execution:", error);
        }
    }
}
