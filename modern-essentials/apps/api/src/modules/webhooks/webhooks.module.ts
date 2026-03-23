import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { SubscriptionModule } from "../subscription/subscription.module";

@Module({
  imports: [SubscriptionModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, PrismaService],
})
export class WebhooksModule {}
