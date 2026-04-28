import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      "SELECT * FROM affiliates WHERE email = ? LIMIT 1",
      [email.trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid login" },
        { status: 401 }
      );
    }

    const affiliate = rows[0];

    if (!affiliate.password) {
      return NextResponse.json(
        { error: "Please create your affiliate password first" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      affiliate.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid login" },
        { status: 401 }
      );
    }

    const sessionId =
      Math.random().toString(36).substring(2) + Date.now();

    await db.execute(
      "INSERT INTO affiliate_sessions (id, affiliate_id) VALUES (?, ?)",
      [sessionId, affiliate.id]
    );

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set("affiliate_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}