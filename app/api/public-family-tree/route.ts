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
      "SELECT id FROM memorials WHERE invite_token = ? LIMIT 1",
      [token]
    );

    if (memorialRows.length === 0) {
      return NextResponse.json({ error: "Invalid memorial" }, { status: 404 });
    }

    const memorial = memorialRows[0];

    const [members]: any = await db.execute(
      "SELECT * FROM family_members WHERE memorial_id = ? ORDER BY generation ASC, created_at ASC",
      [memorial.id]
    );

    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}