import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

interface EmailPreferences {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    categories: string[];
}

interface SmsPreferences {
    enabled: boolean;
}

interface PushNotificationPreferences {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
}

interface MarketingPreferences {
    email?: EmailPreferences;
    sms?: SmsPreferences;
    pushNotifications?: PushNotificationPreferences;
}

export interface UserProps {
    name: string;
    email: string;
    password: string;
    phone?: string;
    verificationToken?: string | null;
    isVerified?: boolean;
    googleUserId?: string;
    birthDate?: Date;
    gender?: string;
    lastLogin?: Date;
    accountStatus?: string;
    marketingPreferences?: MarketingPreferences;
    isGoogleUser?: boolean;
    profileImageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    role: "user" | "admin";
}

export class User extends Entity<UserProps> {
    toResponseObjectPartial(): Partial<Omit<UserProps, "password">> & {
        id: string;
    } {
        const { password, ...userWithoutPassword } = this.props;
        return {
            id: this.id.toString(),
            ...userWithoutPassword,
        };
    }

    toResponseObject(): Omit<UserProps, "password"> & { id: string } {
        const { password, ...userWithoutPassword } = this.props;
        return {
            id: this.id.toString(),
            ...(userWithoutPassword as Omit<UserProps, "password">),
        };
    }

    get name(): string {
        return this.props.name;
    }

    get verificationToken(): string | null {
        return this.props.verificationToken || null;
    }

    get isVerified(): boolean | undefined {
        return this.props.isVerified;
    }

    get role(): string {
        return this.props.role;
    }

    get email(): string {
        return this.props.email;
    }

    get password(): string {
        return this.props.password;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    private touch() {
        this.props.updatedAt = new Date();
    }

    set name(value: string) {
        this.props.name = value;
        this.touch();
    }
    set password(value: string) {
        this.props.password = value;
        this.touch();
    }
    set verificationToken(value: string | null) {
        this.props.verificationToken = value;
        this.touch();
    }

    set profileImageUrl(value: string) {
        this.props.profileImageUrl = value;
        this.touch();
    }

    set isVerified(value: boolean) {
        this.props.isVerified = value;
        this.touch();
    }

    set phone(value: string) {
        this.props.phone = value;
        this.touch();
    }

    get googleUserId() {
        return this.props.googleUserId;
    }

    get birthDate(): Date | null {
        return this.props.birthDate || null;
    }

    set birthDate(value: Date) {
        this.props.birthDate = value;
        this.touch();
    }

    get gender(): string | null {
        return this.props.gender || null;
    }
    get phone(): string | null {
        return this.props.phone || null;
    }

    set gender(value: string) {
        this.props.gender = value;
        this.touch();
    }

    get lastLogin(): Date | null {
        return this.props.lastLogin || null;
    }

    set lastLogin(value: Date) {
        this.props.lastLogin = value;
        this.touch();
    }

    get accountStatus(): string | null {
        return this.props.accountStatus || null;
    }

    set accountStatus(value: string) {
        this.props.accountStatus = value;
        this.touch();
    }

    get marketingPreferences(): MarketingPreferences | undefined {
        return this.props.marketingPreferences || undefined;
    }

    set marketingPreferences(value: MarketingPreferences | undefined) {
        this.props.marketingPreferences = value;
        this.touch();
    }

    get isGoogleUser() {
        return this.props.isGoogleUser;
    }

    get profileImageUrl(): string | null {
        return this.props.profileImageUrl || null;
    }

    public static create(
        props: Optional<UserProps, "createdAt" | "updatedAt">,
        id?: UniqueEntityID
    ) {
        const user = new User(
            {
                ...props,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            id
        );
        return user;
    }
}
