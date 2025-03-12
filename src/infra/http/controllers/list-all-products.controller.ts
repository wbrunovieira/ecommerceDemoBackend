// import {
//   Body,
//   Controller,
//   Get,
//   HttpException,
//   HttpStatus,
//   Param,
//   Put,
//   Query,
//   UseGuards,
// } from "@nestjs/common";
// import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
// import { ZodValidationsPipe } from "../../../pipes/zod-validations-pipe";
// import { PrismaService } from "src/prisma/prisma.service";
// import { z } from "zod";
// import { EditProductUseCase } from "@/domain/catalog/application/use-cases/edit-product";

// const pageQueryParamSchema = z
//   .string()
//   .optional()
//   .default("1")
//   .transform(Number)
//   .pipe(z.number().min(1));

// const editProductSchema = z.object({
//   name: z.string().optional(),
//   description: z.string().optional(),
//   productSizes: z.array(z.string()).optional(),
//   productColors: z.array(z.string()).optional(),
//   productCategories: z.array(z.string()).optional(),
//   slug: z.array(z.string()).optional(),

//   sizeId: z.array(z.string()).optional(),
//   brandId: z.string().optional(),
//   discount: z.number().optional(),
//   price: z.number().optional(),
//   stock: z.number().optional(),
//   sku: z.string().optional(),
//   height: z.number().optional(),
//   width: z.number().optional(),
//   length: z.number().optional(),
//   weight: z.number().optional(),
//   onSale: z.boolean().optional(),
//   isFeatured: z.boolean().optional(),
//   isNew: z.boolean().optional(),
//   images: z.array(z.string()).optional(),
// });

// type EditProductBodySchema = z.infer<typeof editProductSchema>;

// const queryValidationPipe = new ZodValidationsPipe(pageQueryParamSchema);

// type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

// @Controller("/products")

// export class ListAllProductsController {
//   constructor(
//     private prisma: PrismaService,
//     private editProductUseCase: EditProductUseCase
//   ) {}

//   @Get("/featured-products")
//   async feature() {
//     const products = await this.prisma.product.findMany({
//       where: {
//         isFeatured: true,
//       },
//       take: 9,
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return { products };
//   }

//   @Get("all")
//   async handle(@Query("page", queryValidationPipe) page: PageQueryParamSchema) {
//     const perPage = 10;

//     const products = await this.prisma.product.findMany({
//       take: perPage,
//       skip: (page - 1) * perPage,
//       orderBy: {
//         name: "asc",
//       },
//     });

//     return { products };
//   }

//   @Get(":id")
//   async getProduct(@Param("id") id: string) {
//     const product = await this.prisma.product.findUnique({ where: { id } });
//     if (!product) {
//       throw new HttpException("Produto não encontrado", HttpStatus.NOT_FOUND);
//     }
//     return { product };
//   }

//   @Get("slug/:slug")
//   async getProductbySlug(@Param("slug") slug: string) {
//     const product = await this.prisma.product.findUnique({ where: { slug } });
//     if (!product) {
//       throw new HttpException("Produto não encontrado", HttpStatus.NOT_FOUND);
//     }
//     return { product };
//   }

//   @Put("save/:id")
//   async saveProduct(
//     @Param("id") id: string,
//     @Body(new ZodValidationsPipe(editProductSchema)) body: EditProductBodySchema
//   ) {
//     const result = await this.editProductUseCase.execute({
//       productId: id,
//       ...body,
//     });

//     if (result.isLeft()) {
//       throw new HttpException(result.value.message, HttpStatus.BAD_REQUEST);
//     }

//     return { product: result.value.product };
//   }
// }
