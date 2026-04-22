export type SubscriptionFrequency = 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';

export type SubscriptionStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'RENEWAL_DUE'
  | 'DUNNING'
  | 'CANCELLED'
  | 'EXPIRED';

export const VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  PENDING: ['ACTIVE'],
  ACTIVE: ['RENEWAL_DUE', 'PAUSED', 'CANCELLED'],
  RENEWAL_DUE: ['ACTIVE', 'DUNNING'],
  DUNNING: ['ACTIVE', 'CANCELLED'],
  PAUSED: ['ACTIVE'],
  CANCELLED: [],
  EXPIRED: [],
};

export interface ISubscriptionPlan {
  id: string;
  variantId: string;
  frequency: SubscriptionFrequency;
  amount: number;
  razorpayPlanId: string;
  isActive: boolean;
}

export interface ISubscription {
  id: string;
  userId: string;
  variantId: string;
  planId?: string;
  razorpaySubscriptionId?: string;
  quantity: number;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  nextBillingAt: Date;
  nextDeliveryAt: Date;
  pauseUntil?: Date;
  skipCount: number;
  dunningAttempt: number;
  cancelReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionLog {
  id: string;
  subscriptionId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  performedBy: string;
  createdAt: Date;
}

export interface CreateSubscriptionPayload {
  variantId: string;
  quantity: number;
  frequency: SubscriptionFrequency;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  razorpaySubscriptionId: string;
  status: SubscriptionStatus;
  shortUrl?: string;
}
