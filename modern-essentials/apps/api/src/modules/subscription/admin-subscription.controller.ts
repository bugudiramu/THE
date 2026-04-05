import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../../common/guards/admin.guard";
import { ClerkAuthGuard } from "../../common/guards/clerk-auth.guard";
import { AdminOverrideDto } from "./subscription.dto";
import { SubscriptionService } from "./subscription.service";

@Controller("admin/subscriptions")
@UseGuards(ClerkAuthGuard, AdminGuard)
export class AdminSubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get()
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("status") status?: string,
    @Query("userId") userId?: string,
  ) {
    return this.subscriptionService.findAllSubscriptions(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status,
      userId,
    );
  }

  @Post("override/:id")
  async override(
    @Req() req: any,
    @Param("id") id: string,
    @Body() overrideDto: AdminOverrideDto,
  ) {
    const adminId = req.user.id;
    return this.subscriptionService.adminOverride(id, overrideDto, adminId);
  }

  @Post("trigger-renewals")
  async triggerRenewals() {
    return this.subscriptionService.processRenewals();
  }
}
