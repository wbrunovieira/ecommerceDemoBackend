import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

function generateSlug(
    name: string,
    brandName: string,
    productId: string
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
    const adminEmail = "admin@example.com";
    const adminPassword = "Adminpassword@8";

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

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

    // Criar marcas
    const brands = [
        { name: "Nao identificado 1", imageUrl: "/images/brands/no-photos.svg", erpId: "1" },
        { name: "Nayane", imageUrl: "/images/brands/nayne.jpeg", erpId: "2" },
        { name: "Liz", imageUrl: "/images/brands/liz.svg", erpId: "3" },
        { name: "SONHART", imageUrl: "/images/brands/sonhart.png", erpId: "4" },
        { name: "Lupo", imageUrl: "/images/brands/luppo.svg", erpId: "5" },
        // ... restante das marcas
    ];
    for (const brand of brands) {
        await prisma.brand.upsert({
            where: { name: brand.name },
            update: {},
            create: {
                name: brand.name,
                imageUrl: brand.imageUrl,
                erpId: brand.erpId,
            },
        });
    }
    console.log("Brands created");

    // Criar categorias
    const categories = [
        { name: "lingerie", imageUrl: "/icons/lingerie-mini.svg" },
        { name: "masculino", imageUrl: "/icons/boy.svg" },
        { name: "pijamas", imageUrl: "/icons/pijamas-mini.svg" },
        { name: "bolsa", imageUrl: "/icons/bag-mini.svg" },
    ];
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: {
                name: category.name,
                imageUrl: category.imageUrl,
            },
        });
    }
    console.log("Categories created");

    // Criar cores
    const colors = [
        { name: "preto", hex: "#000000" },
        { name: "branco", hex: "#FFFFFF" },
        { name: "vermelho", hex: "#FF0000" },
    ];
    for (const color of colors) {
        await prisma.color.upsert({
            where: { name: color.name },
            update: {},
            create: {
                name: color.name,
                hex: color.hex,
            },
        });
    }
    console.log("Colors created");

    // Criar tamanhos
    const sizes = [
        { name: "pp" }, { name: "p" }, { name: "m" }, { name: "g" }, { name: "xg" }
    ];
    for (const size of sizes) {
        await prisma.size.upsert({
            where: { name: size.name },
            update: {},
            create: { name: size.name },
        });
    }
    console.log("Sizes created");

    // Obter dados
    const brandsData = await prisma.brand.findMany();
    const categoriesData = await prisma.category.findMany();
    const colorsData = await prisma.color.findMany();
    const sizesData = await prisma.size.findMany();

    // Seed produtos com variantes
    for (let i = 1; i <= 12; i++) {
        const price = 100 + i;
        const discount = Math.floor(Math.random() * 30);
        const finalPrice = calculateFinalPrice(price, discount);
        const productName = `produto ${i}`;
        const randomBrand = brandsData[Math.floor(Math.random() * brandsData.length)];
        const randomCategory = categoriesData[Math.floor(Math.random() * categoriesData.length)];

        const product = await prisma.product.upsert({
            where: { name: productName },
            update: {
                description: `Descrição atualizada do produto ${i}`,
                images: ["/images/foto1.jpg"],
                brandId: randomBrand.id,
                sku: `sku${i}`,
                price,
                discount,
                finalPrice,
                stock: 10 + i,
                height: 10 + i,
                width: 15 + i,
                length: 20 + i,
                weight: 0.5 + i,
                hasVariants: true,
                // Mantém slug atual, sem alteração
            },
            create: {
                name: productName,
                description: `Descrição do produto ${i}`,
                images: ["/images/foto1.jpg"],
                brandId: randomBrand.id,
                sku: `sku${i}`,
                price,
                discount,
                finalPrice,
                stock: 10 + i,
                height: 10 + i,
                width: 15 + i,
                length: 20 + i,
                weight: 0.5 + i,
                hasVariants: true,
                slug: uuidv4(),
                productColors: {
                    create: colorsData.map(color => ({ color: { connect: { id: color.id } } }))
                },
                productCategories: {
                    create: [{ category: { connect: { id: randomCategory.id } } }]
                },
                productSizes: {
                    create: sizesData.map(size => ({ size: { connect: { id: size.id } } }))
                },
                productVariants: {
                    create: colorsData.flatMap(color =>
                        sizesData.map(size => ({
                            color: { connect: { id: color.id } },
                            size: { connect: { id: size.id } },
                            sku: `sku-${color.name}-${size.name}-${i}`,
                            price,
                            stock: 10 + i,
                            images: ["/images/foto1.jpg"],
                            status: "ACTIVE",
                        }))
                    )
                }
            }
        });

        // Atualiza slug final baseado em nome, marca e id
        await prisma.product.update({
            where: { id: product.id },
            data: { slug: generateSlug(product.name, randomBrand.name, product.id), productIdVariant: product.id }
        });
    }
    console.log("Products created or updated");

    // Seed produtos sem variantes
    const productsWithoutVariants = [
        { name: "bolsa 1", category: "bolsa" },
        { name: "bolsa 2", category: "bolsa" },
        { name: "bolsa 3", category: "bolsa" },
    ];
    for (const { name, category } of productsWithoutVariants) {
        const price = 200 + Math.floor(Math.random() * 10);
        const discount = Math.floor(Math.random() * 20);
        const finalPrice = calculateFinalPrice(price, discount);
        const categoryObj = categoriesData.find(cat => cat.name === category);
        if (!categoryObj) continue;

        const product = await prisma.product.upsert({
            where: { name },
            update: {
                description: `Descrição atualizada do ${name}`,
                images: ["/images/foto1.jpg"],
                brandId: brandsData[Math.floor(Math.random() * brandsData.length)].id,
                sku: `${name}-sku`,
                price,
                discount,
                finalPrice,
                stock: 10 + Math.floor(Math.random() * 10),
                height: 10 + Math.floor(Math.random() * 10),
                width: 15 + Math.floor(Math.random() * 10),
                length: 20 + Math.floor(Math.random() * 10),
                weight: 0.5 + Math.floor(Math.random() * 10),
                isFeatured: true,
                // Mantém slug atual
            },
            create: {
                name,
                description: `Descrição do ${name}`,
                images: ["/images/foto1.jpg"],
                brandId: brandsData[Math.floor(Math.random() * brandsData.length)].id,
                sku: `${name}-sku`,
                price,
                discount,
                finalPrice,
                stock: 10 + Math.floor(Math.random() * 10),
                height: 10 + Math.floor(Math.random() * 10),
                width: 15 + Math.floor(Math.random() * 10),
                length: 20 + Math.floor(Math.random() * 10),
                weight: 0.5 + Math.floor(Math.random() * 10),
                isFeatured: true,
                slug: uuidv4(),
                productCategories: {
                    create: [{ category: { connect: { id: categoryObj.id } } }]
                }
            }
        });

        // Atualiza slug final
        await prisma.product.update({
            where: { id: product.id },
            data: { slug: generateSlug(product.name, product.brandId, product.id) }
        });
    }
    console.log("Products without variants created or updated");

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
