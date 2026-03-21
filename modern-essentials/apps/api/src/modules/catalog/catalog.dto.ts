import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Category } from "@modern-essentials/db";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateProductDto {
  @ApiProperty({ description: "Stock keeping unit" })
  @IsString()
  sku!: string;

  @ApiProperty({ description: "Product name" })
  @IsString()
  name!: string;

  @ApiProperty({ enum: Category, description: "Product category" })
  @IsEnum(Category)
  category!: Category;

  @ApiProperty({ description: "Price in paise (Rs 100 = 10000)" })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiProperty({ description: "Subscription price in paise (discounted)" })
  @IsInt()
  @Min(0)
  subPrice!: number;

  @ApiPropertyOptional({ description: "Product description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "SEO meta title" })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: "SEO meta description" })
  @IsOptional()
  @IsString()
  seoDesc?: string;

  @ApiPropertyOptional({ description: "Product images" })
  @IsOptional()
  @IsArray()
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}

export class ProductImageDto {
  @ApiProperty({ description: "Image URL" })
  @IsString()
  url!: string;

  @ApiPropertyOptional({ description: "Alt text for accessibility" })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ description: "Sort order" })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: "Product name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: Category, description: "Product category" })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional({ description: "Price in paise" })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: "Subscription price in paise" })
  @IsOptional()
  @IsInt()
  @Min(0)
  subPrice?: number;

  @ApiPropertyOptional({ description: "Product active status" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Product description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "SEO meta title" })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: "SEO meta description" })
  @IsOptional()
  @IsString()
  seoDesc?: string;
}

export class ProductQueryDto {
  @ApiPropertyOptional({ description: "Filter by category" })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional({ description: "Filter by active status" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Minimum price in paise" })
  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price in paise" })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: "Search by product name" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Sort field" })
  @IsOptional()
  @IsString()
  sortBy?: "name" | "price" | "createdAt";

  @ApiPropertyOptional({ description: "Sort order" })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  sortOrder?: "asc" | "desc";

  @ApiPropertyOptional({ description: "Page number" })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page" })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
