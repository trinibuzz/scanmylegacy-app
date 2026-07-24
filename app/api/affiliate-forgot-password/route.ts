import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const [rows]: any = await db.execute(
      "SELECT id, email FROM affiliates WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No affiliate account was found with that email." },
        { status: 404 }
      );
    }

    const affiliate = rows[0];

    const token = crypto.randomBytes(32).toString("hex");

    await db.execute(
      `
      INSERT INTO affiliate_password_resets
        (affiliate_id, email, token, expires_at, used)
      VALUES
        (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), 0)
      `,
      [affiliate.id, affiliate.email, token]
    );

    const resetLink = `/affiliate-reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      resetLink,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}