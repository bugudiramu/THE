import { Category } from "@modern-essentials/db";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class TestSeedService {
  constructor(private prisma: PrismaService) {}

  async createSampleProduct() {
    const product = await this.prisma.product.create({
      data: {
        sku: "EGG001",
        name: "Fresh Regular Eggs",
        category: Category.REGULAR_EGGS,
        price: 12000, // ₹120.00
        subPrice: 10800, // ₹108.00
        description:
          "Fresh farm eggs from free-range chickens. Perfect for breakfast and baking.",
        seoTitle: "Fresh Regular Eggs - Farm Fresh",
        seoDesc:
          "Get fresh regular eggs from free-range chickens. Perfect for breakfast and baking.",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1519077294537-9bc099d3ae6c?q=80&w=993&auto=format&fit=crop",
              alt: "Fresh brown eggs in a basket",
              sortOrder: 0,
            },
          ],
        },
      },
      include: {
        images: true,
      },
    });

    return product;
  }

  async createSampleProducts() {
    const products = await Promise.all([
      this.prisma.product.create({
        data: {
          sku: "EGG002",
          name: "Organic Brown Eggs",
          category: Category.BROWN_EGGS,
          price: 15000, // ₹150.00
          subPrice: 13500, // ₹135.00
          description:
            "Premium organic brown eggs from certified organic farms.",
          seoTitle: "Organic Brown Eggs - Premium Quality",
          seoDesc:
            "Premium organic brown eggs from certified organic farms. Rich in nutrients and flavor.",
          images: {
            create: [
              {
                url: "https://plus.unsplash.com/premium_photo-1676592428702-6f8db7c29ac1?q=80&w=988&auto=format&fit=crop",
                alt: "Organic brown eggs",
                sortOrder: 0,
              },
            ],
          },
        },
        include: {
          images: true,
        },
      }),
      this.prisma.product.create({
        data: {
          sku: "EGG003",
          name: "High-Protein Eggs",
          category: Category.HIGH_PROTEIN_EGGS,
          price: 18000, // ₹180.00
          subPrice: 16200, // ₹162.00
          description:
            "Extra high-protein eggs with enhanced nutritional value. Perfect for fitness enthusiasts.",
          seoTitle: "High-Protein Eggs - Enhanced Nutrition",
          seoDesc:
            "Extra high-protein eggs with enhanced nutritional value. Perfect for fitness enthusiasts and athletes.",
          images: {
            create: [
              {
                url: "https://images.unsplash.com/photo-1559229873-383d75ba200f?q=80&w=2012&auto=format&fit=crop",
                alt: "High-protein eggs",
                sortOrder: 0,
              },
            ],
          },
        },
        include: {
          images: true,
        },
      }),
    ]);

    return products;
  }
}
