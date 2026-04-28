import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const memorialId = body.memorial_id;

    if (!memorialId) {
      return NextResponse.json(
        { error: "Missing memorial id" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      "SELECT * FROM memorials WHERE id = ? LIMIT 1",
      [memorialId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Memorial not found" },
        { status: 404 }
      );
    }

    await db.execute(
      `UPDATE memorials
       SET payment_status = 'paid'
       WHERE id = ?`,
      [memorialId]
    );

    await db.execute(
      `UPDATE affiliate_referrals
       SET payment_status = 'paid'
       WHERE memorial_id = ?`,
      [memorialId]
    );

    return NextResponse.json({
      success: true,
      message: "Memorial activated and affiliate commission marked paid",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}