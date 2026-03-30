import { NextResponse } from "next/server";

export async function GET() {
  // Mock subscription data for testing
  const mockSubscriptions = [
    {
      id: "sub_1",
      productId: "cmn1hvz3700007kz4vbi8cc9h",
      productName: "Fresh Regular Eggs",
      quantity: 6,
      frequency: "WEEKLY",
      status: "ACTIVE",
      nextBillingAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      price: 10800, // Rs. 108.00 with subscription savings
      savings: 10,
      product: {
        id: "cmn1hvz3700007kz4vbi8cc9h",
        name: "Fresh Regular Eggs",
        sku: "EGG001",
        price: 12000,
        subPrice: 10800,
        category: "REGULAR_EGGS",
      },
    },
    {
      id: "sub_2",
      productId: "cmn1hvz3t00027kz4psycn7gi",
      productName: "Organic Brown Eggs",
      quantity: 12,
      frequency: "FORTNIGHTLY",
      status: "ACTIVE",
      nextBillingAt: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      price: 26400, // Rs. 264.00 with subscription savings
      savings: 12,
      product: {
        id: "cmn1hvz3t00027kz4psycn7gi",
        name: "Organic Brown Eggs",
        sku: "EGG002",
        price: 15000,
        subPrice: 13200,
        category: "BROWN_EGGS",
      },
    },
  ];

  return NextResponse.json({
    subscriptions: mockSubscriptions,
  });
}
