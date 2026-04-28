import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

function makeReferralCode(name: string) {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);

  const random = Math.random().toString(36).substring(2, 7);

  return `${cleanName}${random}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = body.full_name;
    const email = body.email;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const [existingRows]: any = await db.execute(
      "SELECT * FROM affiliates WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        { error: "This email is already registered as an affiliate" },
        { status: 400 }
      );
    }

    let referralCode = makeReferralCode(fullName);

    const [codeRows]: any = await db.execute(
      "SELECT * FROM affiliates WHERE referral_code = ? LIMIT 1",
      [referralCode]
    );

    if (codeRows.length > 0) {
      referralCode = `${referralCode}${Date.now()}`;
    }

    const [result]: any = await db.execute(
      `INSERT INTO affiliates
       (full_name, email, referral_code, commission_rate, status)
       VALUES (?, ?, ?, ?, ?)`,
      [fullName, email, referralCode, 10.0, "active"]
    );

    return NextResponse.json({
      success: true,
      affiliate: {
        id: result.insertId,
        full_name: fullName,
        email,
        referral_code: referralCode,
        referral_link: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/packages?ref=${referralCode}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}