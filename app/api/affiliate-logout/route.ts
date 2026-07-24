import { db } from "../../../lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("affiliate_session");

    if (sessionCookie?.value) {
      await db.execute(
        "DELETE FROM affiliate_sessions WHERE id = ?",
        [sessionCookie.value]
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set("affiliate_session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Logout failed" },
      { status: 500 }
    );
  }
}