export type SubscriptionFrequency = 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';

export type SubscriptionStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'RENEWAL_DUE'
  | 'DUNNING'
  | 'CANCELLED'
  | 'EXPIRED';

export interface ISubscriptionPlan {
  id: string;
  productId: string;
  frequency: SubscriptionFrequency;
  amount: number;
  razorpayPlanId: string;
  isActive: boolean;
}

export interface ISubscription {
  id: string;
  userId: string;
  productId: string;
  planId?: string;
  razorpaySubscriptionId?: string;
  quantity: number;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  nextBillingAt: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionPayload {
  productId: string;
  quantity: number;
  frequency: SubscriptionFrequency;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  razorpaySubscriptionId: string;
  status: SubscriptionStatus;
  shortUrl?: string;
}
