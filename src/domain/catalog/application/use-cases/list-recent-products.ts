// import { Product } from '@/domain/catalog/enterprise/entities/product';
// import { ProductRepository } from '../repositories/product-repository';
// import { Either, right } from '@/core/either';

// interface ListRecentProductsUseCaseRequest {
//   page: number;
// }

// type ListRecentProductsUseCaseResponse = Either<
//   null,
//   {
//     products: Product[];
//   }
// >;

// export class ListRecentProductsUseCase {
//   constructor(private productsRepository: ProductRepository) {}

//   async execute({
//     page,
//   }: ListRecentProductsUseCaseRequest): Promise<ListRecentProductsUseCaseResponse> {
//     const products = await this.productsRepository.findManyRecent({ page });

//     return right({
//       products,
//     });
//   }
// }
