import { Test, TestingModule } from "@nestjs/testing";
import { SubscriptionService, SubscriptionStatus } from "./subscription.service";
import { PrismaService } from "../../common/prisma.service";
import { BadRequestException } from "@nestjs/common";
import Razorpay from "razorpay";
import { NotificationsService } from "../notifications/notifications.service";
import { getQueueToken } from "@nestjs/bullmq";

jest.mock("razorpay");

describe("SubscriptionService FSM Transitions", () => {
  let service: SubscriptionService;

  const mockPrisma = {
    subscription: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    subscriptionEvent: {
      create: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
    },
  };

  const mockNotificationsService = {
    sendDunningRetry1: jest.fn(),
    sendDunningRetry2: jest.fn(),
    sendDunningRetry3: jest.fn(),
    sendSubscriptionCancelled: jest.fn(),
  };

  const mockDunningQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: getQueueToken("dunning"), useValue: mockDunningQueue },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    
    // Reset mocks
    jest.clearAllMocks();
    (Razorpay as any).mockImplementation(() => ({
      subscriptions: {
        cancel: jest.fn().mockResolvedValue({}),
        resume: jest.fn().mockResolvedValue({}),
        pause: jest.fn().mockResolvedValue({}),
      },
    }));
  });

  const mockSub = {
    id: "sub_1",
    status: SubscriptionStatus.PENDING,
    frequency: "WEEKLY",
    userId: "user_1",
    variantId: "var_1",
    razorpaySubscriptionId: "rzp_sub_1",
    variant: { 
      id: "var_1", 
      subPrice: 10000,
      product: { id: "prod_1", name: "Test Eggs" }
    },
    user: { email: "test@example.com", phone: "1234567890" },
    quantity: 1,
  };

  describe("transitionStatus", () => {
    it("Legal Transition: PENDING -> ACTIVE", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(mockSub);
      mockPrisma.subscription.update.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.ACTIVE });
      mockPrisma.productVariant.findUnique.mockResolvedValue(mockSub.variant);

      await service.transitionStatus("sub_1", SubscriptionStatus.ACTIVE);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "sub_1" },
        data: expect.objectContaining({
          status: SubscriptionStatus.ACTIVE,
          nextBillingAt: expect.any(Date),
        }),
      });
      expect(mockPrisma.order.create).toHaveBeenCalled();
    });

    it("Legal Transition: ACTIVE -> RENEWAL_DUE", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.ACTIVE });
      mockPrisma.subscription.update.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.RENEWAL_DUE });

      await service.transitionStatus("sub_1", SubscriptionStatus.RENEWAL_DUE);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "sub_1" },
        data: { status: SubscriptionStatus.RENEWAL_DUE },
      });
    });

    it("Legal Transition: RENEWAL_DUE -> ACTIVE", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.RENEWAL_DUE });
      mockPrisma.subscription.update.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.ACTIVE });
      mockPrisma.productVariant.findUnique.mockResolvedValue(mockSub.variant);

      await service.transitionStatus("sub_1", SubscriptionStatus.ACTIVE);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "sub_1" },
        data: expect.objectContaining({
          status: SubscriptionStatus.ACTIVE,
          nextBillingAt: expect.any(Date),
          dunningAttempt: 0,
        }),
      });
      expect(mockPrisma.order.create).toHaveBeenCalled();
    });

    it("Legal Transition: RENEWAL_DUE -> DUNNING", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.RENEWAL_DUE });
      mockPrisma.subscription.update.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.DUNNING });

      await service.transitionStatus("sub_1", SubscriptionStatus.DUNNING);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "sub_1" },
        data: expect.objectContaining({
          status: SubscriptionStatus.DUNNING,
          dunningAttempt: 1,
          dunningStartedAt: expect.any(Date),
        }),
      });
    });

    it("Legal Transition: DUNNING -> ACTIVE", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.DUNNING });
      mockPrisma.subscription.update.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.ACTIVE });
      mockPrisma.productVariant.findUnique.mockResolvedValue(mockSub.variant);

      await service.transitionStatus("sub_1", SubscriptionStatus.ACTIVE);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "sub_1" },
        data: expect.objectContaining({
          status: SubscriptionStatus.ACTIVE,
          nextBillingAt: expect.any(Date),
          dunningAttempt: 0,
        }),
      });
      expect(mockPrisma.order.create).toHaveBeenCalled();
    });

    it("Legal Transition: DUNNING -> CANCELLED", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.DUNNING });
      mockPrisma.subscription.update.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.CANCELLED });

      await service.transitionStatus("sub_1", SubscriptionStatus.CANCELLED, { reason: "Dunning failed" });

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "sub_1" },
        data: expect.objectContaining({
          status: SubscriptionStatus.CANCELLED,
          cancelReason: "Dunning failed",
        }),
      });
    });

    it("Legal Transition: ACTIVE -> PAUSED", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.ACTIVE });
      mockPrisma.subscription.update.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.PAUSED });

      const pauseUntil = new Date();
      await service.transitionStatus("sub_1", SubscriptionStatus.PAUSED, { pauseUntil });

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "sub_1" },
        data: expect.objectContaining({
          status: SubscriptionStatus.PAUSED,
          pauseUntil,
        }),
      });
    });

    it("Legal Transition: PAUSED -> ACTIVE", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.PAUSED });
      mockPrisma.subscription.update.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.ACTIVE });

      await service.transitionStatus("sub_1", SubscriptionStatus.ACTIVE);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "sub_1" },
        data: expect.objectContaining({
          status: SubscriptionStatus.ACTIVE,
          pauseUntil: null,
        }),
      });
    });

    it("Legal Transition: ACTIVE -> CANCELLED", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.ACTIVE });
      mockPrisma.subscription.update.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.CANCELLED });

      await service.transitionStatus("sub_1", SubscriptionStatus.CANCELLED, { reason: "User request" });

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "sub_1" },
        data: expect.objectContaining({
          status: SubscriptionStatus.CANCELLED,
          cancelReason: "User request",
        }),
      });
    });

    it("Illegal Transition: PENDING -> CANCELLED", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(mockSub);

      await expect(service.transitionStatus("sub_1", SubscriptionStatus.CANCELLED))
        .rejects.toThrow(BadRequestException);
    });

    it("Illegal Transition: CANCELLED -> ACTIVE", async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({ ...mockSub, status: SubscriptionStatus.CANCELLED });

      await expect(service.transitionStatus("sub_1", SubscriptionStatus.ACTIVE))
        .rejects.toThrow(BadRequestException);
    });
  });
});
