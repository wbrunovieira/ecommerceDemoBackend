import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";



const prisma = new PrismaClient();

function generateSlug(
    name: string,
    brandName: string,
    productId: string
): string {
    const slug = `${name}-${brandName}-${productId}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    return slug;
}

function calculateFinalPrice(price: number, discount?: number): number {
    if (discount && discount > 0) {
        return price - price * (discount / 100);
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
        {
            name: "Nao identificado 1",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "1",
        },
        { name: "Nayane", imageUrl: "/images/brands/nayne.jpeg", erpId: "2" },
        { name: "Liz", imageUrl: "/images/brands/liz.svg", erpId: "3" },
        { name: "SONHART", imageUrl: "/images/brands/sonhart.png", erpId: "4" },
        { name: "Lupo", imageUrl: "/images/brands/luppo.svg", erpId: "5" },
        {
            name: "CHENSON",
            imageUrl: "/images/brands/chenson.webp",
            erpId: "6",
        },
        { name: "MASH", imageUrl: "/images/brands/mash.svg", erpId: "7" },
        {
            name: "QUINTINO",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "8",
        },
        {
            name: "Nao identificado 9",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "9",
        },
        {
            name: "Nao identificado 10",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "10",
        },
        {
            name: "Nao identificado 11",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "11",
        },
        { name: "TRIFIL", imageUrl: "/images/brands/trifil.svg", erpId: "12" },
        {
            name: "THAIS FERREIRA",
            imageUrl: "/images/brands/thais-ferreira.png",
            erpId: "13",
        },
        {
            name: "Nao identificado 14",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "14",
        },
        {
            name: "Nao identificado 15",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "15",
        },
        {
            name: "DULOREN",
            imageUrl: "/images/brands/duloren.png",
            erpId: "16",
        },
        {
            name: "BRAND",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "17",
        },
        {
            name: "MASH",
            imageUrl: "/images/brands/mash.svg",
            erpId: "18",
        },
        {
            name: "BONJOUR",
            imageUrl: "/images/brands/bonjour.jpeg",
            erpId: "19",
        },
        {
            name: "Nao identificado 20",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "20",
        },
        {
            name: "ORLA DA PRAIA",
            imageUrl: "/images/brands/orla-da-praia.png",
            erpId: "21",
        },
        {
            name: "ROSEMARY",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "22",
        },
        {
            name: "BOCEJINHO",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "23",
        },
        {
            name: "Nao identificado 24",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "24",
        },
        {
            name: "DILADY",
            imageUrl: "/images/brands/dilady.png",
            erpId: "25",
        },
        {
            name: "TRILHA DO SOL",
            imageUrl: "/images/brands/trilha-do-sol.png",
            erpId: "26",
        },
        {
            name: "2 RIOS",
            imageUrl: "/images/brands/2-rios.png",
            erpId: "27",
        },
        {
            name: "ANNA KOCK",
            imageUrl: "/images/brands/anna-kock.svg",
            erpId: "28",
        },
        {
            name: "BAVON COUROS",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "29",
        },
        {
            name: "TRIUMPH",
            imageUrl: "/images/brands/triumph.svg",
            erpId: "30",
        },
        {
            name: "Nao identificado 31",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "31",
        },
        {
            name: "FOFA",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "32",
        },
        {
            name: "MISS FRANCE",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "33",
        },
        {
            name: "Nao identificado 34",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "34",
        },
        {
            name: "Nao identificado 35",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "35",
        },
        {
            name: "JULIA MORAIS",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "36",
        },
        {
            name: "Nao identificado 37",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "37",
        },
        {
            name: "SENSUAL",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "38",
        },
        {
            name: "JULIAMORAES",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "39",
        },
        {
            name: "FOFA",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "40",
        },
        {
            name: "PODIUN",
            imageUrl: "/images/brands/nayne.jpeg",
            erpId: "41",
        },
        {
            name: "BEL SONHOS",
            imageUrl: "/images/brands/podium.png",
            erpId: "42",
        },
        {
            name: "LU MODAS E SO DELLAS",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "43",
        },
        {
            name: "DOLCI",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "44",
        },
        {
            name: "STYLOS",
            imageUrl: "/images/brands/LogoStylos.svg",
            erpId: "45",
        },
        {
            name: "SEGREDO DA PAIXAO",
            imageUrl: "/images/brands/segredo-da-paixao.png",
            erpId: "46",
        },
        {
            name: "De Millus",
            imageUrl: "/images/brands/demillus.png",
            erpId: "47",
        },
        {
            name: "TORP",
            imageUrl: "/images/brands/torp.png",
            erpId: "48",
        },
        {
            name: "Nao identificado 49",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "49",
        },
        {
            name: "IMPORTADOS",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "50",
        },
        {
            name: "MARY KAY",
            imageUrl: "/images/brands/mary-kay.svg",
            erpId: "51",
        },
        {
            name: "PLIE",
            imageUrl: "/images/brands/plie.svg",
            erpId: "52",
        },
        {
            name: "Nao identificado 53",
            imageUrl: "/images/brands/no-photos.svg",
            erpId: "53",
        },
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
        { name: "pp" },
        { name: "p" },
        { name: "m" },
        { name: "g" },
        { name: "xg" },
    ];
    for (const size of sizes) {
        await prisma.size.upsert({
            where: { name: size.name },
            update: {},
            create: {
                name: size.name,
            },
        });
    }
    console.log("Sizes created");

    // Obter IDs  marcas, categorias, cores e tamanhos

    const brandsData = await prisma.brand.findMany();
    const categoriesData = await prisma.category.findMany();
    const colorsData = await prisma.color.findMany();
    const sizesData = await prisma.size.findMany();

    // Criar ou atualizar produtos
    for (let i = 1; i <= 12; i++) {
        const price = 100 + i;
        const discount = Math.floor(Math.random() * 30);
        const finalPrice = calculateFinalPrice(price, discount);
        const productName = `produto ${i}`;

        const product = await prisma.product.upsert({
            where: { name: productName },
            update: {
                description: `Descrição atualizada do produto ${i}`,
                images: ["/images/foto1.jpg"],

                brandId:
                    brandsData[Math.floor(Math.random() * brandsData.length)]
                        .id,
                sku: `sku${i}`,
                price: price,
                discount: discount,
                finalPrice: finalPrice,

                stock: 0,
                height: 10 + i,
                width: 15 + i,
                length: 20 + i,
                weight: 0.5 + i,
                isFeatured: true,
            },
            create: {
                name: productName,
                description: `Descrição do produto ${i}`,
                images: ["/images/foto1.jpg"],

                brandId:
                    brandsData[Math.floor(Math.random() * brandsData.length)]
                        .id,
                sku: `sku${i}`,
                price: price,
                discount: discount,
                finalPrice: finalPrice,
                stock: 10 + i,
                height: 10 + i,
                width: 15 + i,
                length: 20 + i,
                weight: 0.5 + i,
                isFeatured: true,
                hasVariants: true,
                slug: uuidv4(),
                productColors: {
                    create: colorsData.map((color) => ({
                        color: { connect: { id: color.id } },
                    })),
                },
                productCategories: {
                    create: {
                        category: {
                            connect: {
                                id: categoriesData[
                                    Math.floor(
                                        Math.random() * categoriesData.length
                                    )
                                ].id,
                            },
                        },
                    },
                },
                productSizes: {
                    create: sizesData.map((size) => ({
                        size: { connect: { id: size.id } },
                    })),
                },
                productVariants: {
                    create: colorsData.flatMap((color) =>
                        sizesData.map((size) => ({
                            color: { connect: { id: color.id } },
                            size: { connect: { id: size.id } },
                            sku: `sku-${color.name}-${size.name}-${i}`,
                            price: price,
                            stock: 10 + i,
                            images: ["/images/foto1.jpg"],
                            status: "ACTIVE",
                        }))
                    ),
                },
            },
        });

        const newSlug = generateSlug(product.name, product.brandId, product.id);
        await prisma.product.update({
            where: { id: product.id },
            data: { slug: String(newSlug), productIdVariant: product.id },
        });
    }
    console.log("Products created or updated");

    // Criar ou atualizar produtos sem cores, tamanhos e variantes (bolsa e oculos)
    const productsWithoutVariants = [
        { name: "bolsa 1", category: "bolsa" },
        { name: "bolsa 2", category: "bolsa" },
        { name: "bolsa 3", category: "bolsa" },
    ];

    for (const { name, category } of productsWithoutVariants) {
        const price = 200 + Math.floor(Math.random() * 10);
        const discount = Math.floor(Math.random() * 20);
        const finalPrice = calculateFinalPrice(price, discount);
        const categoryId = categoriesData.find(
            (cat) => cat.name === category
        )?.id;

        if (!categoryId) {
            console.error(`Category ${category} not found`);
            continue;
        }

        const product = await prisma.product.upsert({
            where: { name },
            update: {
                description: `Descrição atualizada do ${name}`,
                images: ["/images/foto1.jpg"],

                brandId:
                    brandsData[Math.floor(Math.random() * brandsData.length)]
                        .id,
                sku: `${name}-sku`,
                price: price,
                discount: discount,
                finalPrice: finalPrice,
                stock: 10 + Math.floor(Math.random() * 10),
                height: 10 + Math.floor(Math.random() * 10),
                width: 15 + Math.floor(Math.random() * 10),
                length: 20 + Math.floor(Math.random() * 10),
                weight: 0.5 + Math.floor(Math.random() * 10),
                isFeatured: true,
            },
            create: {
                name,
                description: `Descrição do ${name}`,
                images: ["/images/foto1.jpg"],

                brandId:
                    brandsData[Math.floor(Math.random() * brandsData.length)]
                        .id,
                sku: `${name}-sku`,
                price: price,
                discount: discount,
                finalPrice: finalPrice,
                stock: 10 + Math.floor(Math.random() * 10),
                height: 10 + Math.floor(Math.random() * 10),
                width: 15 + Math.floor(Math.random() * 10),
                length: 20 + Math.floor(Math.random() * 10),
                weight: 0.5 + Math.floor(Math.random() * 10),
                isFeatured: true,
                slug: uuidv4(),
                productCategories: {
                    create: {
                        category: {
                            connect: {
                                id: categoryId,
                            },
                        },
                    },
                },
            },
        });

        const newSlug = generateSlug(product.name, product.brandId, product.id);
        await prisma.product.update({
            where: { id: product.id },
            data: { slug: String(newSlug) },
        });
    }

    console.log("Products without variants created or updated");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
