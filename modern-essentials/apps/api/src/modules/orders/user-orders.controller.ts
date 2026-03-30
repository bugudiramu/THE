import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ClerkAuthGuard } from "../../common/guards/clerk-auth.guard";
import { OrdersService } from "./orders.service";

/**
 * Customer Orders Controller
 * 
 * Protected by ClerkAuthGuard - customers can only view their own orders.
 */
@Controller("orders")
@UseGuards(ClerkAuthGuard)
export class UserOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /orders
   * Returns current user's order history.
   */
  @Get()
  async getMyOrders(@Req() req: any) {
    const userId = req.user.id;
    return this.ordersService.getUserOrders(userId);
  }
}
