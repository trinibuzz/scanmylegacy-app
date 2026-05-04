import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const memorial_id = body.memorial_id;
    const transfer_reference = body.transfer_reference;

    if (!memorial_id || !transfer_reference) {
      return NextResponse.json(
        { error: "Memorial ID and transfer reference are required." },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      "SELECT * FROM memorials WHERE id = ? LIMIT 1",
      [memorial_id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Memorial not found." },
        { status: 404 }
      );
    }

    await db.execute(
      `UPDATE memorials
       SET payment_status = ?, payment_reference = ?
       WHERE id = ?`,
      ["pending_bank_transfer", transfer_reference, memorial_id]
    );

    return NextResponse.json({
      success: true,
      message: "Bank transfer reference saved.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}