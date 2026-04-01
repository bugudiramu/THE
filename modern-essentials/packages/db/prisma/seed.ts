import { PrismaClient, Category, UserTier } from '../generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Create a test user
  const user = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: {},
    create: {
      phone: '9999999999',
      email: 'test@example.com',
      clerkId: 'user_2eL7XhQpS7nB5W1f8u9R2T4v6Y8',
      tier: UserTier.MEMBER,
    },
  });
  console.log('Created test user:', user.phone);

  // 2. Farms Data
  const farmsData = [
    {
      name: 'Happy Hens Farm',
      location: 'Chittoor, AP',
      contactName: 'Ramesh Kumar',
      contactPhone: '9876543210',
    },
    {
      name: 'Green Valley Organics',
      location: 'Hosur, TN',
      contactName: 'Latha Reddy',
      contactPhone: '8765432109',
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
      sku: 'EGG-REG-06',
      name: 'Fresh Regular Eggs (6pk)',
      category: Category.REGULAR_EGGS,
      price: 6000,
      subPrice: 5400,
      description: 'Farm-fresh regular eggs, perfect for daily use.',
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1518569656558-1f25e69c93d7?w=800&h=600&fit=crop',
    },
    {
      sku: 'EGG-BRW-06',
      name: 'Organic Brown Eggs (6pk)',
      category: Category.BROWN_EGGS,
      price: 9000,
      subPrice: 8100,
      description: 'Organic brown eggs from free-range hens.',
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
    },
    {
      sku: 'EGG-PRO-06',
      name: 'High-Protein Eggs (6pk)',
      category: Category.HIGH_PROTEIN_EGGS,
      price: 12000,
      subPrice: 10800,
      description: 'Enriched eggs with 20% more protein.',
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=800&h=600&fit=crop',
    },
  ];

  for (const item of productsData) {
    const { imageUrl, ...productData } = item;
    
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: productData,
      create: productData,
    });

    // Create image if it doesn't exist
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id }
    });

    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          alt: product.name,
          sortOrder: 0,
        }
      });
    }

    // Create initial inventory
    const batch = await prisma.inventoryBatch.create({
      data: {
        productId: product.id,
        qty: 100,
        receivedAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'AVAILABLE',
        qcStatus: 'PASS',
        locationId: 'WH-01-A1',
      },
    });

    // Create farm batch link
    await prisma.farmBatch.create({
      data: {
        farmId: farms[0].id,
        productId: product.id,
        inventoryBatchId: batch.id,
        qtyCollected: 100,
        collectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        qcStatus: 'PASS',
        temperatureOnArrival: 4.5,
      },
    });

    console.log(`Seeded: ${product.name}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
