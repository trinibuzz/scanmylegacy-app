import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");

    if (!userCookie) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    const { full_name, birth_date, death_date, biography } = await req.json();

    const inviteToken =
      Math.random().toString(36).substring(2) + Date.now();

    await db.execute(
      "INSERT INTO memorials (user_id, full_name, birth_date, death_date, biography, invite_token) VALUES (?, ?, ?, ?, ?, ?)",
      [user.id, full_name, birth_date, death_date, biography, inviteToken]
    );

    return NextResponse.json({
      success: true,
      link: `/memorial/${inviteToken}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}