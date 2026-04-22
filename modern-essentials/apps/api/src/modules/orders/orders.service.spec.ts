import { Test, TestingModule } from "@nestjs/testing";
import { OrdersService } from "./orders.service";
import { PrismaService } from "../../common/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { BadRequestException } from "@nestjs/common";
import { OrderStatusAction } from "./orders.dto";

describe("OrdersService - Perishable Restock Trap", () => {
  let service: OrdersService;

  const mockOrder = {
    id: "order_1",
    status: "PAID",
    userId: "user_1",
    items: [
      { id: "item_1", variantId: "var_1", qty: 2 },
    ],
    user: { email: "test@example.com", phone: "1234567890" },
  };

  const mockPrisma: any = {
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    inventoryBatch: {
      update: jest.fn(),
    },
    wastageLog: {
      create: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockNotificationsService = {
    sendOrderDispatched: jest.fn(),
    sendOrderDelivered: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe("transitionStatus to CANCELLED", () => {
    it("should restock inventory when cancelling a PAID order", async () => {
      const order = { ...mockOrder, status: "PAID" };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.$queryRaw.mockResolvedValue([{ id: "batch_1", qty: 10 }]);
      mockPrisma.order.update.mockResolvedValue({ ...order, status: "CANCELLED" });

      await service.transitionStatus("order_1", OrderStatusAction.CANCELLED);

      // Verify restocking logic
      expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining("SELECT id, qty FROM inventory_batches")]),
        "var_1",
      );
      expect(mockPrisma.inventoryBatch.update).toHaveBeenCalledWith({
        where: { id: "batch_1" },
        data: { qty: { increment: 2 } },
      });
      expect(mockPrisma.wastageLog.create).not.toHaveBeenCalled();
    });

    it("should log wastage when cancelling a PACKED order", async () => {
      const order = { ...mockOrder, status: "PACKED" };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.order.update.mockResolvedValue({ ...order, status: "CANCELLED" });

      await service.transitionStatus("order_1", OrderStatusAction.CANCELLED);

      // Verify wastage logic
      expect(mockPrisma.inventoryBatch.update).not.toHaveBeenCalled();
      expect(mockPrisma.wastageLog.create).toHaveBeenCalledWith({
        data: {
          variantId: "var_1",
          qty: 2,
          reason: "CUSTOMER_RETURN",
          loggedBy: "SYSTEM",
          notes: expect.stringContaining("Order order_1 cancelled from status PACKED"),
        },
      });
    });

    it("should log wastage when cancelling a DISPATCHED order", async () => {
      const order = { ...mockOrder, status: "DISPATCHED" };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.order.update.mockResolvedValue({ ...order, status: "CANCELLED" });

      await service.transitionStatus("order_1", OrderStatusAction.CANCELLED);

      // Verify wastage logic
      expect(mockPrisma.inventoryBatch.update).not.toHaveBeenCalled();
      expect(mockPrisma.wastageLog.create).toHaveBeenCalledWith({
        data: {
          variantId: "var_1",
          qty: 2,
          reason: "CUSTOMER_RETURN",
          loggedBy: "SYSTEM",
          notes: expect.stringContaining("Order order_1 cancelled from status DISPATCHED"),
        },
      });
    });

    it("should fallback to wastage if no valid batch is found for restocking", async () => {
      const order = { ...mockOrder, status: "PAID" };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.$queryRaw.mockResolvedValue([]); // No batch found
      mockPrisma.order.update.mockResolvedValue({ ...order, status: "CANCELLED" });

      await service.transitionStatus("order_1", OrderStatusAction.CANCELLED);

      // Verify fallback logic
      expect(mockPrisma.inventoryBatch.update).not.toHaveBeenCalled();
      expect(mockPrisma.wastageLog.create).toHaveBeenCalledWith({
        data: {
          variantId: "var_1",
          qty: 2,
          reason: "OTHER",
          loggedBy: "SYSTEM",
          notes: expect.stringContaining("Restock failed during cancellation of Order order_1: No valid batches found"),
        },
      });
    });
  });

  describe("transitionStatus validation", () => {
    it("should allow transition from DISPATCHED to CANCELLED", async () => {
      const order = { ...mockOrder, status: "DISPATCHED" };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.order.update.mockResolvedValue({ ...order, status: "CANCELLED" });

      await service.transitionStatus("order_1", OrderStatusAction.CANCELLED);

      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: "CANCELLED" },
        }),
      );
    });

    it("should not allow transition from DELIVERED to CANCELLED", async () => {
      const order = { ...mockOrder, status: "DELIVERED" };
      mockPrisma.order.findUnique.mockResolvedValue(order);

      await expect(service.transitionStatus("order_1", OrderStatusAction.CANCELLED))
        .rejects.toThrow(BadRequestException);
    });
  });
});

