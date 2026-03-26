import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { OrderStatusAction } from "./orders.dto";

// Legal status transitions for the ops team
// Key = current status, Value = allowed next statuses
const VALID_TRANSITIONS: Record<string, string[]> = {
  PAID: ["PICKED", "CANCELLED"],
  PICKED: ["PACKED", "CANCELLED"],
  PACKED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
  // Terminal states: DELIVERED, CANCELLED, REFUNDED — no further transitions
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get today's orders with optional status filter.
   */
  async getTodayOrders(status?: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const where: Record<string, unknown> = {
      placedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (status) {
      where.status = status;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: {
        placedAt: "desc",
      },
    });

    return orders;
  }

  /**
   * Get status counts for today's orders.
   */
  async getStatusCounts() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const counts = await this.prisma.order.groupBy({
      by: ["status"],
      where: {
        placedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _count: {
        status: true,
      },
    });

    // Transform to a clean map
    const statusMap: Record<string, number> = {
      PENDING: 0,
      PAID: 0,
      PICKED: 0,
      PACKED: 0,
      DISPATCHED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      PAYMENT_FAILED: 0,
      REFUNDED: 0,
    };

    for (const row of counts) {
      statusMap[row.status] = row._count.status;
    }

    const total = Object.values(statusMap).reduce((sum, v) => sum + v, 0);

    return { counts: statusMap, total };
  }

  /**
   * Get a single order by ID with full details.
   */
  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return order;
  }

  /**
   * Transition order status with validation.
   * Enforces legal transitions only (see VALID_TRANSITIONS map).
   */
  async transitionStatus(orderId: string, newStatus: OrderStatusAction, note?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const currentStatus = order.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];

    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. ` +
          `Allowed: ${allowedTransitions?.join(", ") || "none (terminal state)"}`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
      },
    });

    this.logger.log(
      `Order ${orderId}: ${currentStatus} → ${newStatus}${note ? ` (${note})` : ""}`,
    );

    return updatedOrder;
  }

  /**
   * Generate FEFO-sorted pick list for today's PAID orders.
   * Maps order items to inventory batches, sorted by expires_at ASC.
   *
   * CRITICAL: ORDER BY expires_at ASC is non-negotiable (FEFO rule §7.1)
   */
  async getPickList() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's orders that need picking (PAID status)
    const orders = await this.prisma.order.findMany({
      where: {
        placedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "PAID",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    // Get available inventory batches sorted by FEFO
    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        status: "AVAILABLE",
        qcStatus: "PASS",
        qty: { gt: 0 },
      },
      orderBy: {
        expiresAt: "asc", // FEFO: First Expired, First Out — NON-NEGOTIABLE
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    // Build pick list: map each order item to the soonest-expiring batch
    const pickListItems: Array<{
      orderId: string;
      productId: string;
      productSku: string;
      productName: string;
      qtyNeeded: number;
      batchId: string;
      binLocation: string | null;
      expiresAt: Date;
    }> = [];

    for (const order of orders) {
      for (const item of order.items) {
        // Find matching batches for this product (already FEFO sorted)
        const matchingBatches = batches.filter(
          (b) => b.productId === item.productId,
        );

        if (matchingBatches.length > 0) {
          // Use the soonest-expiring batch (index 0 since sorted ASC)
          const batch = matchingBatches[0];
          pickListItems.push({
            orderId: order.id,
            productId: item.productId,
            productSku: item.product.sku,
            productName: item.product.name,
            qtyNeeded: item.qty,
            batchId: batch.id,
            binLocation: batch.locationId,
            expiresAt: batch.expiresAt,
          });
        } else {
          // No batch available — flag it
          pickListItems.push({
            orderId: order.id,
            productId: item.productId,
            productSku: item.product.sku,
            productName: item.product.name,
            qtyNeeded: item.qty,
            batchId: "NO_STOCK",
            binLocation: null,
            expiresAt: new Date(0),
          });
        }
      }
    }

    // Sort final list by product SKU for picking efficiency, then by expiry
    pickListItems.sort((a, b) => {
      if (a.productSku !== b.productSku) {
        return a.productSku.localeCompare(b.productSku);
      }
      return a.expiresAt.getTime() - b.expiresAt.getTime();
    });

    return {
      generatedAt: new Date(),
      orderCount: orders.length,
      items: pickListItems,
    };
  }

  /**
   * Generate dispatch manifest: orders grouped by delivery area.
   * Shows PACKED orders ready for handoff to couriers.
   */
  async getDispatchManifest() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        placedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "PACKED",
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: {
        placedAt: "asc",
      },
    });

    // Group orders for the manifest
    // Note: Address model not yet in schema, so we generate a flat manifest
    const manifestItems = orders.map((order) => ({
      orderId: order.id,
      customerPhone: order.user.phone,
      customerEmail: order.user.email,
      items: order.items.map((item) => ({
        productName: item.product.name,
        sku: item.product.sku,
        qty: item.qty,
      })),
      total: order.total,
      type: order.type,
    }));

    return {
      generatedAt: new Date(),
      orderCount: orders.length,
      orders: manifestItems,
    };
  }
}
