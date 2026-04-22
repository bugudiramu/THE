import {
  IBatch,
  IInventorySummary,
  IWastageLog,
} from "@modern-essentials/types";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import {
  CreateFarmDto,
  CreateGrnDto,
  ReconcileDto,
  UpdateQcDto,
} from "./inventory.dto";

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * SKU-wise stock summary with expiry alerts.
   */
  async getSummary(): Promise<IInventorySummary[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: { isActive: true },
      include: {
        product: true,
        inventoryBatches: {
          where: {
            status: "AVAILABLE",
          },
        },
      },
    });

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    return variants.map((variant) => {
      const batches = variant.inventoryBatches;
      const totalQty = batches.reduce((sum, b) => sum + b.qty, 0);
      const availableQty = batches
        .filter((b) => b.qcStatus === "PASSED")
        .reduce((sum, b) => sum + b.qty, 0);
      const qcPendingQty = batches
        .filter((b) => b.qcStatus === "PENDING")
        .reduce((sum, b) => sum + b.qty, 0);
      const expiryAlertsCount = batches.filter(
        (b) => b.expiresAt <= threeDaysFromNow && b.qty > 0,
      ).length;

      return {
        variantId: variant.id,
        sku: variant.sku,
        name: variant.product.name,
        totalQty,
        availableQty,
        qcPendingQty,
        expiryAlertsCount,
      };
    });
  }

  /**
   * List all batches with filters and FEFO sorting.
   */
  async getBatches(filters: {
    variantId?: string;
    status?: string;
    qcStatus?: string;
  }): Promise<IBatch[]> {
    const where: any = {};
    if (filters.variantId) where.variantId = filters.variantId;
    if (filters.status) where.status = filters.status;
    if (filters.qcStatus) where.qcStatus = filters.qcStatus;

    const batches = await this.prisma.inventoryBatch.findMany({
      where,
      include: {
        variant: {
          include: {
            product: true,
          },
        },
        farmBatch: {
          include: {
            farm: true,
          },
        },
      },
      orderBy: {
        expiresAt: "asc", // FEFO rule §7.1
      },
    });

    return batches.map((b) => ({
      id: b.id,
      variantId: b.variantId,
      sku: b.variant.sku,
      productName: b.variant.product.name,
      qty: b.qty,
      receivedAt: b.receivedAt.toISOString(),
      expiresAt: b.expiresAt.toISOString(),
      locationId: b.locationId,
      status: b.status as any,
      qcStatus: b.qcStatus as any,
      farmName: b.farmBatch?.farm.name,
      farmBatchId: b.farmBatch?.id,
    }));
  }

  /**
   * Record new farm arrival (GRN).
   */
  async createGrn(dto: CreateGrnDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });
    if (!variant) throw new NotFoundException("Product variant not found");

    const farm = await this.prisma.farm.findUnique({
      where: { id: dto.farmId },
    });
    if (!farm) throw new NotFoundException("Farm not found");

    const collectedAt = new Date(dto.collectedAt);
    // Shelf life: 21 days for eggs per §7.2
    const expiresAt = new Date(collectedAt);
    expiresAt.setDate(expiresAt.getDate() + 21);

    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.inventoryBatch.create({
        data: {
          variantId: dto.variantId,
          qty: dto.qty,
          receivedAt: new Date(),
          expiresAt,
          locationId: dto.locationId,
          status: "AVAILABLE",
          qcStatus: "PENDING",
        },
      });

      this.logger.log(`Created GRN: Batch ${batch.id} for Product ${variant.sku} (${dto.qty} units)`);

      await tx.farmBatch.create({
        data: {
          farmId: dto.farmId,
          variantId: dto.variantId,
          inventoryBatchId: batch.id,
          qtyCollected: dto.qtyCollected || dto.qty,
          collectedAt,
          temperatureOnArrival: dto.temperatureOnArrival,
          notes: dto.notes,
        },
      });

      return batch;
    });
  }

  /**
   * Record QC result and handle REJECTED status.
   */
  async updateQc(batchId: string, dto: UpdateQcDto, clerkId: string) {
    const batch = await this.prisma.inventoryBatch.findUnique({
      where: { id: batchId },
    });
    if (!batch) throw new NotFoundException("Batch not found");

    return this.prisma.$transaction(async (tx) => {
      const updatedBatch = await tx.inventoryBatch.update({
        where: { id: batchId },
        data: {
          qcStatus: dto.qcStatus,
          status: dto.qcStatus === "REJECTED" ? "WASTAGE" : "AVAILABLE",
        },
      });

      // If REJECTED, log wastage
      if (dto.qcStatus === "REJECTED") {
        await tx.wastageLog.create({
          data: {
            variantId: batch.variantId,
            inventoryBatchId: batch.id,
            qty: batch.qty,
            reason: "QC_REJECTED",
            loggedBy: clerkId,
            notes: dto.notes,
          },
        });

        // Set batch qty to 0 since it's now wastage
        await tx.inventoryBatch.update({
          where: { id: batchId },
          data: { qty: 0 },
        });
      }

      return updatedBatch;
    });
  }

  /**
   * Manual stock adjustment (Reconciliation).
   */
  async reconcile(dto: ReconcileDto, clerkId: string) {
    const batch = await this.prisma.inventoryBatch.findUnique({
      where: { id: dto.batchId },
    });
    if (!batch) throw new NotFoundException("Batch not found");

    const diff = batch.qty - dto.physicalQty;
    if (diff === 0) return batch;

    return this.prisma.$transaction(async (tx) => {
      // Create wastage log for the discrepancy
      if (diff > 0) {
        await tx.wastageLog.create({
          data: {
            variantId: batch.variantId,
            inventoryBatchId: batch.id,
            qty: diff,
            reason: dto.reason,
            loggedBy: clerkId,
            notes: dto.notes,
          },
        });
      }

      return tx.inventoryBatch.update({
        where: { id: dto.batchId },
        data: {
          qty: dto.physicalQty,
          status: dto.physicalQty === 0 ? "WASTAGE" : batch.status,
        },
      });
    });
  }

  /**
   * List wastage logs.
   */
  async getWastageLogs(): Promise<IWastageLog[]> {
    const logs = await this.prisma.wastageLog.findMany({
      include: {
        inventoryBatch: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        loggedAt: "desc",
      },
    });

    // We need to handle logs that might not have a batch (though they should)
    // and logs for products that might have been deleted (though they shouldn't)
    // Let's get all variants to map correctly if needed
    const variants = await this.prisma.productVariant.findMany({
      include: { product: true },
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    return logs.map((log) => {
      const variant =
        log.inventoryBatch?.variant || variantMap.get(log.variantId);
      return {
        id: log.id,
        variantId: log.variantId,
        productName: variant?.product.name || "Unknown Product",
        sku: variant?.sku || "N/A",
        inventoryBatchId: log.inventoryBatchId,
        qty: log.qty,
        reason: log.reason as any,
        loggedBy: log.loggedBy,
        notes: log.notes,
        loggedAt: log.loggedAt.toISOString(),
      };
    });
  }

  async getFarms() {
    return this.prisma.farm.findMany({
      where: { isActive: true },
    });
  }

  async createFarm(dto: CreateFarmDto) {
    return this.prisma.farm.create({
      data: dto,
    });
  }
}
