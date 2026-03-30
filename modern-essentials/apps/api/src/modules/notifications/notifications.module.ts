import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { NotificationsService } from "./notifications.service";
import { EMAIL_ADAPTER } from "./adapters/email.adapter.interface";
import { MockEmailAdapter } from "./adapters/mock-email.adapter";
import { WHATSAPP_ADAPTER } from "./adapters/whatsapp.adapter.interface";
import { MockWhatsAppAdapter } from "./adapters/mock-whatsapp.adapter";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "notifications",
    }),
  ],
  providers: [
    NotificationsService,
    {
      provide: EMAIL_ADAPTER,
      useClass: MockEmailAdapter,
    },
    {
      provide: WHATSAPP_ADAPTER,
      useClass: MockWhatsAppAdapter,
    },
  ],
  exports: [
    NotificationsService,
    EMAIL_ADAPTER,
    WHATSAPP_ADAPTER,
  ],
})
export class NotificationsModule {}
