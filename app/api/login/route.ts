import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email.trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid login" }, { status: 401 });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid login" }, { status: 401 });
    }

    const now = new Date();
    const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;

    const trialExpired =
      user.plan === "free" && trialEndsAt && now > trialEndsAt;

    if (trialExpired) {
      await db.execute(
        "UPDATE users SET is_active = 0 WHERE id = ?",
        [user.id]
      );
    }

    const sessionId =
      Math.random().toString(36).substring(2) + Date.now();

    await db.execute(
      "INSERT INTO sessions (id, user_id) VALUES (?, ?)",
      [sessionId, user.id]
    );

    const response = NextResponse.json({
      success: true,
      trial_expired: trialExpired,
      redirect_url: trialExpired ? "/packages?expired=1" : "/dashboard",
    });

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}