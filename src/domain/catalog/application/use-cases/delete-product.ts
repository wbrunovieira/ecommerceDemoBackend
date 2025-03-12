// import { Either, left, right } from '@/core/either';
// import { ProductRepository } from '../repositories/product-repository';
// import { ResourceNotFoundError } from './errors/resource-not-found-error';
// import { ProductColorRepository } from '../repositories/product-color-repository';

// interface DeleteProductUseCaseRequest {
//   productId: string;
// }

// type DeleteProductUseCaseResponse = Either<ResourceNotFoundError, {}>;
// export class DeleteProductUseCase {
//   constructor(
//     private productsRepository: ProductRepository,
//     private productColorRepository: ProductColorRepository
//   ) {}

//   async execute({
//     productId,
//   }: DeleteProductUseCaseRequest): Promise<DeleteProductUseCaseResponse> {
//     const product = await this.productsRepository.findById(productId);

//     if (!product) {
//       return left(new ResourceNotFoundError());
//     }

//     await this.productColorRepository.deleteAllByProductId(productId);

//     await this.productsRepository.delete(product);

//     return right({});
//   }
// }
