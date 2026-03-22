import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CartModule } from "./modules/cart/cart.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { CheckoutModule } from "./modules/checkout/checkout.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    CatalogModule,
    CartModule,
    CheckoutModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
