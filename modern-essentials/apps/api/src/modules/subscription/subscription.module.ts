import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { SubscriptionController } from "./subscription.controller";
import { AdminSubscriptionController } from "./admin-subscription.controller";
import { SubscriptionService } from "./subscription.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    NotificationsModule,
    BullModule.registerQueue({
      name: "dunning",
    }),
  ],
  controllers: [SubscriptionController, AdminSubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
