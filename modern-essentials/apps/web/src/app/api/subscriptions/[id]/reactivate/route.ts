import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
export const runtime = "edge";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { userId, getToken } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const token = await getToken();
  const id = params.id;

  try {
    const response = await fetch(`${API_URL}/subscriptions/${id}/reactivate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Reactivation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
