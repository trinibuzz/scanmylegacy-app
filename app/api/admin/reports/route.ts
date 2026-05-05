import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  return adminSession?.value === "active";
}

export async function GET() {
  try {
    const authorized = await isAdminAuthorized();

    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized admin access." },
        { status: 401 }
      );
    }

    const [rows]: any = await db.execute(
      `SELECT
          r.id AS report_id,
          r.memorial_id,
          r.content_type,
          r.content_id,
          r.reporter_name,
          r.reason,
          r.status,
          r.created_at AS reported_at,

          m.full_name AS memorial_name,
          m.invite_token,

          c.guest_name AS chat_guest_name,
          c.body AS chat_body,
          c.image_url AS chat_image_url,
          c.video_url AS chat_video_url,
          c.audio_url AS chat_audio_url,
          c.created_at AS chat_created_at,
          c.is_deleted AS chat_is_deleted
       FROM content_reports r
       LEFT JOIN memorials m ON m.id = r.memorial_id
       LEFT JOIN memorial_chat_messages c
         ON c.id = r.content_id
         AND r.content_type = 'chat'
       ORDER BY
         CASE
           WHEN r.status = 'pending' THEN 1
           WHEN r.status = 'reviewed' THEN 2
           WHEN r.status = 'resolved' THEN 3
           WHEN r.status = 'dismissed' THEN 4
           ELSE 5
         END,
         r.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      reports: rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
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

    const report_id = body.report_id;
    const action = body.action;

    if (!report_id || !action) {
      return NextResponse.json(
        { error: "Report ID and action are required." },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      `SELECT *
       FROM content_reports
       WHERE id = ?
       LIMIT 1`,
      [report_id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Report not found." },
        { status: 404 }
      );
    }

    const report = rows[0];

    if (action === "mark_reviewed") {
      await db.execute(
        `UPDATE content_reports
         SET status = ?
         WHERE id = ?`,
        ["reviewed", report_id]
      );

      return NextResponse.json({
        success: true,
        message: "Report marked as reviewed.",
      });
    }

    if (action === "dismiss_report") {
      await db.execute(
        `UPDATE content_reports
         SET status = ?
         WHERE id = ?`,
        ["dismissed", report_id]
      );

      return NextResponse.json({
        success: true,
        message: "Report dismissed.",
      });
    }

    if (action === "delete_reported_chat") {
      if (report.content_type !== "chat") {
        return NextResponse.json(
          { error: "This report is not for a chat message." },
          { status: 400 }
        );
      }

      await db.execute(
        `UPDATE memorial_chat_messages
         SET is_deleted = 1
         WHERE id = ? AND memorial_id = ?`,
        [report.content_id, report.memorial_id]
      );

      await db.execute(
        `UPDATE content_reports
         SET status = ?
         WHERE id = ?`,
        ["resolved", report_id]
      );

      return NextResponse.json({
        success: true,
        message: "Reported chat message deleted and report resolved.",
      });
    }

    return NextResponse.json(
      { error: "Invalid report action." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}