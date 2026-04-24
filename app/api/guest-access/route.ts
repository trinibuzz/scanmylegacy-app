import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, guest_name, guest_email } = await req.json();

    if (!token || !guest_name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [rows]: any = await db.execute(
      "SELECT id FROM memorials WHERE invite_token = ? LIMIT 1",
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid memorial link" }, { status: 404 });
    }

    const memorial = rows[0];

    await db.execute(
      "INSERT INTO memorial_guests (memorial_id, guest_name, guest_email) VALUES (?, ?, ?)",
      [memorial.id, guest_name, guest_email || null]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}