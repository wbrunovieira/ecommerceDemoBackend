import { Injectable } from "@nestjs/common";
import axios from "axios";
import { z } from "zod";

const BASE_URL = process.env.BASE_URL;
const AUTH_URL = process.env.AUTH_URL;
const API_URL_CREATE_CATEGORY = process.env.API_URL_CREATE_CATEGORY;
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_CONNECTPLUG = process.env.TOKEN_CONNECTPLUG;
const baseImageUrl = process.env.BASE_IMAGE_URL;
//const baseImageUrl = "http://localhost:3000/public/";

const createCategorySchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(20, "Name must not exceed 20 characters"),
    imageUrl: z
        .string()
        .url("Invalid URL format")
        .nonempty("Image URL must not be empty"),
    erpId: z.string().optional(),
});

const categoryImages = {
    8: `${baseImageUrl}/icons/acessorios.svg`,
    11: `${baseImageUrl}/icons/ballet-shoes.svg`,
    10: `${baseImageUrl}/icons/ballet-shoes.svg`,
    43: `${baseImageUrl}/icons/bikini.svg`,
    52: `${baseImageUrl}/icons/bodysuit.svg`,
    25: `${baseImageUrl}/icons/bag-mini.svg`,
    26: `${baseImageUrl}/icons/scarf.svg`,
    53: `${baseImageUrl}/icons/underwear.svg`,
    46: `${baseImageUrl}/icons/camisole.svg`,
    33: `${baseImageUrl}/icons/nightie.svg`,
    34: `${baseImageUrl}/icons/pamela-hat.svg`,
    35: `${baseImageUrl}/icons/flip-flops.svg`,
    38: `${baseImageUrl}/icons/flip-flops.svg`,
    56: `${baseImageUrl}/icons/windbreaker.svg`,
    49: `${baseImageUrl}/icons/sex-lube.svg`,
    13: `${baseImageUrl}/icons/skincare.svg`,
    15: `${baseImageUrl}/icons/skincare.svg`,
    19: `${baseImageUrl}/icons/skincare.svg`,
    17: `${baseImageUrl}/icons/skincare.svg`,
    31: `${baseImageUrl}/icons/boy.svg`,
    5: `${baseImageUrl}/icons/package.svg`,
    50: `${baseImageUrl}/icons/mask.svg`,
    23: `${baseImageUrl}/icons/extended.svg`,
    18: `${baseImageUrl}/icons/extended.svg`,
    41: `${baseImageUrl}/icons/pregnant-woman.svg`,
    37: `${baseImageUrl}/icons/hydrated-skin.svg`,
    27: `${baseImageUrl}/icons/scarf (1).svg`,
    9: `${baseImageUrl}/icons/lingeries.svg`,
    32: `${baseImageUrl}/icons/love.svg`,
    44: `${baseImageUrl}/icons/swimsuit.svg`,
    20: `${baseImageUrl}/icons/socks.svg`,
    21: `${baseImageUrl}/icons/woman (1).svg`,
    39: `${baseImageUrl}/icons/sport.svg`,
    28: `${baseImageUrl}/icons/glasses-mini.svg`,
    29: `${baseImageUrl}/icons/bag.svg`,
    30: `${baseImageUrl}/icons/glasses-mini.svg`,
    51: `${baseImageUrl}/icons/dry-skin.svg`,
    16: `${baseImageUrl}/icons/perfume-mini.svg`,
    22: `${baseImageUrl}/icons/dry-skin.svg`,
    48: `${baseImageUrl}/icons/robe.svg`,
    45: `${baseImageUrl}/icons/manwear.svg`,
    55: `${baseImageUrl}/icons/ballet-shoes.svg`,
    40: `${baseImageUrl}/icons/robe.svg`,
    57: `${baseImageUrl}/icons/underware.svg`,
    12: `${baseImageUrl}/icons/bikini.svg`,
    47: `${baseImageUrl}/icons/nightie.svg`,
};

const defaultImage = `${baseImageUrl}no-photos.svg`;

@Injectable()
export class SyncCategoriesUseCase {
    async authenticate() {
        try {
            if (!AUTH_URL || !BASE_URL || !API_URL_CREATE_CATEGORY) {
                throw new Error("Required environment variables are missing");
            }

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

            const token = response.data.access_token;

            return response.data.access_token;
        } catch (error) {
            console.error("Authentication error:", error);
            throw new Error("Failed to authenticate");
        }
    }

    async fetchCategories(token: string) {
        try {
            if (!API_URL_CREATE_CATEGORY) {
                throw new Error("API_URL_CREATE_CATEGORY is not defined");
            }

            const response = await axios.get(API_URL_CREATE_CATEGORY, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `${TOKEN_CONNECTPLUG}`,
                },
            });

            console.log("fetchCategories response", response);

            const categories = response.data.data.filter(
                (category: any) => !category.properties.deleted_at
            );

            return categories;
        } catch (error: any) {
            console.error("Error fetching categories:", error.message);
            throw new Error("Failed to fetch categories");
        }
    }

    normalizeString(str: string): string {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    async categoryExists(
        name: string,
        erpId: string,
        token: string
    ): Promise<boolean> {
        try {
            const response = await axios.get(`${BASE_URL}/category`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const categories = response.data.data;
            const normalizedNewName = this.normalizeString(name);

            return categories.some(
                (category: any) =>
                    category.erpId === erpId ||
                    this.normalizeString(category.name) === normalizedNewName
            );
        } catch (error) {
            console.error("Error checking category existence:", error);
            return false;
        }
    }

    async createCategoryIfNotExist(
        categoryData: { name: string; imageUrl: string; erpId?: string },
        token: string
    ) {
        const { name, erpId } = categoryData;

        if (await this.categoryExists(name, erpId ?? "", token)) {
            return;
        }

        await this.createCategory(categoryData, token);
    }

    async createCategory(
        categoryData: { name: string; imageUrl: string; erpId?: string },
        token: string
    ) {
        try {
            const response = await axios.post(
                `${BASE_URL}/category`,
                categoryData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(`link: ${BASE_URL}/category`);
            console.log("createCategory responsea", response);
            console.log("createCategory categoryDataa", categoryData);
        } catch (error) {
            console.error("Error creating category:", error);
        }
    }

    async syncCategories() {
        try {
            const token = await this.authenticate();
            const categories = await this.fetchCategories(token);
            console.log(" syncedCategories", categories);

            for (const category of categories) {
                const imageUrl = categoryImages[category.id] || defaultImage;
                const erpId = String(category.id);

                const categoryData = {
                    name: category.properties.name,
                    imageUrl,
                    erpId,
                };
                console.log("Creating category:", categoryData);
                try {
                    await this.createCategoryIfNotExist(categoryData, token);
                } catch (error: any) {
                    console.error(
                        `Error creating category ${categoryData.name}:`,
                        error.message
                    );
                }
            }

            return categories;
        } catch (error) {
            console.error("Error in main execution:", error);
            throw error;
        }
    }
}
