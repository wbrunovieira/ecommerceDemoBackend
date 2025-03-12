import { ApiGetAllProducts } from "@/domain/catalog/application/use-cases/api-all-products";
import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { SyncCategoriesUseCase } from "../api-erp/fechAllCategoriesFromErp";
import { SyncAttributesUseCase } from "../api-erp/fechAllColorESizesFromErp";
import {
    FetchAllSuppliersUseCase,
    Supplier,
} from "../api-erp/fetchAllSupplierUseCase";

@Controller("api")
export class ApiController {
    constructor(
        private readonly productsService: ApiGetAllProducts,
        private readonly syncCategoriesService: SyncCategoriesUseCase,
        private readonly syncAttributesService: SyncAttributesUseCase,
        private readonly fetchAllSuppliersUseCase: FetchAllSuppliersUseCase
    ) {}

    @Get("fetch-and-save")
    async fetchAndSaveProducts() {
        await this.productsService.fetchAndSaveProducts();
        return { message: "Products fetched and saved successfully" };
    }

    @Get("sync-categories")
    async syncCategories() {
        try {
            const categories =
                await this.syncCategoriesService.syncCategories();
            return { message: "Categories synced successfully", categories };
        } catch (error) {
            console.error(
                "Error syncing categories:",
                (error as Error).message
            );
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: "Failed to sync categories",
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("sync-attributes")
    async syncAttributes() {
        try {
            await this.syncAttributesService.syncAttributes();
            return { message: "Attributes synced successfully" };
        } catch (error) {
            console.error(
                "Error syncing attributes:",
                (error as Error).message
            );
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: "Failed to sync attributes",
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("fetch-suppliers")
    async fetchSuppliers(): Promise<{ suppliers: Supplier[]; count: number }> {
        const suppliers =
            await this.fetchAllSuppliersUseCase.fetchAllSuppliers();
        return { suppliers, count: suppliers.length };
    }
}
