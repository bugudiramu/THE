import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ClerkAuthGuard } from "../../common/guards/clerk-auth.guard";
import { CreateOrderDto } from "./checkout.dto";
import { CheckoutService } from "./checkout.service";

@Controller("checkout")
@UseGuards(ClerkAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post("create-order")
  async createOrder(
    @CurrentUser() user: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.checkoutService.createOrder(user.id, createOrderDto);
  }

  @Post("verify-payment")
  async verifyPayment(@CurrentUser() user: any, @Body() paymentData: any) {
    return this.checkoutService.verifyPayment({
      ...paymentData,
      userId: user.id,
    });
  }

  // Subscription endpoints from POC
  @Post("create-subscription-plan")
  async createSubscriptionPlan(
    @Body()
    body: {
      name: string;
      amount: number;
      interval: "weekly" | "monthly";
    },
  ) {
    return this.checkoutService.createSubscriptionPlan(
      body.name,
      body.amount,
      body.interval,
    );
  }

  @Post("create-subscription")
  async createSubscription(
    @CurrentUser() user: any,
    @Body() body: { planId: string },
  ) {
    return this.checkoutService.createSubscription(body.planId, user.id);
  }

  @Post("cancel-subscription")
  async cancelSubscription(@Body() body: { subscriptionId: string }) {
    return this.checkoutService.cancelSubscription(body.subscriptionId);
  }

  @Post("pause-subscription")
  async pauseSubscription(@Body() body: { subscriptionId: string }) {
    return this.checkoutService.pauseSubscription(body.subscriptionId);
  }

  @Post("resume-subscription")
  async resumeSubscription(@Body() body: { subscriptionId: string }) {
    return this.checkoutService.resumeSubscription(body.subscriptionId);
  }
}
