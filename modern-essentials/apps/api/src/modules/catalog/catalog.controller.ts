import { Product } from "@modern-essentials/db";
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { RequireAdmin } from "../../common/decorators/require-admin.decorator";
import { ClerkAuthGuard } from "../../common/guards/clerk-auth.guard";
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from "./catalog.dto";
import { CatalogService } from "./catalog.service";
import { TestSeedService } from "./test-seed";

@ApiTags("catalog")
@Controller("products")
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly testSeedService: TestSeedService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all products with filtering and pagination" })
  @ApiResponse({ status: 200, description: "Products retrieved successfully" })
  async findAll(@Query() query: ProductQueryDto) {
    return this.catalogService.findAll(query);
  }

  @Get("test/seed")
  @ApiOperation({ summary: "Create sample products for testing" })
  @ApiResponse({
    status: 200,
    description: "Sample products created successfully",
  })
  async createSampleProducts() {
    await this.testSeedService.createSampleProduct();
    await this.testSeedService.createSampleProducts();
    return { message: "Sample products created successfully" };
  }

  @Get("categories")
  @ApiOperation({ summary: "Get all product categories" })
  @ApiResponse({
    status: 200,
    description: "Categories retrieved successfully",
  })
  async getCategories() {
    return this.catalogService.getCategories();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product by ID" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product retrieved successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async findOne(@Param("id") id: string) {
    return this.catalogService.findOne(id);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  @RequireAdmin()
  @ApiOperation({ summary: "Create new product (admin only)" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - admin access required",
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.catalogService.create(createProductDto);
  }

  @Put(":id")
  @UseGuards(ClerkAuthGuard)
  @RequireAdmin()
  @ApiOperation({ summary: "Update product (admin only)" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - admin access required",
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.catalogService.update(id, updateProductDto);
  }

  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  @RequireAdmin()
  @ApiOperation({ summary: "Delete product (admin only)" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - admin access required",
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  async remove(@Param("id") id: string): Promise<void> {
    return this.catalogService.remove(id);
  }

  @Post(":id/images")
  @UseGuards(ClerkAuthGuard)
  @RequireAdmin()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload product image (admin only)" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 201, description: "Image uploaded successfully" })
  @ApiResponse({ status: 400, description: "Bad request - invalid file" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - admin access required",
  })
  async uploadImage(
    @Param("id") id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file: any,
  ) {
    return this.catalogService.uploadImage(file, id);
  }
}
