import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface ColorProps {
    name: string;
    hex: string;
    erpId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Color extends Entity<ColorProps> {
    get name(): string {
        return this.props.name;
    }
    get erpId(): string | undefined {
        return this.props.erpId;
    }
    get hex(): string {
        return this.props.hex;
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
    set hex(hex: string) {
        this.props.hex = hex;
    }

    static create(
        props: Optional<ColorProps, "createdAt" | "updatedAt">,
        id?: UniqueEntityID
    ): Color {
        const color = new Color(
            {
                ...props,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            id
        );

        return color;
    }
}
