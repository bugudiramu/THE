import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ClerkAuthGuard } from "../../common/guards/clerk-auth.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
import { RequireAdmin } from "../../common/decorators/require-admin.decorator";
import { OrdersService } from "./orders.service";
import { UpdateOrderStatusDto } from "./orders.dto";

/**
 * Admin Orders Controller
 *
 * All endpoints are prefixed with /admin/orders.
 * Protected by ClerkAuthGuard and AdminGuard — ops/admin team only.
 */
@Controller("admin/orders")
@UseGuards(ClerkAuthGuard, AdminGuard)
@RequireAdmin()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /admin/orders/today
   * Returns today's orders with optional status filter.
   */
  @Get("today")
  async getTodayOrders(@Query("status") status?: string) {
    return this.ordersService.getTodayOrders(status);
  }

  /**
   * GET /admin/orders/status-counts
   * Returns status counts for today's orders (for dashboard cards).
   */
  @Get("status-counts")
  async getStatusCounts() {
    return this.ordersService.getStatusCounts();
  }

  /**
   * GET /admin/orders/pick-list
   * Returns FEFO-sorted pick list for today's PAID orders.
   * CRITICAL: Results are sorted by expires_at ASC (FEFO rule).
   */
  @Get("pick-list")
  async getPickList() {
    return this.ordersService.getPickList();
  }

  /**
   * GET /admin/orders/dispatch-manifest
   * Returns grouped dispatch manifest for PACKED orders.
   */
  @Get("dispatch-manifest")
  async getDispatchManifest() {
    return this.ordersService.getDispatchManifest();
  }

  /**
   * GET /admin/orders/:id
   * Returns a single order with full details.
   */
  @Get(":id")
  async getOrder(@Param("id") id: string) {
    return this.ordersService.getOrderById(id);
  }

  /**
   * PATCH /admin/orders/:id/status
   * Transition an order's status (validates legal FSM transitions).
   */
  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.transitionStatus(id, updateDto.status, updateDto.note);
  }
}
