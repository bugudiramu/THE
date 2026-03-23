import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const subscriptionId = params.id;

  try {
    const body = (await request.json()) as { durationWeeks: number };
    const { durationWeeks } = body;

    console.log(
      `Pausing subscription ${subscriptionId} for ${durationWeeks} weeks`,
    );

    // Mock success response
    return NextResponse.json({
      success: true,
      message: "Subscription paused successfully",
    });
  } catch (error) {
    console.error("Error pausing subscription:", error);
    return NextResponse.json(
      { success: false, message: "Failed to pause subscription" },
      { status: 500 },
    );
  }
}
