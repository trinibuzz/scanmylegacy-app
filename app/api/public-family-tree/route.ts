import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

async function getMemorialColumns() {
  const [columns]: any = await db.execute("SHOW COLUMNS FROM memorials");
  return columns.map((col: any) => col.Field);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const columns = await getMemorialColumns();

    const selectFields = ["id", "invite_token"];

    if (columns.includes("page_type")) selectFields.push("page_type");
    if (columns.includes("legacy_type")) selectFields.push("legacy_type");
    if (columns.includes("memorial_type")) selectFields.push("memorial_type");
    if (columns.includes("type")) selectFields.push("type");
    if (columns.includes("first_name")) selectFields.push("first_name");
    if (columns.includes("last_name")) selectFields.push("last_name");
    if (columns.includes("full_name")) selectFields.push("full_name");
    if (columns.includes("name")) selectFields.push("name");
    if (columns.includes("death_date")) selectFields.push("death_date");

    const [memorialRows]: any = await db.execute(
      `
        SELECT ${selectFields.join(", ")}
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

    let normalizedPageType = "memorial";

    if (
      rawPageType === "living" ||
      rawPageType === "living_legacy" ||
      rawPageType === "living-legacy"
    ) {
      normalizedPageType = "living";
    } else if (
      columns.includes("death_date") &&
      (!memorial.death_date || String(memorial.death_date).trim() === "")
    ) {
      normalizedPageType = "living";
    }

    const [members]: any = await db.execute(
      `
        SELECT *
        FROM family_members
        WHERE memorial_id = ?
        ORDER BY generation ASC, created_at ASC
      `,
      [memorial.id]
    );

    const memorialName =
      memorial.full_name ||
      memorial.name ||
      `${memorial.first_name || ""} ${memorial.last_name || ""}`.trim();

    return NextResponse.json({
      members,
      page_type: normalizedPageType,
      memorial: {
        id: memorial.id,
        page_type: normalizedPageType,
        name: memorialName,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to load public family tree.",
      },
      { status: 500 }
    );
  }
}