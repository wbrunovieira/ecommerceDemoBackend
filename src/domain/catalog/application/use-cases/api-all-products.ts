import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import * as fs from "fs/promises";
import * as path from "path";
import { ConfigService } from "@nestjs/config";
import { Product, ProductProps } from "../../enterprise/entities/product";
import { Slug } from "../../enterprise/entities/value-objects/slug";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ProductVariantProps } from "../../enterprise/entities/product-variant";
import { ProductStatus } from "../../enterprise/entities/product-status";

@Injectable()
export class ApiGetAllProducts {
    private readonly apiUrl: string;
    private readonly stockApiUrl: string;
    private readonly categoriesApiUrl: string;
    private readonly colorsApiUrl: string;
    private readonly sizesApiUrl: string;

    private readonly token: string;

    private readonly startPage = 1;

    constructor(private configService: ConfigService) {
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

        this.apiUrl = `https://connectplug.com.br/api/v2/product?page=`;
        this.stockApiUrl = `https://connectplug.com.br/api/v2/product-stock-balance`;
        this.categoriesApiUrl = `${baseUrl}/category/all?page=1&pageSize=80`;
        this.colorsApiUrl = `${baseUrl}/colors/all?page=1&pageSize=80`;
        this.sizesApiUrl = `${baseUrl}/size/all?page=1&pageSize=80`;
    }

    sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    async retryRequest(
        requestFn: () => Promise<any>,
        retries: number = 5,
        delay: number = 1000
    ) {
        let attempt = 0;
        while (attempt < retries) {
            try {
                const response = await requestFn();
                console.log("Headers:", response.headers);
                return response;
            } catch (error: any) {
                attempt++;

                if (error.response?.status === 429) {
                    const retryAfter = error.response.headers["retry-after"]
                        ? parseInt(error.response.headers["retry-after"], 10) *
                          1000
                        : delay;

                    console.warn(
                        `Rate limit reached. Retrying after ${retryAfter}ms...`
                    );
                    await this.sleep(retryAfter);
                    continue;
                }

                console.error(`Attempt ${attempt} failed:`, error.message);

                if (attempt >= retries) {
                    throw new Error(`Max retries reached: ${error.message}`);
                }

                await this.sleep(delay);
                delay *= 2;
            }
        }
    }

    async fetchAndSaveProducts() {
        let page = this.startPage;
        let allProducts: Product[] = [];
        let productCount = 0;
        let categoryErpId;

        const categoriesResponse = await axios.get(this.categoriesApiUrl);
        const categories = categoriesResponse.data.categories;
        console.log(`Fetched categories:`, categories);
        console.log(
            "Fetched categories erpId:ss",
            categories.map((cat) => cat.props.erpId)
        );

        const colorsResponse = await axios.get(this.colorsApiUrl);
        const colors = colorsResponse.data.colors;
        console.log(`Fetched colors:`, colors);

        const sizesResponse = await axios.get(this.sizesApiUrl);
        const sizes = sizesResponse.data.size;
        console.log(`Fetched sizes:`, sizes);

        try {
            while (true) {
                const response = await this.retryRequest(() =>
                    axios.get(`${this.apiUrl}${page}`, {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `${this.token}`,
                        },
                    })
                );

                const products = response.data.data;
                console.log(`Page ${page} response:`, products);

                if (!Array.isArray(products) || products.length === 0) {
                    console.log(
                        `No more products found on page ${page}. Stopping...`
                    );
                    break;
                }

                console.log("Received products:", products.length);
                const stockResponse = await this.retryRequest(() =>
                    axios.get(this.stockApiUrl, {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `${this.token}`,
                        },
                    })
                );

                const stockData = stockResponse.data.data;
                console.log("Received stock data:", stockData.length);

                const filteredProducts = products
                    .filter((product) => product.properties.deleted_at === null)
                    .map((product) => {
                        const stockInfo = stockData.find(
                            (stock) => stock.id === product.id
                        );

                        const stock = stockInfo ? stockInfo.last_cost || 0 : 0;
                        const productCategoryId =
                            product?.relationships?.category?.data?.id;

                        const productCategory = productCategoryId
                            ? categories.find((category) => {
                                  categoryErpId = Number(category.props.erpId);
                                  return categoryErpId === productCategoryId;
                              })
                            : null;

                        const productColors: {
                            id: UniqueEntityID;
                            name: string;
                            hex: string;
                        }[] = [];
                        const productSizes: {
                            id: UniqueEntityID;
                            name: string;
                        }[] = [];

                        const productVariants: ProductVariantProps[] = [];

                        if (product?.relationships?.attributes?.data) {
                            for (const attribute of product.relationships
                                .attributes.data) {
                                for (const option of attribute.relationships
                                    .options.data) {
                                    const matchingColor = colors.find(
                                        (c) =>
                                            Number(c.props.erpId) === option.id
                                    );
                                    const matchingSize = sizes.find(
                                        (s) =>
                                            Number(s.props.erpId) === option.id
                                    );
                                    if (matchingColor) {
                                        productColors.push({
                                            id: new UniqueEntityID(
                                                String(option.id)
                                            ),
                                            name: matchingColor.props.name,
                                            hex: matchingColor.props.hex, // hex é opcional, pode não existir em algumas cores
                                        });
                                    }

                                    if (matchingSize) {
                                        productSizes.push({
                                            id: new UniqueEntityID(
                                                String(option.id)
                                            ),
                                            name: matchingSize.props.name,
                                        });
                                    }

                                    if (matchingColor || matchingSize) {
                                        productVariants.push({
                                            productId: product.id,
                                            colorId: matchingColor
                                                ? new UniqueEntityID(option.id)
                                                : undefined,
                                            sizeId: matchingSize
                                                ? new UniqueEntityID(option.id)
                                                : undefined,
                                            sku: product.sku || "",
                                            price: product.properties
                                                .unitary_value,
                                            stock: 0,
                                            images: product.properties.image
                                                ? [
                                                      product.properties.image,
                                                      ...(product.properties
                                                          .additionals_photos ||
                                                          []),
                                                  ]
                                                : product.properties
                                                      .additionals_photos || [],
                                            status: ProductStatus.ACTIVE,
                                            createdAt: new Date(),
                                            updatedAt: new Date(),
                                        });
                                    }
                                }
                            }
                        }

                        const productProps: ProductProps = {
                            erpId: String(product.id),
                            name: product.properties.name || "NameNotFound",
                            description: product.properties.description || "",
                            price: product.properties.unitary_value,
                            stock,
                            productColors:
                                productColors.length > 0
                                    ? productColors
                                    : undefined,
                            productSizes:
                                productSizes.length > 0
                                    ? productSizes
                                    : undefined,
                            sku: product.sku || "",
                            slug: Slug.createFromText(product.properties.name),
                            height: product.height || 0,
                            width: product.width || 0,
                            length: product.length || 0,
                            weight: product.weight || 0,
                            showInSite: product.showInSite || true,
                            brandId: new UniqueEntityID(""),
                            createdAt: new Date(product.created_at),
                            updatedAt: new Date(product.updated_at),
                            hasVariants:
                                productColors.length > 0 ||
                                productSizes.length > 0,
                            productCategories: productCategory
                                ? [
                                      {
                                          id: new UniqueEntityID(
                                              productCategory._id.value
                                          ),
                                          name: productCategory.props.name,
                                      },
                                  ]
                                : [
                                      {
                                          id: new UniqueEntityID(
                                              "NoCategoryFromERP"
                                          ),
                                          name: "NoCategoryFromERP",
                                      },
                                  ],
                            images: product.properties.image
                                ? [
                                      product.properties.image,
                                      ...(product.properties
                                          .additionals_photos || []),
                                  ]
                                : product.properties.additionals_photos || [],
                        };

                        const createdProduct = Product.create(
                            productProps,
                            new UniqueEntityID(product.id)
                        );
                        (createdProduct as any).categoryErpId = productCategory
                            ? productCategory.props.erpId
                            : null;

                        return createdProduct;
                    });

                allProducts = [...allProducts, ...filteredProducts];
                productCount += filteredProducts.length;

                console.log(
                    `Page ${page}: ${filteredProducts.length} products added.`
                );
                console.log(`Total products so far: ${productCount}`);
                console.log("Filtered products:", filteredProducts);
                console.log("Received products data:", products);

                await this.sleep(3000);

                page++;
            }

            const filePath = path.resolve(
                process.cwd(),

                "data",
                "products.json"
            );
            const dirPath = path.dirname(filePath);

            (async () => {
                try {
                    await fs.mkdir(dirPath, { recursive: true });
                } catch (error: any) {
                    console.error(
                        `Failed to create directory: ${error.message}`
                    );
                }

                try {
                    await fs.access(filePath);
                } catch {
                    await fs.writeFile(
                        filePath,
                        JSON.stringify({ products: [] }, null, 2)
                    );
                    console.log("File created:", filePath);
                }
            })();

            console.log("Saving to file:", filePath);

            await fs.writeFile(
                filePath,
                JSON.stringify(
                    { products: allProducts, count: productCount },
                    null,
                    2
                )
            );
            console.log(`Total products saved: ${productCount}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "Error fetching products:",
                    error.response ? error.response.data : error.message
                );
            } else {
                console.error("Unexpected error:", error);
            }
        }
        await this.sleep(3000);
    }
}
