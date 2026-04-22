/// <reference types="node" />
import { Category, PrismaClient, UserTier } from "../generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  // 1. Create a test user
  const user = await prisma.user.upsert({
    where: { clerkId: "user_2eL7XhQpS7nB5W1f8u9R2T4v6Y8" },
    update: {
      phone: "9999999999",
      email: "test@example.com",
      tier: UserTier.MEMBER,
    },
    create: {
      phone: "9999999999",
      email: "test@example.com",
      clerkId: "user_2eL7XhQpS7nB5W1f8u9R2T4v6Y8",
      tier: UserTier.MEMBER,
    },
  });
  console.log("Created test user:", user.phone);

  // 2. Farms Data
  const farmsData = [
    {
      name: "Happy Hens Farm",
      location: "Chittoor, AP",
      contactName: "Ramesh Kumar",
      contactPhone: "9876543210",
    },
    {
      name: "Green Valley Organics",
      location: "Hosur, TN",
      contactName: "Latha Reddy",
      contactPhone: "8765432109",
    },
  ];

  const farms = [];
  for (const farmData of farmsData) {
    const farm = await prisma.farm.create({
      data: farmData,
    });
    farms.push(farm);
    console.log(`Seeded farm: ${farm.name}`);
  }

  // 3. Products Data
  const productsData = [
    {
      name: "Fresh Regular Eggs",
      category: Category.REGULAR_EGGS,
      description: "Farm-fresh regular eggs, perfect for daily use.",
      isActive: true,
      imageUrl:
        "https://images.unsplash.com/photo-1519077294537-9bc099d3ae6c?q=80&w=993&auto=format&fit=crop",
      variants: [
        { sku: "EGG-REG-06", packSize: 6, price: 6000, subPrice: 5400 },
        { sku: "EGG-REG-12", packSize: 12, price: 11000, subPrice: 9900 },
        { sku: "EGG-REG-24", packSize: 24, price: 21000, subPrice: 18900 }
      ]
    },
    {
      name: "Organic Brown Eggs",
      category: Category.BROWN_EGGS,
      description: "Organic brown eggs from free-range hens.",
      isActive: true,
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1676592428702-6f8db7c29ac1?q=80&w=988&auto=format&fit=crop",
      variants: [
        { sku: "EGG-BRW-06", packSize: 6, price: 9000, subPrice: 8100 },
        { sku: "EGG-BRW-12", packSize: 12, price: 17000, subPrice: 15300 }
      ]
    },
    {
      name: "High-Protein Eggs",
      category: Category.HIGH_PROTEIN_EGGS,
      description: "Enriched eggs with 20% more protein.",
      isActive: true,
      imageUrl:
        "https://images.unsplash.com/photo-1559229873-383d75ba200f?q=80&w=2012&auto=format&fit=crop",
      variants: [
        { sku: "EGG-PRO-06", packSize: 6, price: 12000, subPrice: 10800 },
        { sku: "EGG-PRO-12", packSize: 12, price: 23000, subPrice: 20700 }
      ]
    },
  ];

  for (const item of productsData) {
    const { imageUrl, variants, ...productData } = item;

    // Create Product
    const product = await prisma.product.create({
      data: productData,
    });

    // Create Image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: imageUrl,
        alt: product.name,
        sortOrder: 0,
      },
    });

    // Create Variants and Initial Inventory
    for (const variantData of variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: variantData.sku },
        update: { ...variantData, productId: product.id },
        create: { ...variantData, productId: product.id },
      });

      // Create initial inventory
      const batch = await prisma.inventoryBatch.create({
        data: {
          variantId: variant.id,
          qty: 100,
          receivedAt: new Date(),
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          status: "AVAILABLE",
          qcStatus: "PASSED",
          locationId: "WH-01-A1",
        },
      });

      // Create farm batch link
      await prisma.farmBatch.create({
        data: {
          farmId: farms[0].id,
          variantId: variant.id,
          inventoryBatchId: batch.id,
          qtyCollected: 100,
          collectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          qcStatus: "PASSED",
          temperatureOnArrival: 4.5,
        },
      });
    }

    console.log(`Seeded Product: ${product.name}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
