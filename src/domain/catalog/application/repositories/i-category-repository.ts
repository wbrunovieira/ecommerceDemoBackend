import { PaginationParams } from "@/core/repositories/pagination-params";
import { Category } from "../../enterprise/entities/category";
import { Either } from "@/core/either";

export abstract class ICategoryRepository {
    abstract findById(id: string): Promise<Either<Error, Category>>;
    abstract create(category: Category): Promise<Either<Error, void>>;
    abstract findByName(name: string): Promise<Either<Error, Category>>;
    abstract findAll(
        params: PaginationParams
    ): Promise<Either<Error, Category[]>>;
    abstract delete(category: Category): Promise<Either<Error, void>>;
    abstract save(category: Category): Promise<Either<Error, void>>;
    abstract addItems(...categories: Category[]): void;
    abstract findCategoriesWithProducts(): Promise<Either<Error, Category[]>>;
}
