import { Either } from "@/core/either";

import { ArchivedCart } from "../../enterprise/entities/archived-cart";

export abstract class IArchivedCartRepository {
    abstract archive(cart: ArchivedCart): Promise<Either<Error, void>>;
}
