import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue("notifications") private notificationsQueue: Queue,
  ) {}

  async sendEmail(to: string, template: string, data: any) {
    await this.notificationsQueue.add("email", { to, template, data });
  }

  async sendWhatsApp(phone: string, template: string, data: any) {
    await this.notificationsQueue.add("whatsapp", { phone, template, data });
  }
}
