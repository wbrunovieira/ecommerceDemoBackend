import { Either } from "@/core/either";

import { Shipping } from "../../enterprise/entities/shipping";

export abstract class IShippingRepository {
    abstract create(shipping: Shipping): Promise<Either<Error, void>>;
    abstract update(shipping: Shipping): Promise<Either<Error, void>>;
    abstract findByCartId(cartId: string): Promise<Shipping | null>;
}
