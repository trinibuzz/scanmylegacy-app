import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { referralCode, pageUrl, referrer, userAgent } = await req.json();

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    const cleanCode = String(referralCode).trim();

    const [affiliateRows]: any = await db.execute(
      "SELECT id, referral_code FROM affiliates WHERE referral_code = ? LIMIT 1",
      [cleanCode]
    );

    if (affiliateRows.length === 0) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    const affiliate = affiliateRows[0];

    await db.execute(
      `
      INSERT INTO affiliate_clicks
        (affiliate_id, referral_code, page_url, referrer, user_agent)
      VALUES
        (?, ?, ?, ?, ?)
      `,
      [
        affiliate.id,
        cleanCode,
        pageUrl || null,
        referrer || null,
        userAgent || null,
      ]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}