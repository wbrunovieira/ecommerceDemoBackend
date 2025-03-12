import { Slug } from "./value-objects/slug";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

import dayjs from "dayjs";

import { Entity } from "@/core/entities/entity";
import { ProductStatus } from "./product-status";
import { SizeProps } from "./size";

interface Category {
    id: UniqueEntityID;
    name: string;
}

interface Brand {
    id: UniqueEntityID;
    name: string;
}

interface Color {
    id: UniqueEntityID;
    name: string;
    hex: string;
}
interface Size {
    id: UniqueEntityID;
    name: string;
}

interface ProductVariant {
    id: UniqueEntityID;
    productId: UniqueEntityID;
    colorId?: UniqueEntityID;
    sizeId?: UniqueEntityID;
    sku: string;
    upc?: string;
    stock: number;
    price: number;
    images: string[];
    status: ProductStatus;
}

export interface ProductProps {
    name: string;
    description: string;
    productSizes?: Size[];
    productColors?: Color[];
    productCategories?: Category[];
    productVariants?: ProductVariant[];
    sizeId?: UniqueEntityID[];
    finalPrice?: number;
    brandId: UniqueEntityID;
    brandName?: string;
    brandUrl?: string;
    discount?: number;
    price: number;
    stock: number;
    sku: string;
    productIdVariant?: string;
    erpId?: string;
    slug: Slug;
    height: number;
    width: number;
    length: number;
    weight: number;
    onSale?: boolean;
    isFeatured?: boolean;
    isNew?: boolean;
    images?: string[];
    hasVariants: boolean;
    showInSite: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class Product extends Entity<ProductProps> {
    brand: any;
    private touch() {
        this.props.updatedAt = new Date();
    }

    get productVariants(): ProductVariant[] | undefined {
        return this.props.productVariants;
    }

    set productVariants(variants: ProductVariant[]) {
        this.props.productVariants = variants;
        this.touch();
    }

    get height() {
        return this.props.height;
    }

    get showInSite(): boolean {
        return this.props.showInSite;
    }
    get hasVariants(): boolean {
        return this.props.hasVariants;
    }

    get erpId(): string | undefined {
        return this.props.erpId;
    }
    get productIdVariant(): string | undefined {
        return this.props.productIdVariant;
    }

    set height(height: number) {
        this.props.height = height;
        this.touch();
    }
    set erpId(erpId: string) {
        this.props.erpId = erpId;
        this.touch();
    }

    set productIdVariant(productIdVariant: string | undefined) {
        this.props.productIdVariant = productIdVariant;
        this.touch();
    }

    set width(width: number) {
        this.props.width = width;
        this.touch();
    }
    set length(length: number) {
        this.props.length = length;
        this.touch();
    }

    set showInSite(showInSite: boolean) {
        this.props.showInSite = showInSite;
        this.touch();
    }

    set weight(weight: number) {
        this.props.weight = weight;
        this.touch();
    }
    set onSale(onSale: boolean) {
        this.props.onSale = onSale;
        this.touch();
    }

    set hasVariants(hasVariants: boolean) {
        this.props.hasVariants = hasVariants;
        this.touch();
    }

    set isFeatured(isFeatured: boolean) {
        this.props.isFeatured = isFeatured;
        this.touch();
    }
    set isNew(isNew: boolean) {
        this.props.isNew = isNew;
        this.touch();
    }
    set images(images: string[]) {
        this.props.images = images;
        this.touch();
    }

    get sku() {
        return this.props.sku;
    }

    get onSale() {
        return this.props.onSale ?? false;
    }
    get discount() {
        return this.props.discount;
    }
    get isFeatured() {
        return this.props.isFeatured ?? false;
    }
    get images() {
        return this.props.images ?? [];
    }
    get width() {
        return this.props.width;
    }
    get length() {
        return this.props.length;
    }

    get weight() {
        return this.props.weight;
    }
    get name() {
        return this.props.name;
    }

    get finalPrice() {
        return this.props.finalPrice;
    }

    get description() {
        return this.props.description;
    }

    get brandId() {
        return this.props.brandId;
    }

    get sizeId(): UniqueEntityID[] | undefined {
        return this.props.sizeId;
    }

    get price() {
        return this.props.price;
    }

    get stock() {
        return this.props.stock;
    }

    get slug() {
        return this.props.slug;
    }

    get createdAt() {
        return this.props.createdAt;
    }

    get updatedAt() {
        return this.props.updatedAt;
    }

    get isNew(): boolean {
        const daysSinceCreation = dayjs().diff(this.createdAt, "day");
        return daysSinceCreation <= 30;
    }

    get excerpt() {
        return this.description.substring(0, 120).trimEnd().concat("...");
    }

    set name(name: string) {
        this.props.name = name;
        // this.props.slug = Slug.createFromText(name);

        this.touch();
    }

    set description(description: string) {
        this.props.description = description;

        this.touch();
    }

    set brandId(brandId: UniqueEntityID) {
        this.props.brandId = brandId;

        this.touch();
    }

    set sizeId(sizeId: UniqueEntityID[]) {
        this.props.sizeId = sizeId;

        this.touch();
    }

    set sku(sku: string) {
        this.props.sku = sku;
        this.touch();
    }

    set price(price: number) {
        this.props.price = price;

        this.touch();
    }

    set stock(stock: number) {
        this.props.stock = stock;

        this.touch();
    }

    set slug(slug: Slug) {
        this.props.slug = slug;

        this.touch();
    }

    get productSizes(): Size[] | undefined {
        return this.props.productSizes;
    }

    set productSizes(sizes: Size[]) {
        this.props.productSizes = sizes;
        this.touch();
    }

    get productCategories(): Category[] | undefined {
        return this.props.productCategories;
    }

    set productColors(colors: Color[]) {
        this.props.productColors = colors;
        this.touch();
    }
    set productCategories(categories: Category[]) {
        this.props.productCategories = categories;
        this.touch();
    }

    // addSize(sizeId: UniqueEntityID) {
    //   if (!this.props.productSizes) {
    //     this.props.productSizes = [];
    //   }
    //   this.props.productSizes.push(sizeId);
    //   this.touch();
    // }

    // addColor(productColorsId: UniqueEntityID) {
    //   if (!this.props.productColors) {
    //     this.props.productColors = [];
    //   }
    //   this.props.productColors.push(productColorsId);
    //   this.touch();
    // }

    addCategory(category: Category) {
        if (!this.props.productCategories) {
            this.props.productCategories = [];
        }
        this.props.productCategories.push(category);
        this.touch();
    }

    set discount(discount: number | undefined) {
        this.props.discount = discount;
        this.touch();
    }

    setFinalPrice(finalPrice: number) {
        this.props.finalPrice = finalPrice;
        this.touch();
    }

    toObject() {
        return {
            id: this.id.toValue(),
            name: this.name,
            description: this.description,
            price: this.price,
            finalPrice: this.finalPrice,
            stock: this.stock,
            brandName: this.props.brandName,
            brandUrl: this.props.brandUrl,
            discount: this.discount,
            height: this.height,
            width: this.width,
            length: this.length,
            weight: this.weight,
            onSale: this.onSale,
            isFeatured: this.isFeatured,
            showInSite: this.showInSite,
            isNew: this.isNew,
            images: this.images,
            slug: this.slug.value,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            productCategories: this.productCategories?.map((category) => ({
                id: category.id.toValue(),
                name: category.name,
            })),
        };
    }

    static create(
        props: Optional<
            ProductProps,
            "createdAt" | "slug" | "updatedAt" | "showInSite"
        >,
        id?: UniqueEntityID
    ): Product {
        const product = new Product(
            {
                ...props,
                productCategories: props.productCategories || [],
                createdAt: new Date(),
                updatedAt: new Date(),
                slug: props.slug ?? Slug.createFromText(props.name),
                showInSite: props.showInSite ?? true,
            },
            id
        );

        return product;
    }
}
