import { Category, Product, ProductImage } from "@modern-essentials/db";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { AwsS3Service } from "../aws-s3/aws-s3.service";
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from "./catalog.dto";

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.log(`Creating product: ${createProductDto.name}`);

    try {
      const product = await this.prisma.product.create({
        data: {
          name: createProductDto.name,
          category: createProductDto.category,
          description: createProductDto.description,
          seoTitle: createProductDto.seoTitle,
          seoDesc: createProductDto.seoDesc,
          variants: {
            create: {
              sku: createProductDto.sku,
              price: createProductDto.price,
              subPrice: createProductDto.subPrice,
              packSize: 6, // Default pack size
            },
          },
          images: createProductDto.images
            ? {
                create: createProductDto.images.map((img) => ({
                  url: img.url,
                  alt: img.alt,
                  sortOrder: img.sortOrder || 0,
                })),
              }
            : undefined,
        },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          variants: true,
        },
      });

      this.logger.log(`Product created successfully: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(
        `Failed to create product: ${(error as Error).message}`,
      );
      throw new BadRequestException("Failed to create product");
    }
  }

  async findAll(
    query: ProductQueryDto,
  ): Promise<{ products: Product[]; total: number }> {
    const {
      category,
      isActive,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.variants = {
        some: {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          variants: true,
          partnerLinks: true,
        },
        orderBy: sortBy === 'price' 
          ? { variants: { _count: 'desc' } } // Simplified for now as price is in variants
          : { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: true,
        partnerLinks: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    this.logger.log(`Updating product: ${id}`);

    try {
      const { price, subPrice, ...productData } = updateProductDto;
      
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...productData,
          // Update the first variant if price is provided
          variants: price || subPrice ? {
            updateMany: {
              where: {}, // Update all variants of this product? Or just first one?
              data: {
                ...(price ? { price } : {}),
                ...(subPrice ? { subPrice } : {}),
              }
            }
          } : undefined
        },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          variants: true,
        },
      });

      this.logger.log(`Product updated successfully: ${id}`);
      return product;
    } catch (error) {
      this.logger.error(
        `Failed to update product: ${(error as Error).message}`,
      );
      throw new BadRequestException("Failed to update product");
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Soft deleting product: ${id}`);

    try {
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      this.logger.log(`Product soft deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to soft delete product: ${(error as Error).message}`,
      );
      throw new BadRequestException("Failed to delete product");
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    productId: string,
  ): Promise<ProductImage> {
    this.logger.log(`Uploading image for product: ${productId}`);

    try {
      const imageUrl = await this.awsS3Service.uploadFile(file, "products");

      const productImage = await this.prisma.productImage.create({
        data: {
          productId,
          url: imageUrl,
          alt: file.originalname,
          sortOrder: 0,
        },
      });

      this.logger.log(`Image uploaded successfully: ${productImage.id}`);
      return productImage;
    } catch (error) {
      this.logger.error(`Failed to upload image: ${(error as Error).message}`);
      throw new BadRequestException("Failed to upload image");
    }
  }

  async getCategories(): Promise<Category[]> {
    return Object.values(Category);
  }
}
