import { PaginationParams } from "@/core/repositories/pagination-params";
import { Color } from "../../enterprise/entities/color";
import { Either } from "@/core/either";

export abstract class IColorRepository {
    abstract create(color: Color): Promise<Either<Error, void>>;
    abstract findById(id: string): Promise<Either<Error, Color>>;
    abstract findByName(name: string): Promise<Either<Error, Color>>;
    abstract findAll(params: PaginationParams): Promise<Either<Error, Color[]>>;
    abstract save(color: Color): Promise<Either<Error, void>>;
    abstract delete(color: Color): Promise<Either<Error, void>>;
    abstract addItems(...colors: Color[]): void;
}
