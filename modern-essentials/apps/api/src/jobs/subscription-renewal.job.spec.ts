import { Test, TestingModule } from "@nestjs/testing";
import { SubscriptionRenewalProcessor } from "./subscription-renewal.job";
import { PrismaService } from "../common/prisma.service";
import { SubscriptionService, SubscriptionStatus } from "../modules/subscription/subscription.service";
import { Job } from "bullmq";

describe("SubscriptionRenewalProcessor", () => {
  let processor: SubscriptionRenewalProcessor;
  let subscriptionService: SubscriptionService;

  const mockPrisma = {
    subscription: {
      findMany: jest.fn(),
    },
  };

  const mockSubscriptionService = {
    transitionStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionRenewalProcessor,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SubscriptionService, useValue: mockSubscriptionService },
      ],
    }).compile();

    processor = module.get<SubscriptionRenewalProcessor>(SubscriptionRenewalProcessor);
    subscriptionService = module.get<SubscriptionService>(SubscriptionService);
    
    jest.clearAllMocks();
  });

  it("should process due subscriptions and transition them to RENEWAL_DUE", async () => {
    const mockDueSubs = [
      { id: "sub_1", status: SubscriptionStatus.ACTIVE },
      { id: "sub_2", status: SubscriptionStatus.ACTIVE },
    ];
    mockPrisma.subscription.findMany.mockResolvedValue(mockDueSubs);

    const mockJob = { id: "job_1" } as Job;
    const result = await processor.process(mockJob);

    expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        status: SubscriptionStatus.ACTIVE,
        nextBillingAt: { lte: expect.any(Date) },
      }),
    }));
    
    expect(subscriptionService.transitionStatus).toHaveBeenCalledTimes(2);
    expect(subscriptionService.transitionStatus).toHaveBeenCalledWith(
      "sub_1",
      SubscriptionStatus.RENEWAL_DUE,
      expect.any(Object)
    );
    expect(result.processed).toBe(2);
  });

  it("should handle transition errors and continue processing", async () => {
    const mockDueSubs = [
      { id: "sub_1", status: SubscriptionStatus.ACTIVE },
      { id: "sub_2", status: SubscriptionStatus.ACTIVE },
    ];
    mockPrisma.subscription.findMany.mockResolvedValue(mockDueSubs);
    mockSubscriptionService.transitionStatus
      .mockRejectedValueOnce(new Error("Transition failed"))
      .mockResolvedValueOnce({});

    const mockJob = { id: "job_2" } as Job;
    const result = await processor.process(mockJob);

    expect(subscriptionService.transitionStatus).toHaveBeenCalledTimes(2);
    expect(result.processed).toBe(1);
  });
});
