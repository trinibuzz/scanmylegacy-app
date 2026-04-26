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

    const [counts]: any = await db.execute(
      `SELECT reaction_type, COUNT(*) AS total
       FROM memorial_reactions
       WHERE memorial_id = ?
       GROUP BY reaction_type`,
      [memorial.id]
    );

    let candles = 0;
    let flowers = 0;

    counts.forEach((row: any) => {
      if (row.reaction_type === "candle") candles = Number(row.total);
      if (row.reaction_type === "flower") flowers = Number(row.total);
    });

    const [reactions]: any = await db.execute(
      `SELECT *
       FROM memorial_reactions
       WHERE memorial_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [memorial.id]
    );

    return NextResponse.json({
      candles,
      flowers,
      reactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = body.token;
    const reaction_type = body.reaction_type;
    const guest_name = body.guest_name || "Someone";

    if (!token || !reaction_type) {
      return NextResponse.json(
        { error: "Missing reaction info" },
        { status: 400 }
      );
    }

    if (!["candle", "flower"].includes(reaction_type)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    const [memorialRows]: any = await db.execute(
      "SELECT id FROM memorials WHERE invite_token = ? LIMIT 1",
      [token]
    );

    if (memorialRows.length === 0) {
      return NextResponse.json({ error: "Invalid memorial" }, { status: 404 });
    }

    const memorial = memorialRows[0];

    await db.execute(
      "INSERT INTO memorial_reactions (memorial_id, reaction_type, guest_name) VALUES (?, ?, ?)",
      [memorial.id, reaction_type, guest_name]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}