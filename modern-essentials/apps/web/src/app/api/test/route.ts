import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);

    if (!response.ok) {
      return NextResponse.json(
        { error: "API call failed", status: response.status },
        { status: 500 },
      );
    }

    const data = (await response.json()) as {
      products?: any[];
      total?: number;
    };
    return NextResponse.json({
      message: "API connection successful",
      api_url: process.env.NEXT_PUBLIC_API_URL,
      products_count: data.total || 0,
      sample_product: data.products?.[0]?.name || "none",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
