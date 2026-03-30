import { BadRequestException, Injectable } from "@nestjs/common";
import Razorpay from "razorpay";
import { PrismaService } from "../../common/prisma.service";
import { CreateOrderDto, RazorpayOrderResponseDto, RazorpaySubscriptionResponseDto } from "./checkout.dto";

@Injectable()
export class CheckoutService {
  private razorpay: Razorpay;

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createSubscription(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<RazorpaySubscriptionResponseDto> {
    const subItems = createOrderDto.items.filter((item) => item.isSubscription);
    const oneTimeItems = createOrderDto.items.filter((item) => !item.isSubscription);

    if (subItems.length === 0) {
      throw new BadRequestException("No subscription items found in cart");
    }

    // Calculate recurring total (usually there's only one sub item type per order in simple D2C, 
    // but we support multiple by creating a custom plan name)
    const recurringAmount = subItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const upfrontAmount = oneTimeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      // 1. Get or Create a Razorpay Plan for this specific amount/frequency
      // Note: We use the first item's frequency as the primary frequency for simplicity
      const frequency = (subItems[0].frequency?.toLowerCase() || "weekly") as "weekly" | "monthly";
      const planName = `Modern Essentials ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Subscription - ₹${recurringAmount / 100}`;
      
      const razorpayPlan = await this.getOrCreateRazorpayPlan(planName, recurringAmount, frequency);

      // 2. Initiate the Razorpay Subscription
      const subscriptionOptions: any = {
        plan_id: razorpayPlan.id,
        customer_notify: 1,
        total_count: 52, // 1 year for weekly
        notes: {
          userId,
          isHybrid: upfrontAmount > 0 ? "true" : "false",
          upfrontAmount: upfrontAmount.toString(),
        },
      };

      // 3. Inject Upfront Addon for Hybrid Carts (§3.1)
      if (upfrontAmount > 0) {
        subscriptionOptions.addons = [
          {
            item: {
              name: "One-time Items Upfront",
              amount: upfrontAmount,
              currency: "INR",
            },
          },
        ];
      }

      const razorpaySubscription = await this.razorpay.subscriptions.create(subscriptionOptions);

      return {
        subscriptionId: razorpaySubscription.id,
        amount: Number(razorpaySubscription.charge_at) || (recurringAmount + upfrontAmount),
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID!,
        isHybrid: upfrontAmount > 0,
        upfrontAmount: upfrontAmount,
      };
    } catch (error) {
      console.error("Razorpay subscription creation failed:", error);
      throw new BadRequestException("Failed to initiate subscription mandate");
    }
  }

  private async getOrCreateRazorpayPlan(name: string, amount: number, interval: "weekly" | "monthly") {
    // In a production app, we would cache these in the DB or check if one exists.
    // For now, we create them dynamically as requested in the plan.
    return this.razorpay.plans.create({
      period: interval === "weekly" ? "weekly" : "monthly",
      interval: 1,
      item: {
        name,
        amount: amount,
        currency: "INR",
        description: "Modern Essentials Recurring Order",
      },
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
        receipt: `rcpt_${userId.slice(-10)}_${Date.now().toString().slice(-10)}`,
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
    razorpay_order_id?: string;
    razorpay_subscription_id?: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    userId: string;
    orderData: CreateOrderDto;
  }) {
    const {
      razorpay_order_id,
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      orderData,
    } = paymentData;

    try {
      // 1. Verify signature using crypto
      const crypto = require("crypto");
      const secret = process.env.RAZORPAY_KEY_SECRET!;
      
      // For subscriptions, the signature is based on payment_id + subscription_id
      // For orders, it's order_id + payment_id
      const text = razorpay_subscription_id 
        ? `${razorpay_payment_id}|${razorpay_subscription_id}`
        : `${razorpay_order_id}|${razorpay_payment_id}`;
      
      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(text)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        throw new BadRequestException("Invalid payment signature");
      }

      // 1.5 Ensure user exists in DB before transaction (Secondary safety check)
      const dbUser = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!dbUser) {
        console.error(`Checkout error: User with internal ID ${userId} not found in DB`);
        throw new BadRequestException("User profile not found. Please ensure you are logged in.");
      }

      return await this.prisma.$transaction(async (tx) => {
        // 2. Handle Subscription Items
        const subItems = orderData.items.filter(item => item.isSubscription);
        let subscriptionId: string | undefined;

        if (subItems.length > 0 && razorpay_subscription_id) {
          // We assume one primary subscription for now
          const primarySub = subItems[0];
          const frequency = (primarySub.frequency || 'WEEKLY') as any;

          const subscription = await tx.subscription.create({
            data: {
              userId: dbUser.id,
              productId: primarySub.productId,
              quantity: primarySub.quantity,
              frequency,
              status: 'ACTIVE',
              nextBillingAt: this.calculateNextBillingDate(frequency),
            },
          });
          
          subscriptionId = subscription.id;

          // Log subscription event
          await tx.subscriptionEvent.create({
            data: {
              subscriptionId: subscription.id,
              eventType: 'ACTIVATED',
              description: `Subscription activated via Razorpay ID: ${razorpay_subscription_id}`,
              metadata: { razorpay_subscription_id, razorpay_payment_id }
            }
          });
        }

        // 3. Handle One-Time Items (or Upfront Addons for hybrid carts)
        const oneTimeItems = orderData.items.filter(item => !item.isSubscription);
        let orderId: string | undefined;

        // Even if it's 100% subscription, the first delivery is an Order
        // If it's hybrid, oneTimeItems are also included here
        const itemsToOrder = [...oneTimeItems];
        if (subItems.length > 0) {
          itemsToOrder.push(...subItems);
        }

        if (itemsToOrder.length > 0) {
          const order = await tx.order.create({
            data: {
              userId: dbUser.id,
              subscriptionId, // Link to the sub if this is the first delivery
              razorpayOrderId: razorpay_order_id,
              status: "PAID",
              type: subItems.length > 0 ? "SUBSCRIPTION_RENEWAL" : "ONE_TIME", // First sub delivery is effectively a renewal type for fulfillment
              total: itemsToOrder.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              ),
              addressLine1: orderData.address,
              city: orderData.city,
              state: orderData.state,
              postalCode: (orderData as any).pincode, // Map from pincode in DTO
              placedAt: new Date(),
            },
          });
          orderId = order.id;

          // Create order items
          for (const item of itemsToOrder) {
            await tx.orderItem.create({
              data: {
                orderId: order.id,
                productId: item.productId,
                qty: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
              },
            });
          }
        }

        // 4. Clear user's cart (Atomically within transaction)
        const cart = await tx.cart.findUnique({ where: { userId: dbUser.id } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return {
          orderId,
          subscriptionId,
          paymentId: razorpay_payment_id,
          status: "SUCCESS",
        };
      });
    } catch (error: any) {
      console.error("Payment verification failed:", error);
      throw new BadRequestException(error.message || "Payment verification failed");
    }
  }

  private calculateNextBillingDate(frequency: string): Date {
    const date = new Date();
    if (frequency === 'WEEKLY') date.setDate(date.getDate() + 7);
    else if (frequency === 'FORTNIGHTLY') date.setDate(date.getDate() + 14);
    else if (frequency === 'MONTHLY') date.setMonth(date.getMonth() + 1);
    return date;
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
