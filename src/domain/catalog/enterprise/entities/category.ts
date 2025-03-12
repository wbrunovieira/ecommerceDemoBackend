import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface CategoryProps {
    name: string;
    imageUrl: string;
    erpId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Category extends Entity<CategoryProps> {
    get name(): string {
        return this.props.name;
    }

    get erpId(): string | undefined {
        return this.props.erpId;
    }

    get imageUrl(): string {
        return this.props.imageUrl;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    set name(name: string) {
        this.props.name = name;
    }

    set erpId(erpId: string) {
        this.props.erpId = erpId;
    }

    set imageUrl(imageUrl: string) {
        this.props.imageUrl = imageUrl;
    }

    static create(
        props: Optional<CategoryProps, "createdAt" | "updatedAt">,
        id?: UniqueEntityID
    ) {
        const category = new Category(
            {
                ...props,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            id
        );

        return category;
    }
}
