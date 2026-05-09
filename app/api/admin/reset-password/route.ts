import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");
  return adminSession && adminSession.value === "active";
}

export async function POST(req: Request) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized admin access." },
        { status: 401 }
      );
    }

    const { email, password } = await req.json();

    const cleanedEmail = String(email || "").trim().toLowerCase();
    const newPassword = String(password || "");

    if (!cleanedEmail || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password are required." },
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
      "SELECT id, name, email FROM users WHERE email = ? LIMIT 1",
      [cleanedEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No user found with that email." },
        { status: 404 }
      );
    }

    const user = rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      user.id,
    ]);

    await db.execute("DELETE FROM sessions WHERE user_id = ?", [user.id]);

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully. Old login sessions were cleared.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}