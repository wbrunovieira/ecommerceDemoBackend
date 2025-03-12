import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
    Category,
    CategoryProps,
} from "@/domain/catalog/enterprise/entities/category";

export function makeCategory(
    override: Partial<CategoryProps> = {},
    id?: UniqueEntityID
) {
    const category = Category.create(
        {
            name: faker.commerce.productName(),
            imageUrl: faker.commerce.productAdjective(),

            ...override,
        },
        id
    );

    return category;
}
