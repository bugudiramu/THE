import { Module, OnModuleInit } from "@nestjs/common";
import { BullModule, InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { SubscriptionRenewalProcessor } from "./subscription-renewal.job";
import { NotificationDispatchProcessor } from "./notification-dispatch.job";
import { NotificationsModule } from "../modules/notifications/notifications.module";
import { SubscriptionModule } from "../modules/subscription/subscription.module";

@Module({
  imports: [
    BullModule.registerQueue(
      { name: "subscription-renewal" },
      { name: "notifications" },
    ),
    BullBoardModule.forRoot({
      route: "/admin/queues",
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature(
      {
        name: "subscription-renewal",
        adapter: BullMQAdapter,
      },
      {
        name: "notifications",
        adapter: BullMQAdapter,
      },
    ),
    NotificationsModule,
    SubscriptionModule,
  ],
  providers: [
    SubscriptionRenewalProcessor,
    NotificationDispatchProcessor,
  ],
})
export class JobsModule implements OnModuleInit {
  constructor(
    @InjectQueue("subscription-renewal") private renewalQueue: Queue,
  ) {}

  async onModuleInit() {
    // Register daily renewal job at 00:01
    await this.renewalQueue.add(
      "daily-renewal",
      {},
      {
        repeat: {
          pattern: "1 0 * * *", // 00:01 every day
        },
        removeOnComplete: true,
      },
    );
  }
}
