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
} from "./subscription.dto";
import { SubscriptionService } from "./subscription.service";

@Controller("subscriptions")
@UseGuards(ClerkAuthGuard)
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Post("create")
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

  @Get("mine")
  async getMySubscriptions(@Req() req: any) {
    const userId = req.user.id;
    return this.subscriptionService.findUserSubscriptions(userId);
  }

  @Get(":id")
  async getSubscriptionById(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    const userId = req.user.id;
    return this.subscriptionService.getSubscriptionById(userId, id);
  }

  @Post(":id/reactivate")
  async reactivateSubscription(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    const userId = req.user.id;
    return this.subscriptionService.reactivate(id, userId);
  }

  // Support old endpoints for backward compatibility if needed, or just follow the plan
  @Post()
  async createSubscriptionLegacy(
    @Req() req: any,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.createSubscription(req, createSubscriptionDto);
  }

  @Get()
  async getUserSubscriptionsLegacy(@Req() req: any) {
    return this.getMySubscriptions(req);
  }
}
