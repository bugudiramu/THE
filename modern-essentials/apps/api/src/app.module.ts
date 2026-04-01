import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CartModule } from "./modules/cart/cart.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { CheckoutModule } from "./modules/checkout/checkout.module";
import { SubscriptionModule } from "./modules/subscription/subscription.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { BullModule } from "@nestjs/bullmq";
import { JobsModule } from "./jobs/jobs.module";
import { PrismaModule } from "./common/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    CatalogModule,
    CartModule,
    CheckoutModule,
    SubscriptionModule,
    NotificationsModule,
    WebhooksModule,
    OrdersModule,
    InventoryModule,
    JobsModule,
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || "redis://localhost:6379",
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
