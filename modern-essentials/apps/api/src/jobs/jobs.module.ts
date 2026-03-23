import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { SubscriptionRenewalProcessor } from "./subscription-renewal.job";
import { NotificationDispatchProcessor } from "./notification-dispatch.job";
import { PrismaService } from "../common/prisma.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "subscription-renewal",
    }),
  ],
  providers: [
    SubscriptionRenewalProcessor,
    NotificationDispatchProcessor,
    PrismaService,
  ],
})
export class JobsModule {}
