import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { faker } from "@faker-js/faker";

import {
    ProductCategory,
    ProductCategoryProps,
} from "@/domain/catalog/enterprise/entities/product-category";

export function makeProductCategory(
    override: Partial<ProductCategoryProps> = {},
    categoryId?: UniqueEntityID,
    productId?: UniqueEntityID
) {
    const productCategory = ProductCategory.create({
        categoryId: categoryId
            ? categoryId
            : new UniqueEntityID(faker.datatype.uuid()),
        productId: productId
            ? productId
            : new UniqueEntityID(faker.datatype.uuid()),
        ...override,
    });

    return productCategory;
}
