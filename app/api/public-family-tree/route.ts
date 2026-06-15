import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const [memorialRows]: any = await db.execute(
      `
        SELECT 
          id,
          page_type,
          legacy_type,
          memorial_type,
          type,
          first_name,
          last_name,
          full_name
        FROM memorials
        WHERE invite_token = ?
        LIMIT 1
      `,
      [token]
    );

    if (memorialRows.length === 0) {
      return NextResponse.json({ error: "Invalid memorial" }, { status: 404 });
    }

    const memorial = memorialRows[0];

    const rawPageType =
      memorial.page_type ||
      memorial.legacy_type ||
      memorial.memorial_type ||
      memorial.type ||
      "";

    const normalizedPageType =
      rawPageType === "living" ||
      rawPageType === "living_legacy" ||
      rawPageType === "living-legacy"
        ? "living"
        : "memorial";

    const [members]: any = await db.execute(
      `
        SELECT *
        FROM family_members
        WHERE memorial_id = ?
        ORDER BY generation ASC, created_at ASC
      `,
      [memorial.id]
    );

    return NextResponse.json({
      members,
      page_type: normalizedPageType,
      memorial: {
        id: memorial.id,
        page_type: normalizedPageType,
        name:
          memorial.full_name ||
          `${memorial.first_name || ""} ${memorial.last_name || ""}`.trim(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load public family tree." },
      { status: 500 }
    );
  }
}