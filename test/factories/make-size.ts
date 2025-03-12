import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Size, SizeProps } from "@/domain/catalog/enterprise/entities/size";

export function makeSize(
    override: Partial<SizeProps> = {},
    id?: UniqueEntityID
) {
    const size = Size.create(
        {
            name: faker.commerce.productName(),

            ...override,
        },
        id
    );

    return size;
}
