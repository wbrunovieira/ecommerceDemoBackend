import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface BrandProps {
    name: string;
    imageUrl?: string;
    erpId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Brand extends Entity<BrandProps> {
    get name(): string {
        return this.props.name;
    }
    get erpId(): string | undefined {
        return this.props.erpId;
    }
    get imageUrl(): string | undefined {
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
        props: Optional<BrandProps, "createdAt" | "updatedAt">,
        id?: UniqueEntityID
    ) {
        const brand = new Brand(
            {
                ...props,

                createdAt: new Date(),
                updatedAt: new Date(),
            },
            id
        );

        return brand;
    }
}
