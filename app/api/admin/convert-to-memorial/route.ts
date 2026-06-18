import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  return adminSession?.value === "active";
}

export async function POST(req: Request) {
  try {
    const authorized = await isAdminAuthorized();

    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized admin access." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const memorialId = Number(body.memorial_id);

    if (!memorialId) {
      return NextResponse.json(
        { error: "Memorial ID is required." },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      `
      SELECT id, full_name, page_type
      FROM memorials
      WHERE id = ?
      LIMIT 1
      `,
      [memorialId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Legacy page not found." },
        { status: 404 }
      );
    }

    const page = rows[0];

    if (String(page.page_type || "").toLowerCase() === "memorial") {
      return NextResponse.json({
        success: true,
        message: "This page is already a Memorial Page.",
      });
    }

    await db.execute(
      `
      UPDATE memorials
      SET page_type = ?
      WHERE id = ?
      `,
      ["memorial", memorialId]
    );

    return NextResponse.json({
      success: true,
      message: `${page.full_name || "This Living Legacy"} was converted to a Memorial Page.`,
    });
  } catch (error: any) {
    console.error("Convert to memorial error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to convert page to memorial." },
      { status: 500 }
    );
  }
}
