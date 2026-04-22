import { Test, TestingModule } from "@nestjs/testing";
import { SubscriptionRenewalProcessor } from "./subscription-renewal.job";
import { PrismaService } from "../common/prisma.service";
import { SubscriptionService } from "../modules/subscription/subscription.service";
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
    processRenewals: jest.fn(),
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
    mockSubscriptionService.processRenewals.mockResolvedValue({ processed: 2 });

    const mockJob = { id: "job_1" } as Job;
    const result = await processor.process(mockJob);

    expect(subscriptionService.processRenewals).toHaveBeenCalled();
    expect(result.processed).toBe(2);
  });

  it("should handle errors in processRenewals", async () => {
    mockSubscriptionService.processRenewals.mockRejectedValue(new Error("Failed"));

    const mockJob = { id: "job_2" } as Job;
    await expect(processor.process(mockJob)).rejects.toThrow("Failed");
  });
});
