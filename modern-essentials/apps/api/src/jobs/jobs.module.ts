import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { SubscriptionRenewalProcessor } from "./subscription-renewal.job";
import { NotificationDispatchProcessor } from "./notification-dispatch.job";
import { NotificationsModule } from "../modules/notifications/notifications.module";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "subscription-renewal",
    }),
    NotificationsModule,
  ],
  providers: [
    SubscriptionRenewalProcessor,
    NotificationDispatchProcessor,
  ],
})
export class JobsModule {}
