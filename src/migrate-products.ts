import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { Slug } from "./domain/catalog/enterprise/entities/value-objects/slug";
import * as fs from "fs/promises";
import { ProductStatus } from "./domain/catalog/enterprise/entities/product-status";
import { UniqueEntityID } from "./core/entities/unique-entity-id";
import { generateSlug } from "./domain/catalog/application/utils/generate-slug";

import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class ProductMigrationService {
    private readonly logger = new Logger(ProductMigrationService.name);
    private readonly token: string;
    private readonly baseUrl: string;

    constructor(
        private configService: ConfigService,
        private readonly prisma: PrismaService
    ) {
        const token = this.configService.get<string>("TOKEN_CONNECTPLUG");
        if (!token) {
            throw new InternalServerErrorException(
                "TOKEN_CONNECTPLUG is not defined"
            );
        }
        this.token = token;
        const baseUrl = this.configService.get<string>("BASE_URL");

        if (!baseUrl) {
            throw new InternalServerErrorException("BASE_URL is not defined");
        }
        this.baseUrl = baseUrl;
    }

    private calculateFinalPrice(price: number, discount?: number): number {
        if (discount && discount > 0) {
            return price - price * (discount / 100);
        }
        return price;
    }

    async getDefaultBrandId(): Promise<string> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/brands/name?name=BRAND`
            );

            if (
                response.data &&
                response.data.brand &&
                response.data.brand._id &&
                response.data.brand._id.value
            ) {
                return response.data.brand._id.value;
            } else {
                const newBrandResponse = await this.prisma.brand.create({
                    data: {
                        name: "BRAND",
                        imageUrl: "/images/brands/no-photos.svg",
                        erpId: "17",
                    },
                });
                return newBrandResponse.id;
            }
        } catch (error: any) {
            this.logger.error(
                `Error fetching or creating default brand: ${error.message}`
            );
            throw new InternalServerErrorException(
                "Error fetching or creating default brand"
            );
        }
    }

    async migrateProducts() {
        await this.prisma.onModuleInit();

        const path = require("path");
        const fs = require("fs").promises;

        const filePath = path.resolve(process.cwd(), "data", "products.json");
        console.log("Reading from file:", filePath);

        const data = await fs.readFile(filePath, "utf-8");
        const parsedData = JSON.parse(data);

        if (!Array.isArray(parsedData.products)) {
            throw new Error(
                "Invalid data format: 'products' should be an array."
            );
        }

        let brandId = await this.getDefaultBrandId();
        let supplierId = brandId;

        const products = parsedData.products;

        for (const product of products) {
            const productName = product.props?.name || "NameNotFound";
            const productStock = product.props.stock || 0;

            if (!productName) {
                this.logger.warn(
                    `Product with ID ${product._id.value} has no defined name. Skipping migration for this product.`
                );
                continue;
            }

            const productDescription =
                product.props.description || "DescriptionNotFound";
            const productPrice = product.props.price || "priceNotFound";

            let slug: Slug;

            if (productName) {
                slug = generateSlug(
                    productName,
                    brandId,
                    Date.now().toString()
                );
            } else {
                const uniqueSlug = `product-${Date.now()}`;
                slug = Slug.create(uniqueSlug);
                this.logger.warn(
                    `Product with ID ${product._id.value} has no defined name. Using unique slug: ${slug.value}`
                );
            }

            const images = (() => {
                if (!product.props.images) {
                    this.logger.warn(
                        `No images property for product ${productName} (erpId: ${product.props.erpId})`
                    );
                    return [
                        "http://localhost:3000/public/images/LogoStylos.svg",
                    ];
                }
                if (!Array.isArray(product.props.images)) {
                    this.logger.warn(
                        `Images is not an array for product ${productName} (erpId: ${product.props.erpId})`
                    );
                    return [
                        "http://localhost:3000/public/images/LogoStylos.svg",
                    ];
                }
                const processedImages = product.props.images
                    .map((image) => {
                        if (typeof image === "string") return image;
                        if (
                            image &&
                            typeof image === "object" &&
                            "url" in image
                        )
                            return image.url;
                        return null;
                    })
                    .filter((url) => url !== null && url !== undefined);

                if (processedImages.length === 0) {
                    this.logger.warn(
                        `No valid images found for product ${productName} (erpId: ${product.props.erpId})`
                    );
                    return [
                        "http://localhost:3000/public/images/LogoStylos.svg",
                    ];
                }
                return processedImages;
            })();

            const productColors: { id: string }[] = [];
            for (const color of product.props.productColors || []) {
                const erpIdAsString = String(color.id?.value);
                const realColor = await this.prisma.color.findFirst({
                    where: { erpId: erpIdAsString },
                });
                if (realColor) {
                    productColors.push({ id: realColor.id });
                } else {
                    this.logger.warn(
                        `Color with erpId ${color.id.value} not found.`
                    );
                }
            }

            const productSizes: { id: string }[] = [];
            for (const size of product.props?.productSizes || []) {
                const erpIdAsString = String(size.id?.value);
                const realSize = await this.prisma.size.findFirst({
                    where: { erpId: erpIdAsString },
                });
                if (realSize) {
                    productSizes.push({ id: realSize.id });
                } else {
                    this.logger.warn(
                        `Size with erpId ${size.id.value} not found.`
                    );
                }
            }

            const productCategories: { id: string }[] = [];
            const categoryErpId = product.categoryErpId;

            if (categoryErpId) {
                const realCategory = await this.prisma.category.findFirst({
                    where: { erpId: String(categoryErpId) },
                });
                if (realCategory) {
                    productCategories.push({ id: realCategory.id });
                } else {
                    this.logger.warn(
                        `Category with erpId ${categoryErpId} not found. Using default category.`
                    );
                }
            }

            try {
                const productIdString = String(product.props?.erpId);
                const supplierResponse = await axios.get(
                    `https://connectplug.com.br/api/v2/product/${productIdString}/supplier`,
                    {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: this.token,
                        },
                    }
                );

                if (
                    supplierResponse.data &&
                    supplierResponse.data.data.length > 0
                ) {
                    const supplierErpId = String(
                        supplierResponse.data.data[0].relationships.supplier
                            .data.id
                    );
                    const supplier = await this.prisma.brand.findFirst({
                        where: { erpId: supplierErpId },
                    });

                    if (supplier) {
                        supplierId = supplier.id;
                    }
                }
            } catch (error: any) {
                this.logger.warn(
                    `Error fetching supplier for product ${productName}: ${error.message}`
                );
            }

            const finalPrice = this.calculateFinalPrice(
                productPrice,
                product.props?.discount || 0
            );

            try {
                const createdProduct = await this.prisma.product.create({
                    data: {
                        name: productName,
                        description: productDescription,
                        sku: product.sku || "default-sku",
                        price: productPrice,
                        stock: product.props?.stock,
                        height: product.props?.height || 0,
                        brandId: supplierId || brandId,
                        erpId: String(product.props?.erpId),
                        slug: slug.value,
                        finalPrice,
                        width: product.props?.width || 0,
                        length: product.props?.length || 0,
                        weight: product.props?.weight || 0,
                        images: images,
                        status: ProductStatus.ACTIVE,
                        onSale: product.props.onSale || false,
                        discount: product.props.discount || 0,
                        isFeatured: product.props.isFeatured || false,
                        isNew: product.props.isNew || false,
                        productCategories: {
                            create: productCategories.map((category) => ({
                                category: {
                                    connect: { id: category.id },
                                },
                            })),
                        },
                    },
                    include: {
                        productCategories: true,
                    },
                });

                for (const color of productColors) {
                    await this.prisma.productColor.create({
                        data: {
                            productId: createdProduct.id,
                            colorId: color.id,
                        },
                    });
                }

                for (const size of productSizes) {
                    await this.prisma.productSize.create({
                        data: {
                            productId: createdProduct.id,
                            sizeId: size.id,
                        },
                    });
                }

                const variants: Array<{
                    id: string;
                    productId: string;
                    sizeId?: string;
                    colorId?: string;
                    stock: number;
                    sku: string;
                    createdAt: Date;
                    updatedAt: Date;
                    price: number;
                    status: ProductStatus;
                    images: string[];
                }> = [];

                for (const category of productCategories) {
                    const exists = await this.prisma.productCategory.findFirst({
                        where: {
                            productId: createdProduct.id,
                            categoryId: category.id,
                        },
                    });
                    if (!exists) {
                        await this.prisma.productCategory.create({
                            data: {
                                productId: createdProduct.id,
                                categoryId: category.id,
                            },
                        });
                    }
                }

                if (productSizes.length > 0 && productColors.length > 0) {
                    for (const size of productSizes) {
                        for (const color of productColors) {
                            variants.push({
                                id: new UniqueEntityID().toString(),
                                productId: createdProduct.id,
                                sizeId: size.id,
                                colorId: color.id,
                                stock: productStock,
                                sku: product.sku || "",
                                price: productPrice,
                                status: ProductStatus.ACTIVE,
                                images,
                                createdAt: new Date(Date.now()),
                                updatedAt: new Date(Date.now()),
                            });
                        }
                    }
                } else if (productSizes.length > 0) {
                    for (const size of productSizes) {
                        variants.push({
                            id: new UniqueEntityID().toString(),
                            productId: createdProduct.id,
                            sizeId: size.id,
                            stock: productStock,
                            sku: product.sku || "",
                            price: productPrice,
                            status: ProductStatus.ACTIVE,
                            images,
                            createdAt: new Date(Date.now()),
                            updatedAt: new Date(Date.now()),
                        });
                    }
                } else if (productColors.length > 0) {
                    for (const color of productColors) {
                        variants.push({
                            id: new UniqueEntityID().toString(),
                            productId: createdProduct.id,
                            colorId: color.id,
                            sku: product.sku || "",
                            stock: productStock,
                            price: productPrice,
                            status: ProductStatus.ACTIVE,
                            images,
                            createdAt: new Date(Date.now()),
                            updatedAt: new Date(Date.now()),
                        });
                    }
                }

                if (variants.length > 0) {
                    await this.prisma.product.update({
                        where: { id: createdProduct.id },
                        data: {
                            hasVariants: true,
                            productIdVariant: createdProduct.id,
                        },
                    });

                    await this.prisma.productVariant.createMany({
                        data: variants,
                    });
                }

                this.logger.log(
                    `Product ${productName} migrated successfully.`
                );
            } catch (error) {
                this.logger.error(
                    `Error migrating product ${productName}:`,
                    error
                );
            }
        }

        await this.prisma.onModuleDestroy();
    }
}
