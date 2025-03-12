import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { IProductRepository } from "../repositories/i-product-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { generateSlug } from "../utils/generate-slug";
import { IBrandRepository } from "../repositories/i-brand-repository";
import { ProductWithVariants } from "../../enterprise/entities/productWithVariants";
import { Product } from "../../enterprise/entities/product";

interface EditProductUseCaseRequest {
    productId: string;
    name?: string;
    description?: string;
    productSizes?: { id: string; name: string }[];
    productColors?: { id: string; name: string; hex: string }[];
    productCategories?: { id: string; name: string }[];

    sizeId?: string[];
    finalPrice?: number;
    brandId?: string;
    discount?: number;
    price?: number;
    stock?: number;
    sku?: string;
    erpId?: string;
    height?: number;
    width?: number;
    length?: number;
    weight?: number;
    onSale?: boolean;
    isFeatured?: boolean;
    showInSite?: boolean;
    isNew?: boolean;
    images?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

type EditProductUseCaseResponse = Either<ResourceNotFoundError, Product>;

function isBrandIdObject(brandId: any): brandId is { value: string } {
    return (
        typeof brandId === "object" && brandId !== null && "value" in brandId
    );
}

@Injectable()
export class EditProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private brandRepository: IBrandRepository
    ) {}

    private calculateFinalPrice(price: number, discount?: number): number {
        if (discount && discount > 0) {
            return price - price * (discount / 100);
        }
        return price;
    }

    async execute({
        productId,
        name,
        description,
        productSizes,
        productColors,
        productCategories,

        sizeId,
        erpId,
        brandId,
        discount,
        price,
        stock,
        sku,
        height,
        width,
        length,
        weight,
        onSale,
        isFeatured,
        showInSite,
        isNew,
        images,
    }: EditProductUseCaseRequest): Promise<EditProductUseCaseResponse> {
        console.log("bateu no EditProductUseCaseRequest productId", productId);
        console.log("edit quando chega usecase isFeatured", isFeatured);

        const productResult = await this.productRepository.findById(productId);
        console.log("EditProductUseCaseRequest productResult", productResult);

        if (productResult.isLeft()) {
            return left(new ResourceNotFoundError("Product not found"));
        }

        const product = productResult.value;
        console.log("usecase product", product);

        if (!product) {
            return left(
                new ResourceNotFoundError("Product not found in variants")
            );
        }

        let priceChanged = false;
        let discountChanged = false;
        let nameChanged = false;

        if (name !== undefined && name !== product.name) {
            const nameExists =
                await this.productRepository.nameAlreadyExists(name);

            if (nameExists) {
                return left(
                    new ResourceNotFoundError("Product name already in use")
                );
            }

            product.name = name;
            nameChanged = true;
        }
        if (description !== undefined) product.description = description;

        if (productSizes !== undefined)
            product.productSizes = productSizes.map((size) => ({
                id: new UniqueEntityID(size.id),
                name: size.name,
            }));

        if (productCategories !== undefined)
            product.productCategories = productCategories.map((category) => ({
                id: new UniqueEntityID(category.id),
                name: category.name,
            }));
        if (productColors !== undefined)
            product.productColors = productColors.map((color) => ({
                id: new UniqueEntityID(color.id),
                name: color.name,
                hex: color.hex,
            }));

        if (sizeId !== undefined)
            product.sizeId = sizeId.map((id) => new UniqueEntityID(id));
        if (brandId !== undefined) {
            let brandIdValue: string;

            if (isBrandIdObject(brandId)) {
                brandIdValue = brandId.value;
            } else {
                brandIdValue = brandId;
            }

            product.brandId = new UniqueEntityID(brandIdValue);
        }

        if (discount !== undefined) {
            product.discount = discount;
            discountChanged = true;
        }

        if (price !== undefined) {
            product.price =
                typeof price === "string" ? parseFloat(price) : price;
            priceChanged = true;
        }

        if (stock !== undefined) {
            product.stock =
                typeof stock === "string" ? parseFloat(stock) : stock;
        }
        if (erpId !== undefined) product.erpId = erpId;
        if (sku !== undefined) product.sku = sku;

        if (height !== undefined) {
            product.height =
                typeof height === "string" ? parseFloat(height) : height;
        }

        if (width !== undefined) {
            product.width =
                typeof width === "string" ? parseFloat(width) : width;
        }

        if (length !== undefined) {
            product.length =
                typeof length === "string" ? parseFloat(length) : length;
        }

        if (weight !== undefined) {
            product.weight =
                typeof weight === "string" ? parseFloat(weight) : weight;
        }
        if (onSale !== undefined) product.onSale = onSale;
        if (typeof onSale === "string") {
            product.onSale = onSale === "on";
        }
        if (isFeatured !== undefined) product.isFeatured = isFeatured;
        if (typeof isFeatured === "string") {
            product.isFeatured = isFeatured === "on";
        }
        if (showInSite !== undefined) product.showInSite = showInSite;
        if (typeof showInSite === "string") {
            product.showInSite = showInSite === "on";
        }

        if (isNew !== undefined) product.isNew = isNew;
        if (images !== undefined) product.images = images;

        if (priceChanged || discountChanged) {
            const finalPrice = this.calculateFinalPrice(
                product.price,
                product.discount
            );

            product.setFinalPrice(finalPrice);
        }

        const brandIdTeste = new UniqueEntityID(
            "b42efcd8-fbb4-4a55-a1a3-2a71bab4f9ae"
        );

        console.log("brandIdTeste", brandIdTeste);
        console.log("product.brandId", product.brandId);
        const brandIdString = product.brandId.toValue();
        console.log("brandIdString", brandIdString);

        const brandOrError = await this.brandRepository.findById(brandIdString);
        if (brandOrError.isLeft()) {
            return left(new ResourceNotFoundError("Brand not found"));
        }

        const brand = brandOrError.value;
        console.log("aqui brand", brand);
        let newSlug;

        if (nameChanged) {
            console.log("entrou no if (nameChanged)");

            newSlug = generateSlug(
                product.name,
                brand.name,
                product.id.toString()
            );
            const existingProductWithSameSlug =
                await this.productRepository.findBySlug(newSlug.value);

            if (existingProductWithSameSlug.isRight()) {
                const existingProduct =
                    existingProductWithSameSlug.value.product;

                if (
                    existingProduct &&
                    existingProduct.id.toString() !== product.id.toString()
                ) {
                    newSlug.value = `${newSlug.value}-${Date.now()}`;
                }
            }
            console.log(
                "entrou no if (nameChanged) product.slug",
                product.slug
            );
            console.log(
                "entrou no if (nameChanged) product.slug.value",
                product.slug.value
            );
            console.log(
                "entrou no if (nameChanged) newSlug.value",
                newSlug.value
            );
            product.slug = newSlug;
        }
        console.log("aqui newSlug", newSlug);
        console.log("aqui product.slug ", product.slug);
        console.log("aqui product.slug.value ", product.slug.value);

        console.log(
            "edit product usecase productWithVariants json",
            JSON.stringify(product, null, 2)
        );

        console.log("edit product product.name", product.name);
        const saveResult = await this.productRepository.save(product);
        console.log("edit product usecasesaveResult", saveResult);

        if (saveResult.isLeft()) {
            return left(new ResourceNotFoundError("Failed to update product"));
        }

        return right(product);
    }
}
