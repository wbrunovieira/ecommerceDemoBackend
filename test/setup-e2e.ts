import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { execSync } from "node:child_process";
import { spawnSync } from "child_process";

const prisma = new PrismaClient();

function generateUniqueDatabaseURL(schemaId: string) {
    if (!process.env.DATABASE_URL) {
        throw new Error("Please provider a DATABASE_URL environment variable");
    }

    const url = new URL(process.env.DATABASE_URL);

    url.searchParams.set("schema", schemaId);

    return url.toString();
}

const schemaId = randomUUID();

beforeAll(async () => {
    const databaseURL = generateUniqueDatabaseURL(schemaId);

    process.env.DATABASE_URL = databaseURL;

    const migrateResult = spawnSync("npx", ["prisma", "migrate", "deploy"], {
        stdio: "pipe",
        env: process.env,
    });

    const { stdout, stderr } = migrateResult;
    if (migrateResult.status !== 0) {
        throw new Error("Migration failed");
    }

    const seedResult = spawnSync("npm", ["run", "seed"], {
        stdio: "pipe",
        env: process.env,
    });

    const { stdout: seedStdout, stderr: seedStderr } = seedResult;

    console.error(seedStderr?.toString());
});

afterAll(async () => {
    try {
        await prisma.$executeRawUnsafe(
            `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`
        );
    } catch (error) {
        console.error("Error dropping schema:", error);
    }
    await prisma.$disconnect();
});
