import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { OrdersController } from "./orders.controller";
import { UserOrdersController } from "./user-orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [NotificationsModule],
  controllers: [OrdersController, UserOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
