import { ProductMigrationService } from "@/migrate-products";
import { Controller, Get } from "@nestjs/common";

@Controller("migration")
export class MigrationController {
    constructor(
        private readonly productMigrationService: ProductMigrationService
    ) {}

    @Get("run")
    async runMigration() {
        await this.productMigrationService.migrateProducts();
        return { message: "Migração concluída" };
    }
}
