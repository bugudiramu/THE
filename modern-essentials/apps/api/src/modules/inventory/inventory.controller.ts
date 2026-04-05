import { User } from "@modern-essentials/db";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequireAdmin } from "../../common/decorators/require-admin.decorator";
import { AdminGuard } from "../../common/guards/admin.guard";
import { ClerkAuthGuard } from "../../common/guards/clerk-auth.guard";
import {
  CreateFarmDto,
  CreateGrnDto,
  ReconcileDto,
  UpdateQcDto,
} from "./inventory.dto";
import { InventoryService } from "./inventory.service";

@Controller("admin/inventory")
@UseGuards(ClerkAuthGuard, AdminGuard)
@RequireAdmin()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("summary")
  async getSummary() {
    return this.inventoryService.getSummary();
  }

  @Get("batches")
  async getBatches(
    @Query("productId") productId?: string,
    @Query("status") status?: string,
    @Query("qcStatus") qcStatus?: string,
  ) {
    return this.inventoryService.getBatches({ productId, status, qcStatus });
  }

  @Post("grn")
  async createGrn(@Body() dto: CreateGrnDto) {
    return this.inventoryService.createGrn(dto);
  }

  @Patch("batches/:id/qc")
  async updateQc(
    @Param("id") id: string,
    @Body() dto: UpdateQcDto,
    @CurrentUser() user: User,
  ) {
    return this.inventoryService.updateQc(id, dto, user.clerkId);
  }

  @Post("reconcile")
  async reconcile(@Body() dto: ReconcileDto, @CurrentUser() user: User) {
    return this.inventoryService.reconcile(dto, user.clerkId);
  }

  @Get("wastage")
  async getWastageLogs() {
    return this.inventoryService.getWastageLogs();
  }

  @Get("farms")
  async getFarms() {
    return this.inventoryService.getFarms();
  }

  @Post("farms")
  async createFarm(@Body() dto: CreateFarmDto) {
    return this.inventoryService.createFarm(dto);
  }
}
