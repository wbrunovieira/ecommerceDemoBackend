import {
    ProductProps,
    Product,
} from "@/domain/catalog/enterprise/entities/product";
import { ProductWithVariants } from "@/domain/catalog/enterprise/entities/productWithVariants";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ProductVariant } from "@/domain/catalog/enterprise/entities/product-variant";
import { faker } from "@faker-js/faker";
import { ProductStatus } from "@/domain/catalog/enterprise/entities/product-status";

export function makeProduct(
    overrides: Partial<ProductProps> = {},
    id?: UniqueEntityID
): ProductWithVariants {
    console.log("Overrides passed:", overrides);
    const product = Product.create(
        {
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.number.int({ min: 1, max: 1000 }),
            productSizes: [],
            productColors: [],
            productCategories: [],
            sizeId: [],
            brandId: overrides.brandId || new UniqueEntityID(),
            discount: 0,
            finalPrice: 0,
            stock: faker.number.int({ min: 0, max: 100 }),
            sku: faker.string.alphanumeric(8),
            height: faker.number.int({ min: 1, max: 100 }),
            width: faker.number.int({ min: 1, max: 100 }),
            length: faker.number.int({ min: 1, max: 100 }),
            weight: faker.number.int({ min: 1, max: 100 }),
            onSale: faker.datatype.boolean(),
            isFeatured: faker.datatype.boolean(),
            showInSite:
                overrides.showInSite !== undefined
                    ? overrides.showInSite
                    : true,
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            hasVariants: true,
            ...overrides,
        },
        id
    );
    console.log("showInSite value:", overrides.showInSite ?? true);
    console.log("showInSite value after creation:", product.showInSite);

    const variant = ProductVariant.create({
        productId: product.id,
        stock: faker.number.int({ min: 1, max: 100 }),
        price: product.price,
        images: [],
        status: ProductStatus.ACTIVE,
    });

    const uniqueId = id ?? new UniqueEntityID();

    return ProductWithVariants.create(
        {
            product,
            productVariants: [variant],
        },
        uniqueId
    );
}
