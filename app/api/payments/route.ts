import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error:
        "This payment endpoint is no longer used. Use /api/wipay-checkout, /api/bank-transfer, or /api/admin/payments.",
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "This payment endpoint is no longer used. Use /api/wipay-checkout, /api/bank-transfer, or /api/admin/payments.",
    },
    { status: 410 }
  );
}