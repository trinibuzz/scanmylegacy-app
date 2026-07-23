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

function cleanStatus(statusValue: any) {
  const status = String(statusValue || "").trim().toLowerCase();

  if (["pending", "approved", "rejected"].includes(status)) {
    return status;
  }

  return "pending";
}

export async function GET(req: Request) {
  try {
    const authorized = await isAdminAuthorized();

    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized admin access." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const status = cleanStatus(url.searchParams.get("status") || "pending");

    const [rows]: any = await db.execute(
      `
      SELECT
        r.id,
        r.memorial_id,
        r.request_type,
        r.trusted_contact_name,
        r.trusted_contact_email,
        r.trusted_contact_phone,
        r.request_note,
        r.status,
        r.admin_note,
        r.reviewed_by,
        r.reviewed_at,
        r.created_at,
        r.updated_at,
        m.full_name,
        m.page_type,
        m.invite_token
      FROM trusted_contact_release_requests r
      LEFT JOIN memorials m ON m.id = r.memorial_id
      WHERE r.status = ?
      ORDER BY r.created_at DESC
      LIMIT 200
      `,
      [status]
    );

    return NextResponse.json({
      success: true,
      requests: rows,
    });
  } catch (error: any) {
    console.error("Admin trusted contact requests GET error:", error);

    return NextResponse.json(
      { error: error.message || "Unable to load trusted contact requests." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const authorized = await isAdminAuthorized();

    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized admin access." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const requestId = Number(body.request_id);
    const action = String(body.action || "").trim().toLowerCase();
    const adminNote = String(body.admin_note || "").trim().slice(0, 2000);

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required." },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be approve or reject." },
        { status: 400 }
      );
    }

    const [requestRows]: any = await db.execute(
      `
      SELECT
        r.*,
        m.full_name,
        m.page_type
      FROM trusted_contact_release_requests r
      LEFT JOIN memorials m ON m.id = r.memorial_id
      WHERE r.id = ?
      LIMIT 1
      `,
      [requestId]
    );

    if (requestRows.length === 0) {
      return NextResponse.json(
        { error: "Trusted contact request not found." },
        { status: 404 }
      );
    }

    const request = requestRows[0];

    if (String(request.status || "").toLowerCase() !== "pending") {
      return NextResponse.json(
        { error: "This request has already been reviewed." },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    await db.execute(
      `
      UPDATE trusted_contact_release_requests
      SET status = ?,
          admin_note = ?,
          reviewed_at = NOW()
      WHERE id = ?
      `,
      [newStatus, adminNote || null, requestId]
    );

    let actionMessage = `Request ${newStatus}.`;

    if (action === "approve") {
      const requestType = String(request.request_type || "").toLowerCase();

      if (requestType === "convert_to_memorial") {
        await db.execute(
          `
          UPDATE memorials
          SET page_type = ?
          WHERE id = ?
          `,
          ["memorial", request.memorial_id]
        );

        actionMessage = `${
          request.full_name || "This Living Legacy"
        } was converted to a Memorial Page.`;
      } else if (requestType === "release_after_passing") {
        actionMessage =
          "Request approved. After Passing messages will be available according to the page release rules.";
      } else if (requestType === "ownership_transfer") {
        actionMessage =
          "Ownership transfer request approved for review. Manual account transfer is still required.";
      } else {
        actionMessage = "General family release request approved.";
      }
    }

    return NextResponse.json({
      success: true,
      message: actionMessage,
    });
  } catch (error: any) {
    console.error("Admin trusted contact requests PATCH error:", error);

    return NextResponse.json(
      { error: error.message || "Unable to update trusted contact request." },
      { status: 500 }
    );
  }
}