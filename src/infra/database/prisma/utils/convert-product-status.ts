// src/infra/database/prisma/utils/convert-product-status.ts
import { ProductStatus as DomainProductStatus } from "@/domain/catalog/enterprise/entities/product-status";
import { ProductStatus as PrismaProductStatus } from "@prisma/client";

export function toDomainProductStatus(
    status: PrismaProductStatus
): DomainProductStatus {
    switch (status) {
        case PrismaProductStatus.ACTIVE:
            return DomainProductStatus.ACTIVE;
        case PrismaProductStatus.INACTIVE:
            return DomainProductStatus.INACTIVE;
        case PrismaProductStatus.DISCONTINUED:
            return DomainProductStatus.DISCONTINUED;
        default:
            throw new Error(`Unknown status: ${status}`);
    }
}

export function toPrismaProductStatus(
    status: DomainProductStatus
): PrismaProductStatus {
    switch (status) {
        case DomainProductStatus.ACTIVE:
            return PrismaProductStatus.ACTIVE;
        case DomainProductStatus.INACTIVE:
            return PrismaProductStatus.INACTIVE;
        case DomainProductStatus.DISCONTINUED:
            return PrismaProductStatus.DISCONTINUED;
        default:
            throw new Error(`Unknown status: ${status}`);
    }
}
