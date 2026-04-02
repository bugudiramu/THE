import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue("notifications") private notificationsQueue: Queue,
  ) {}

  async sendOrderConfirmation(email: string, phone: string, orderData: any) {
    // Send both Email and WhatsApp
    await this.sendEmail(email, "order_confirmation", { order: orderData });
    await this.sendWhatsApp(phone, "order_confirmation", { 
      orderId: orderData.id,
      customerName: orderData.userName 
    });
  }

  async sendOrderDispatched(email: string, phone: string, orderData: any) {
    await this.sendEmail(email, "order_dispatched", { order: orderData });
    await this.sendWhatsApp(phone, "order_dispatched", { 
      orderId: orderData.id,
      trackingUrl: orderData.trackingUrl || "#" 
    });
  }

  async sendOrderDelivered(email: string, phone: string, orderData: any) {
    await this.sendEmail(email, "order_delivered", { order: orderData });
    await this.sendWhatsApp(phone, "order_delivered", { orderId: orderData.id });
  }

  async sendWelcomeEmail(email: string, userName: string) {
    await this.sendEmail(email, "welcome", { name: userName });
  }

  async sendDunningRetry1(email: string, phone: string, name: string, updatePaymentUrl: string) {
    await this.sendEmail(email, "dunning_retry1", { name, updatePaymentUrl });
    await this.sendWhatsApp(phone, "dunning_retry1", { name, updatePaymentUrl });
  }

  async sendDunningRetry2(phone: string, name: string, updatePaymentUrl: string) {
    await this.sendWhatsApp(phone, "dunning_retry2", { name, updatePaymentUrl });
  }

  async sendDunningRetry3(email: string, phone: string, name: string, updatePaymentUrl: string) {
    await this.sendEmail(email, "dunning_retry3", { name, updatePaymentUrl });
    await this.sendWhatsApp(phone, "dunning_retry3", { name, updatePaymentUrl });
  }

  async sendSubscriptionCancelled(email: string, name: string, reactivationUrl: string) {
    await this.sendEmail(email, "subscription_cancelled", { name, reactivationUrl });
  }

  async sendEmail(to: string, template: string, data: any) {
    await this.notificationsQueue.add("email", { to, template, data });
  }

  async sendWhatsApp(phone: string, template: string, data: any) {
    await this.notificationsQueue.add("whatsapp", { phone, template, data });
  }
}
