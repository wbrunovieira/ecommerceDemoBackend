import { Either } from "@/core/either";
import { Size } from "../../enterprise/entities/size";
import { PaginationParams } from "@/core/repositories/pagination-params";

export abstract class ISizeRepository {
    abstract create(size: Size): Promise<Either<Error, void>>;
    abstract findById(id: string): Promise<Either<Error, Size>>;
    abstract findByName(name: string): Promise<Either<Error, Size>>;
    abstract delete(size: Size): Promise<Either<Error, void>>;
    abstract save(size: Size): Promise<Either<Error, void>>;
    abstract findAll(params: PaginationParams): Promise<Either<Error, Size[]>>;
    abstract addItems(...sizes: Size[]): void;
}
