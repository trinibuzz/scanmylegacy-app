import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const cleanToken = String(token || "").trim();
    const newPassword = String(password || "");

    if (!cleanToken || !newPassword) {
      return NextResponse.json(
        { error: "Reset token and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      `SELECT
        password_reset_tokens.id AS reset_id,
        password_reset_tokens.user_id,
        password_reset_tokens.expires_at,
        password_reset_tokens.used_at,
        users.email
       FROM password_reset_tokens
       INNER JOIN users ON users.id = password_reset_tokens.user_id
       WHERE password_reset_tokens.token = ?
       LIMIT 1`,
      [cleanToken]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    const reset = rows[0];

    if (reset.used_at) {
      return NextResponse.json(
        { error: "This reset link has already been used." },
        { status: 400 }
      );
    }

    const expiresAt = new Date(reset.expires_at);

    if (new Date().getTime() > expiresAt.getTime()) {
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      reset.user_id,
    ]);

    await db.execute(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?",
      [reset.reset_id]
    );

    await db.execute("DELETE FROM sessions WHERE user_id = ?", [
      reset.user_id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Your password has been reset. You can now log in.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to reset password." },
      { status: 500 }
    );
  }
}