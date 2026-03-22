import { BadRequestException, Injectable } from "@nestjs/common";
import Razorpay from "razorpay";
import { PrismaService } from "../../common/prisma.service";
import { CreateOrderDto, RazorpayOrderResponseDto } from "./checkout.dto";

@Injectable()
export class CheckoutService {
  private razorpay: Razorpay;

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<RazorpayOrderResponseDto> {
    // Calculate total amount
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    try {
      const options = {
        amount: totalAmount,
        currency: "INR",
        receipt: `receipt_${userId}_${Date.now()}`,
        payment_capture: 1, // Auto-capture payment
        notes: {
          userId,
          customerName: createOrderDto.name,
          customerPhone: createOrderDto.phone,
          customerAddress: createOrderDto.address,
          itemCount: createOrderDto.items.length,
        },
      };

      const razorpayOrder = await this.razorpay.orders.create(options);

      if (!razorpayOrder.id) {
        throw new BadRequestException("Failed to create Razorpay order");
      }

      return {
        razorpayOrderId: razorpayOrder.id,
        amount: Number(razorpayOrder.amount),
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID!,
        order: {
          id: razorpayOrder.id,
          amount: Number(razorpayOrder.amount),
          currency: razorpayOrder.currency,
        },
      };
    } catch (error) {
      console.error("Razorpay order creation failed:", error);
      throw new BadRequestException("Failed to create payment order");
    }
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    userId: string;
    orderData: CreateOrderDto;
  }) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      orderData,
    } = paymentData;

    try {
      // Verify signature using crypto
      const crypto = require("crypto");
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(text)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        throw new BadRequestException("Invalid payment signature");
      }

      // Create order in database
      const order = await this.prisma.order.create({
        data: {
          userId,
          status: "PAID",
          type: "ONE_TIME",
          total: orderData.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
          placedAt: new Date(),
        },
      });

      // Create order items
      for (const item of orderData.items) {
        await this.prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            qty: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          },
        });
      }

      // Clear user's cart
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
      });

      if (cart) {
        await this.prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      return {
        orderId: order.id,
        paymentId: razorpay_payment_id,
        amount: order.total,
        status: order.status,
      };
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw new BadRequestException("Payment verification failed");
    }
  }

  async createSubscriptionPlan(
    name: string,
    amount: number,
    interval: "weekly" | "monthly",
  ) {
    try {
      const period = interval === "weekly" ? "weekly" : "monthly";

      const plan = await this.razorpay.plans.create({
        period,
        interval: 1,
        item: {
          name,
          description: `${name} subscription`,
          amount: amount * 100, // Convert to paise
          currency: "INR",
        },
      });

      return plan;
    } catch (error) {
      console.error("Subscription plan creation failed:", error);
      throw new BadRequestException("Failed to create subscription plan");
    }
  }

  async createSubscription(planId: string, _customerId: string) {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12, // 12 billing cycles
      });

      return subscription;
    } catch (error) {
      console.error("Subscription creation failed:", error);
      throw new BadRequestException("Failed to create subscription");
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const result = await this.razorpay.subscriptions.cancel(subscriptionId);
      return result;
    } catch (error) {
      console.error("Subscription cancellation failed:", error);
      throw new BadRequestException("Failed to cancel subscription");
    }
  }

  async pauseSubscription(subscriptionId: string) {
    try {
      const pausedSubscription =
        await this.razorpay.subscriptions.pause(subscriptionId);
      return pausedSubscription;
    } catch (error) {
      console.error("Subscription pause failed:", error);
      throw new BadRequestException("Failed to pause subscription");
    }
  }

  async resumeSubscription(subscriptionId: string) {
    try {
      const resumedSubscription =
        await this.razorpay.subscriptions.resume(subscriptionId);
      return resumedSubscription;
    } catch (error) {
      console.error("Subscription resume failed:", error);
      throw new BadRequestException("Failed to resume subscription");
    }
  }
}
