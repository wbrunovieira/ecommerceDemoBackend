import { Entity } from "@/core/entities/entity";
import { Optional } from "@/core/types/optional";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface AddressProps {
    userId: string;
    street: string;
    number: number;
    complement?: string | undefined;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Address extends Entity<AddressProps> {
    private touch() {
        this.props.updatedAt = new Date();
    }

    get userId(): string {
        return this.props.userId;
    }

    get street(): string {
        return this.props.street;
    }

    set street(value: string) {
        this.props.street = value;
        this.touch();
    }

    get number(): number {
        return this.props.number;
    }

    set number(value: number) {
        this.props.number = value;
        this.touch();
    }

    get complement(): string | undefined {
        return this.props.complement ?? "";
    }

    set complement(value: string | undefined) {
        this.props.complement = value;
        this.touch();
    }

    get city(): string {
        return this.props.city;
    }
    set city(value: string) {
        this.props.city = value;
        this.touch();
    }
    get country(): string {
        return this.props.city;
    }
    set country(value: string) {
        this.props.country = value;
        this.touch();
    }

    get state(): string {
        return this.props.state;
    }
    set state(value: string) {
        this.props.state = value;
        this.touch();
    }
    get zipCode(): string {
        return this.props.zipCode;
    }
    set zipCode(value: string) {
        this.props.zipCode = value;
        this.touch();
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    public static create(
        props: Optional<AddressProps, "createdAt" | "updatedAt" | "complement">,
        id?: UniqueEntityID
    ) {
        const address = new Address(
            {
                ...props,
                complement: props.complement ?? "",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            id
        );
        return address;
    }
}
