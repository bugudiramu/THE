import { z } from 'zod';

// Enums
export const BatchStatusSchema = z.enum([
  'AVAILABLE',
  'RESERVED',
  'DISPATCHED',
  'WASTAGE',
]);
export type BatchStatus = z.infer<typeof BatchStatusSchema>;

export const QCStatusSchema = z.enum([
  'PENDING',
  'PASSED',
  'QUARANTINE',
  'REJECTED',
]);
export type QCStatus = z.infer<typeof QCStatusSchema>;

export const WastageReasonSchema = z.enum([
  'BREAKAGE_PACKING',
  'BREAKAGE_TRANSIT',
  'QC_REJECTED',
  'EXPIRED',
  'CUSTOMER_RETURN',
  'OTHER',
]);
export type WastageReason = z.infer<typeof WastageReasonSchema>;

// Interfaces
export interface IInventorySummary {
  productId: string;
  sku: string;
  name: string;
  totalQty: number;
  availableQty: number;
  qcPendingQty: number;
  expiryAlertsCount: number; // batches expiring < 3 days
}

export interface IFarm {
  id: string;
  name: string;
  location: string;
  contactName?: string | null;
  contactPhone?: string | null;
  isActive: boolean;
}

export interface IBatch {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  qty: number;
  receivedAt: string;
  expiresAt: string;
  locationId: string | null;
  status: BatchStatus;
  qcStatus: QCStatus;
  farmName?: string;
  farmBatchId?: string;
}

export interface IWastageLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  inventoryBatchId?: string | null;
  qty: number;
  reason: WastageReason;
  loggedBy: string;
  notes?: string | null;
  loggedAt: string;
}

// Payload DTOs
export const CreateGrnPayloadSchema = z.object({
  productId: z.string(),
  qty: z.number().int().min(1),
  farmId: z.string(),
  collectedAt: z.string(), // ISO date
  temperatureOnArrival: z.number().optional(),
  notes: z.string().optional(),
});
export type IGrnPayload = z.infer<typeof CreateGrnPayloadSchema>;

export const UpdateQcResultSchema = z.object({
  qcStatus: QCStatusSchema,
  notes: z.string().optional(),
  // More fields can be added for detailed QC checklists later
});
export type IQcResult = z.infer<typeof UpdateQcResultSchema>;

export const ReconcilePayloadSchema = z.object({
  batchId: z.string(),
  physicalQty: z.number().int().min(0),
  reason: WastageReasonSchema,
  notes: z.string().optional(),
});
export type IReconciliation = z.infer<typeof ReconcilePayloadSchema>;

export const CreateFarmPayloadSchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
});
export type ICreateFarmPayload = z.infer<typeof CreateFarmPayloadSchema>;
