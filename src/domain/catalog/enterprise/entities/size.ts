import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { string } from "zod";

export interface SizeProps {
    name: string;
    erpId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Size extends Entity<SizeProps> {
    get name(): string {
        return this.props.name;
    }
    get erpId(): string | undefined {
        return this.props.erpId;
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

    public static create(
        props: Optional<SizeProps, "createdAt" | "updatedAt">,
        id?: UniqueEntityID
    ) {
        const size = new Size(
            {
                ...props,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            id
        );
        return size;
    }
}
