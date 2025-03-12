import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";

import { BrandController } from "./controllers/brand.controller";
import { CategoryController } from "./controllers/category.controller";
import { ColorsController } from "./controllers/color.controller";
import { ListAllAccountsController } from "./controllers/list-all-accounts.controller";

import { ProductController } from "./controllers/product.controller";
import { SizeController } from "./controllers/size.controller";
import { CreateBrandUseCase } from "@/domain/catalog/application/use-cases/create-brand";
import { CreateCategoryUseCase } from "@/domain/catalog/application/use-cases/create-category";
import { CreateColorUseCase } from "@/domain/catalog/application/use-cases/create-color";

import { CreateProductUseCase } from "@/domain/catalog/application/use-cases/create-product";
import { CreateProductColorUseCase } from "@/domain/catalog/application/use-cases/create-product-color";
import { EditBrandUseCase } from "@/domain/catalog/application/use-cases/edit-brand";
import { EditCategoryUseCase } from "@/domain/catalog/application/use-cases/edit-category";
import { EditColorUseCase } from "@/domain/catalog/application/use-cases/edit-color";
import { CreateSizeUseCase } from "@/domain/catalog/application/use-cases/create-size";

import { EditSizeUseCase } from "@/domain/catalog/application/use-cases/edit-size";
import { DeleteBrandUseCase } from "@/domain/catalog/application/use-cases/delete-brand";

import { DeleteColorUseCase } from "@/domain/catalog/application/use-cases/delete-color";
import { DeleteSizeUseCase } from "@/domain/catalog/application/use-cases/delete-size";
import { DeleteCategoryUseCase } from "@/domain/catalog/application/use-cases/delete-category";
import { FindBrandByIdUseCase } from "@/domain/catalog/application/use-cases/find-brand-by-id";

import { FindColorByIdUseCase } from "@/domain/catalog/application/use-cases/find-color-by-id";
import { FindSizeByIdUseCase } from "@/domain/catalog/application/use-cases/find-size-by-id";
import { FindCategoryByIdUseCase } from "@/domain/catalog/application/use-cases/find-category-by-id";
import { FindBrandByNameUseCase } from "@/domain/catalog/application/use-cases/find-brand-by-name";

import { FindColorByNameUseCase } from "@/domain/catalog/application/use-cases/find-color-by-name";
import { FindCategoryByNameUseCase } from "@/domain/catalog/application/use-cases/find-category-by-name";
import { GetAllBrandsUseCase } from "@/domain/catalog/application/use-cases/get-all-brands";

import { GetAllColorsUseCase } from "@/domain/catalog/application/use-cases/get-all-colors";
import { GetAllSizesUseCase } from "@/domain/catalog/application/use-cases/get-all-sizes";
import { GetAllCategoriesUseCase } from "@/domain/catalog/application/use-cases/get-all-categories";

import { ApiController } from "./controllers/api.controller";
import { ApiGetAllProducts } from "@/domain/catalog/application/use-cases/api-all-products";
import { CreateProductSizeUseCase } from "@/domain/catalog/application/use-cases/create-product-size";
import { CreateProductCategoryUseCase } from "@/domain/catalog/application/use-cases/create-product-category";
import { AccountController } from "./controllers/account.controller";
import { CreateAccountUseCase } from "@/domain/auth/application/use-cases/create-account";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateGoogleAccountUseCase } from "@/domain/auth/application/use-cases/create-account-with-google";
import { AddressController } from "./controllers/address.controller";
import { CreateAddressUseCase } from "@/domain/auth/application/use-cases/create-address";
import { CartController } from "./controllers/cart.controller";
import { CreateCartUseCase } from "@/domain/order/application/use-cases/create-cart";
import { AuthModule } from "@/auth/auth.module";

import { EditProductUseCase } from "@/domain/catalog/application/use-cases/edit-product";
import { GetProductBySlugUseCase } from "@/domain/catalog/application/use-cases/get-product-by-slug";
import { GetProductsByCategoryIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-category";
import { FindProductByNameUseCase } from "@/domain/catalog/application/use-cases/find-all-products-by-name";
import { GetProductsByBrandIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-brand";
import { GetProductsByColorIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-color";
import { GetProductsBySizeIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-size";
import { GetProductsByPriceRangeUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-price-range";

import { GetProductByIdUseCase } from "@/domain/catalog/application/use-cases/get-product-by-id";
import { UpdateProductVariantUseCase } from "@/domain/catalog/application/use-cases/update-product-variant-use-case";
import { EditAddressUseCase } from "@/domain/auth/application/use-cases/edit-adress";
import { FindAddressesByUserIdUseCase } from "@/domain/auth/application/use-cases/get-adress-by-user-id";
import { DeleteAddressUseCase } from "@/domain/auth/application/use-cases/delete-adress";
import { EditAccountUseCase } from "@/domain/auth/application/use-cases/edit-account";
import { FindAccountByIdUseCase } from "@/domain/auth/application/use-cases/find-user-by-id";
import { SyncCategoriesUseCase } from "./api-erp/fechAllCategoriesFromErp";
import { SyncAttributesUseCase } from "./api-erp/fechAllColorESizesFromErp";
import { AddItemToCartUseCase } from "@/domain/order/application/use-cases/add-item-cart";
import { CheckCartExistsUseCase } from "@/domain/order/application/use-cases/check-cart-exists";
import { DeleteItemFromCartUseCase } from "@/domain/order/application/use-cases/delete-item-cart";
import { GetCartByUserUseCase } from "@/domain/order/application/use-cases/get-Cart-ByUserId";
import { UpdateItemQuantityInCartUseCase } from "@/domain/order/application/use-cases/update-quantity-item";
import { VerifyEmailUseCase } from "@/domain/auth/application/use-cases/verify-email";
import { MailerService } from "@/domain/auth/application/use-cases/mailer.service";
import { ResetPasswordUseCase } from "@/domain/auth/application/use-cases/reset-password";
import { ForgotPasswordUseCase } from "@/domain/auth/application/use-cases/forgot-password";
import { CalculateShipmentUseCase } from "@/domain/order/application/use-cases/calculate-shipping";
import { SaveShippingUseCase } from "@/domain/order/application/use-cases/create-shipping";
import { ShippingController } from "./controllers/shipping.controller";
import { MercadoPagoService } from "@/domain/order/application/use-cases/payment.service";
import { CreateOrderUseCase } from "@/domain/order/application/use-cases/create-order";
import { FindCartByPreferenceIdUseCase } from "@/domain/order/application/use-cases/find-cart-bt-preferenceId";
import { MigrationController } from "./controllers/migration.controller";
import { ProductMigrationService } from "@/migrate-products";
import { FetchAllSuppliersUseCase } from "./api-erp/fetchAllSupplierUseCase";
import { ArchiveCartUseCase } from "@/domain/order/application/use-cases/archiveCart";
import { DeleteCartUseCase } from "@/domain/order/application/use-cases/delete-cart";
import { OrderController } from "./controllers/order.controller";
import { ListAllOrdersUseCase } from "@/domain/order/application/use-cases/get-all-orders";
import { GetAllProductsUseCase } from "@/domain/catalog/application/use-cases/get-all-products";
import { AddCategoriesToProductUseCase } from "@/domain/catalog/application/use-cases/add-category-to-product";
import { GetFeaturedProductsUseCase } from "@/domain/catalog/application/use-cases/get-featured-products";
import { GetCategoriesWithProductsUseCase } from "@/domain/catalog/application/use-cases/get-all-categories-with-product";
import { ListOrdersByUserUseCase } from "@/domain/order/application/use-cases/list-order-by-user";
import { FindOrderByIdUseCase } from "@/domain/order/application/use-cases/find-order-by-id";
import { CustomerController } from "./controllers/customer-controller";
import { ListAllCustomersUseCase } from "@/domain/costumer/apllication/use-cases/list-all-customers";
import { FindCustomerByIdUseCase } from "@/domain/costumer/apllication/use-cases/find-customer-by-id";
import { CreateCustomerUseCase } from "@/domain/costumer/apllication/use-cases/create-customer";
import { FindOrdersByProductUseCase } from "@/domain/order/application/use-cases/find-all-orders-by-products";
import { FindOrdersByCategoryUseCase } from "@/domain/order/application/use-cases/find-all-orders-by-categories";
import { FindOrdersByBrandUseCase } from "@/domain/order/application/use-cases/find-all-orders-by-brand";
import { FindTopSellingBrandsByTotalValueUseCase } from "@/domain/order/application/use-cases/find-top-brands-selling";
import { FindTopSellingCategoriesByTotalValueUseCase } from "@/domain/order/application/use-cases/find-top-categories-selling-by-values";
import { FindTopSellingProductsByTotalValueUseCase } from "@/domain/order/application/use-cases/find-top-selling-product-by-value";
import { AuthMelhorEnvioUseCase } from "@/domain/order/application/use-cases/melhor-envio-auth";
// import { AuthenticateController } from "./controllers/authenticate.controller";

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [
        BrandController,
        CategoryController,
        ColorsController,
        ListAllAccountsController,
        // AuthenticateController,

        ProductController,
        SizeController,
        ApiController,
        AccountController,
        CartController,
        AddressController,
        ShippingController,
        MigrationController,
        OrderController,
        CustomerController,
    ],
    providers: [
        JwtService,
        PrismaService,
        AuthMelhorEnvioUseCase,
        CreateBrandUseCase,

        CreateColorUseCase,
        CreateSizeUseCase,
        CreateCategoryUseCase,

        CreateProductUseCase,
        CreateProductColorUseCase,
        CreateProductSizeUseCase,
        CreateProductCategoryUseCase,

        EditBrandUseCase,

        EditColorUseCase,
        EditSizeUseCase,
        EditCategoryUseCase,
        EditProductUseCase,
        EditAddressUseCase,
        EditAccountUseCase,

        DeleteBrandUseCase,

        DeleteColorUseCase,
        DeleteSizeUseCase,
        DeleteCategoryUseCase,
        DeleteAddressUseCase,
        DeleteCartUseCase,

        FindBrandByIdUseCase,

        FindColorByIdUseCase,
        FindSizeByIdUseCase,
        FindCategoryByIdUseCase,
        FindAddressesByUserIdUseCase,
        FindAccountByIdUseCase,

        FindBrandByNameUseCase,

        FindColorByNameUseCase,
        FindCategoryByNameUseCase,

        GetProductBySlugUseCase,

        VerifyEmailUseCase,
        MailerService,
        ResetPasswordUseCase,
        ForgotPasswordUseCase,

        GetAllBrandsUseCase,

        GetAllColorsUseCase,
        GetAllSizesUseCase,
        GetAllCategoriesUseCase,
        GetCategoriesWithProductsUseCase,
        GetAllProductsUseCase,
        GetProductsByCategoryIdUseCase,
        GetProductsByBrandIdUseCase,
        GetProductsByColorIdUseCase,
        GetProductsBySizeIdUseCase,
        GetProductsByPriceRangeUseCase,
        GetFeaturedProductsUseCase,

        GetProductByIdUseCase,
        FindProductByNameUseCase,
        UpdateProductVariantUseCase,

        AddItemToCartUseCase,
        CheckCartExistsUseCase,
        DeleteItemFromCartUseCase,
        GetCartByUserUseCase,
        UpdateItemQuantityInCartUseCase,

        CalculateShipmentUseCase,
        SaveShippingUseCase,
        MercadoPagoService,

        ApiGetAllProducts,
        SyncCategoriesUseCase,
        SyncAttributesUseCase,

        CreateAccountUseCase,
        CreateGoogleAccountUseCase,

        CreateOrderUseCase,
        FindCartByPreferenceIdUseCase,

        CreateAddressUseCase,

        CreateCartUseCase,
        ArchiveCartUseCase,

        ProductMigrationService,
        FetchAllSuppliersUseCase,

        AddCategoriesToProductUseCase,

        ListAllOrdersUseCase,
        ListOrdersByUserUseCase,
        FindOrderByIdUseCase,
        FindOrdersByProductUseCase,
        FindOrdersByCategoryUseCase,
        FindOrdersByBrandUseCase,
        FindTopSellingBrandsByTotalValueUseCase,
        FindTopSellingCategoriesByTotalValueUseCase,
        FindTopSellingProductsByTotalValueUseCase,

        ListAllCustomersUseCase,
        FindCustomerByIdUseCase,
        CreateCustomerUseCase,
        
    ],
})
export class HttpModule {}
