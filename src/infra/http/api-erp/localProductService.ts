// // src/services/localProductService.ts

// import { PrismaClient } from "@prisma/client";
// import { z } from "zod";

// const prisma = new PrismaClient();

// const createProductBodySchema = z.object({
//   name: z.string(),
//   description: z.string(),
//   productColors: z.array(z.string()).optional(),
//   productSizes: z.array(z.string()).optional(),
//   productCategories: z.array(z.string()),

//   brandId: z.string(),
//   sku: z.string().optional(),
//   price: z.number(),
//   erpId: z.string().optional(),
//   stock: z.number(),
//   discount: z.number().optional(),
//   onSale: z.boolean().optional(),
//   isNew: z.boolean().optional(),
//   isFeatured: z.boolean().optional(),
//   images: z.array(z.string()).max(5).optional(),
//   height: z.number(),
//   width: z.number(),
//   length: z.number(),
//   weight: z.number(),
// });

// interface propertiesProps {

//     name: string
//     unitary_value: number
//     description: string
//     image: string

// }
// interface relationshipsProps {
//     category: {
//         id: number
//     }
// }

// interface externalProduct  {
//     id: number
//     properties:propertiesProps
//     relationships: relationshipsProps

// //   code: "EX123",
// //   name: "Produto Externo",
// //   unit_of_measure: "unidade",
// //   description: "Descrição do produto externo",
// //   unitary_value: 100.0,
// //   stock: 50,
// //   max_remove_components: 0,
// //   min_additionals: 0,
// //   max_additionals: 0,
// //   charge_additionals_from: "N/A",
// //   flg_separate_print: false,
// //   available_for_sale: true,
// //   image: "http://example.com/image.jpg",
// //   order: 0,
// //   card_swipe: false,
// //   additionals_photos: false,
// //   relationships: [],
// //   attributes: [],
// //   category: { id: "CAT123", name: "Categoria Externa" },
// //   components: [],
// //   optionals: [],
// //   print_points: [],
// //   stock_movement_cost: [],
// };

// const mapExternalProductToInternal = (externalProduct: any) => {
//   return {
//     name: externalProduct.name,
//     description: externalProduct.description,
//     productColors: [], // Adicione a lógica para mapear cores, se aplicável
//     productSizes: [], // Adicione a lógica para mapear tamanhos, se aplicável
//     productCategories: [externalProduct.category.id], // Exemplo de mapeamento de categoria
//     erpId:externalProduct.code,
//     brandId: "brand-id", // Mapeie corretamente conforme necessário
//     sku: externalProduct.code,
//     price: externalProduct.unitary_value,
//     erpId: externalProduct.code, // Ou outro campo apropriado
//     stock: externalProduct.stock,
//     discount: 0, // Se não houver desconto, defina como 0
//     onSale: externalProduct.available_for_sale,
//     isNew: false, // Defina conforme necessário
//     isFeatured: false, // Defina conforme necessário
//     images: [externalProduct.image],
//     height: 0, // Defina conforme necessário
//     width: 0, // Defina conforme necessário
//     length: 0, // Defina conforme necessário
//     weight: 0, // Defina conforme necessário
//   };
// };

// const internalProduct = mapExternalProductToInternal(externalProduct);
// const validatedProduct = createProductBodySchema.parse(internalProduct);

// export const saveProducts = async (products: any[]) => {
//   for (const product of products) {
//     try {
//       const existingProduct = await prisma.product.findUnique({
//         where: { name: product.name },
//       });

//       if (existingProduct) {
//         // Atualizar produto existente
//         await prisma.product.update({
//           where: { name: product.name },
//           data: {
//             description: product.description,
//             price: product.unitary_value,
//             stock: product.stock,
//             // Adicione os campos que deseja atualizar
//           },
//         });
//       } else {
//         // Criar novo produto
//         await prisma.product.create({
//             data: validatedProduct,
//           });
//       }
//     } catch (error) {
//       console.error("Erro ao salvar produto:", error);
//     }
//   }
// };
