import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const memorial_id = body.memorial_id;
    const content_type = body.content_type;
    const content_id = body.content_id;
    const reporter_name = body.reporter_name || "";
    const reason = body.reason || "";

    if (!memorial_id || !content_type || !content_id) {
      return NextResponse.json(
        { error: "Missing report details." },
        { status: 400 }
      );
    }

    if (content_type !== "chat") {
      return NextResponse.json(
        { error: "Unsupported report type." },
        { status: 400 }
      );
    }

    const [chatRows]: any = await db.execute(
      `SELECT id 
       FROM memorial_chat_messages
       WHERE id = ? AND memorial_id = ? AND is_deleted = 0
       LIMIT 1`,
      [content_id, memorial_id]
    );

    if (chatRows.length === 0) {
      return NextResponse.json(
        { error: "Chat message not found." },
        { status: 404 }
      );
    }

    await db.execute(
      `INSERT INTO content_reports
       (memorial_id, content_type, content_id, reporter_name, reason, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        memorial_id,
        content_type,
        content_id,
        reporter_name,
        reason,
        "pending",
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Report submitted. Thank you for helping keep this memorial respectful.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}