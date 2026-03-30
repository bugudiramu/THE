import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ClerkAuthGuard } from "../../common/guards/clerk-auth.guard";
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from "./subscription.dto";
import { SubscriptionService } from "./subscription.service";

@Controller("subscriptions")
@UseGuards(ClerkAuthGuard)
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Post()
  async createSubscription(
    @Req() req: any,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    const userId = req.user.id;
    return this.subscriptionService.createSubscription(
      userId,
      createSubscriptionDto,
    );
  }

  @Get()
  async getUserSubscriptions(@Req() req: any) {
    const userId = req.user.id;
    return this.subscriptionService.getUserSubscriptions(userId);
  }

  @Post(":id/pause")
  async pauseSubscription(
    @Req() req: any,
    @Param("id") subscriptionId: string,
    @Body() body: { durationWeeks: number },
  ) {
    const userId = req.user.id;
    return this.subscriptionService.pauseSubscription(
      userId,
      subscriptionId,
      body.durationWeeks,
    );
  }

  @Post(":id/resume")
  async resumeSubscription(
    @Req() req: any,
    @Param("id") subscriptionId: string,
  ) {
    const userId = req.user.id;
    return this.subscriptionService.resumeSubscription(userId, subscriptionId);
  }

  @Post(":id/cancel")
  async cancelSubscription(
    @Req() req: any,
    @Param("id") subscriptionId: string,
  ) {
    const userId = req.user.id;
    return this.subscriptionService.cancelSubscription(userId, subscriptionId);
  }

  @Post(":id/update")
  async updateSubscription(
    @Req() req: any,
    @Param("id") subscriptionId: string,
    @Body() updateDto: UpdateSubscriptionDto,
  ) {
    const userId = req.user.id;
    return this.subscriptionService.updateSubscription(
      userId,
      subscriptionId,
      updateDto,
    );
  }
}
