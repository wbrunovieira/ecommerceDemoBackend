import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

function generateSlug(
  name: string,
  brandName: string,
  productId: string | number
): string {
  return `${name}-${brandName}-${productId}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function calculateFinalPrice(price: number, discount?: number): number {
  if (discount && discount > 0) {
    return Math.round((price - price * (discount / 100)) * 100) / 100;
  }
  return price;
}

async function main() {
  // Admin user
  const adminEmail = "admin@example.com";
  const adminPassword = "Adminpassword@8";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await hash(adminPassword, 8);
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("Admin user created");
  } else {
    console.log("Admin user already exists");
  }

  // Marcas
  const brands = [
    { name: "Nao identificado 1", imageUrl: "/images/brands/no-photos.svg", erpId: "1" },
    { name: "Nayane", imageUrl: "/images/brands/nayne.jpeg", erpId: "2" },
    { name: "Liz", imageUrl: "/images/brands/liz.svg", erpId: "3" },
    { name: "SONHART", imageUrl: "/images/brands/sonhart.png", erpId: "4" },
    { name: "Lupo", imageUrl: "/images/brands/luppo.svg", erpId: "5" },
  ];
  for (const brand of brands) {
    await prisma.brand.upsert({ where: { name: brand.name }, update: {}, create: brand });
  }
  console.log("Brands created");

  // Categorias
  const categories = [
    { name: "lingerie", imageUrl: "/icons/lingerie-mini.svg" },
    { name: "masculino", imageUrl: "/icons/boy.svg" },
    { name: "pijamas", imageUrl: "/icons/pijamas-mini.svg" },
    { name: "bolsa", imageUrl: "/icons/bag-mini.svg" },
    { name: "eletronicos", imageUrl: "/icons/electronics.svg" },
    { name: "livros", imageUrl: "/icons/book.svg" },
    { name: "esportes", imageUrl: "/icons/sports.svg" },
    { name: "eletrodomesticos", imageUrl: "/icons/appliance.svg" },
  ];
  for (const category of categories) {
    await prisma.category.upsert({ where: { name: category.name }, update: {}, create: category });
  }
  console.log("Categories created");

  // Cores
  const colors = [
    { name: "preto", hex: "#000000" },
    { name: "branco", hex: "#FFFFFF" },
    { name: "vermelho", hex: "#FF0000" },
  ];
  for (const color of colors) {
    await prisma.color.upsert({ where: { name: color.name }, update: {}, create: color });
  }
  console.log("Colors created");

  // Tamanhos
  const sizes = [ { name: "pp" }, { name: "p" }, { name: "m" }, { name: "g" }, { name: "xg" } ];
  for (const size of sizes) {
    await prisma.size.upsert({ where: { name: size.name }, update: {}, create: size });
  }
  console.log("Sizes created");

  // Dados auxiliares
  const brandsData = await prisma.brand.findMany();
  const categoriesData = await prisma.category.findMany();

  // Produtos sem variantes (incluindo setores diversos para demo)
  const productsWithoutVariants = [
    { name: "bolsa 1", category: "bolsa" },
    { name: "bolsa 2", category: "bolsa" },
    { name: "bolsa 3", category: "bolsa" },
    { name: "Smartphone X1", category: "eletronicos" },
    { name: "Notebook Pro 15", category: "eletronicos" },
    { name: "Livro de Receitas", category: "livros" },
    { name: "Blender Turbo", category: "eletrodomesticos" },
    { name: "Tênis de Corrida", category: "esportes" },
    { name: "Camiseta Esportiva", category: "esportes" },
  ];

  for (const { name, category } of productsWithoutVariants) {
    const price = 100 + Math.floor(Math.random() * 490);
    const discount = Math.floor(Math.random() * 20);
    const finalPrice = calculateFinalPrice(price, discount);
    const imagePath = `/images/${name}.jpg`;
    const categoryObj = categoriesData.find(cat => cat.name === category);
    if (!categoryObj) continue;
    const randomBrand = brandsData[Math.floor(Math.random() * brandsData.length)];

    const isOnSale = name.includes("bolsa");
    const isNew = /Smartphone|Notebook/.test(name);
    const isFeatured = true;

    const product = await prisma.product.upsert({
      where: { name },
      update: {
        description: `Descrição atualizada do ${name}`,
        images: [imagePath],
        brandId: randomBrand.id,
        sku: `${name}-sku`,
        price,
        discount,
        finalPrice,
        stock: 10 + Math.floor(Math.random() * 10),
        height: 10 + Math.floor(Math.random() * 10),
        width: 15 + Math.floor(Math.random() * 10),
        length: 20 + Math.floor(Math.random() * 10),
        weight: 0.5 + Math.floor(Math.random() * 10),
        isFeatured,
        onSale: isOnSale,
        isNew,
      },
      create: {
        name,
        description: `Descrição do ${name}`,
        images: [imagePath],
        brandId: randomBrand.id,
        sku: `${name}-sku`,
        price,
        discount,
        finalPrice,
        stock: 10 + Math.floor(Math.random() * 10),
        height: 10 + Math.floor(Math.random() * 10),
        width: 15 + Math.floor(Math.random() * 10),
        length: 20 + Math.floor(Math.random() * 10),
        weight: 0.5 + Math.floor(Math.random() * 10),
        isFeatured,
        onSale: isOnSale,
        isNew,
        slug: uuidv4(),
        productCategories: { create: [{ category: { connect: { id: categoryObj.id } } }] }
      }
    });
    await prisma.product.update({ where: { id: product.id }, data: {
      slug: generateSlug(product.name, randomBrand.name, product.id)
    }});
  }
  console.log("Products without variants created");

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
