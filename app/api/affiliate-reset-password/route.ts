import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      `
      SELECT *
      FROM affiliate_password_resets
      WHERE token = ?
        AND used = 0
        AND expires_at > NOW()
      LIMIT 1
      `,
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const resetRequest = rows[0];

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "UPDATE affiliates SET password = ? WHERE id = ? LIMIT 1",
      [hashedPassword, resetRequest.affiliate_id]
    );

    await db.execute(
      "UPDATE affiliate_password_resets SET used = 1 WHERE id = ? LIMIT 1",
      [resetRequest.id]
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