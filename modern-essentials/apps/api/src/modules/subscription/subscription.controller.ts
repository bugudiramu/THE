import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ClerkAuthGuard } from "../../common/guards/clerk-auth.guard";
import {
  CancelSubscriptionDto,
  ChangeAddressDto,
  ChangeFrequencyDto,
  ChangeQuantityDto,
  CreateSubscriptionDto,
  PauseSubscriptionDto,
  SwapProductDto,
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

  @Patch(":id/pause")
  async pauseSubscription(
    @Req() req: any,
    @Param("id") id: string,
    @Body() pauseDto: PauseSubscriptionDto,
  ) {
    return this.subscriptionService.pauseSubscription(id, req.user.id, pauseDto);
  }

  @Patch(":id/resume")
  async resumeSubscription(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    return this.subscriptionService.resumeSubscription(id, req.user.id);
  }

  @Patch(":id/skip")
  async skipNextDelivery(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    return this.subscriptionService.skipNextDelivery(id, req.user.id);
  }

  @Patch(":id/frequency")
  async changeFrequency(
    @Req() req: any,
    @Param("id") id: string,
    @Body() freqDto: ChangeFrequencyDto,
  ) {
    return this.subscriptionService.changeFrequency(id, req.user.id, freqDto);
  }

  @Patch(":id/quantity")
  async changeQuantity(
    @Req() req: any,
    @Param("id") id: string,
    @Body() qtyDto: ChangeQuantityDto,
  ) {
    return this.subscriptionService.changeQuantity(id, req.user.id, qtyDto);
  }

  @Patch(":id/address")
  async changeAddress(
    @Req() req: any,
    @Param("id") id: string,
    @Body() addrDto: ChangeAddressDto,
  ) {
    return this.subscriptionService.changeAddress(id, req.user.id, addrDto);
  }

  @Patch(":id/product")
  async swapProduct(
    @Req() req: any,
    @Param("id") id: string,
    @Body() swapDto: SwapProductDto,
  ) {
    return this.subscriptionService.swapProduct(id, req.user.id, swapDto);
  }

  @Post(":id/cancel")
  async cancelSubscription(
    @Req() req: any,
    @Param("id") id: string,
    @Body() cancelDto: CancelSubscriptionDto,
  ) {
    return this.subscriptionService.cancelSubscription(id, req.user.id, cancelDto);
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
