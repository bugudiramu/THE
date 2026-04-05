import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { QCStatus, WastageReason } from "@modern-essentials/types";

export class CreateGrnDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  qty!: number;

  @IsString()
  @IsNotEmpty()
  farmId!: string;

  @IsString()
  @IsNotEmpty()
  collectedAt!: string;

  @IsNumber()
  @IsOptional()
  temperatureOnArrival?: number;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  qtyCollected?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateQcDto {
  @IsEnum(["PENDING", "PASSED", "QUARANTINE", "REJECTED"])
  qcStatus!: QCStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReconcileDto {
  @IsString()
  @IsNotEmpty()
  batchId!: string;

  @IsInt()
  @Min(0)
  physicalQty!: number;

  @IsEnum([
    "BREAKAGE_PACKING",
    "BREAKAGE_TRANSIT",
    "QC_REJECTED",
    "EXPIRED",
    "CUSTOMER_RETURN",
    "OTHER",
  ])
  reason!: WastageReason;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateFarmDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;
}
