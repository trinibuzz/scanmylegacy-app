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
          m.id,
          m.user_id,
          m.full_name,
          m.creator_name,
          m.creator_email,
          m.creator_phone,
          m.package_slug,
          m.package_name,
          m.package_price,
          m.payment_status,
          m.payment_method,
          m.payment_reference,
          m.payment_due_at,
          m.created_at,
          m.invite_token,
          u.name AS owner_name,
          u.email AS owner_email,
          u.plan AS user_plan,
          u.is_active AS user_is_active
       FROM memorials m
       LEFT JOIN users u ON u.id = m.user_id
       WHERE 
          m.payment_status IN (
            'pending_bank_transfer',
            'expired_bank_transfer',
            'rejected_bank_transfer',
            'pending',
            'paid'
          )
       ORDER BY 
          CASE 
            WHEN m.payment_status = 'pending_bank_transfer' THEN 1
            WHEN m.payment_status = 'expired_bank_transfer' THEN 2
            WHEN m.payment_status = 'rejected_bank_transfer' THEN 3
            WHEN m.payment_status = 'pending' THEN 4
            WHEN m.payment_status = 'paid' THEN 5
            ELSE 6
          END,
          m.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      records: rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
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

    const memorialId = body.memorial_id;
    const action = body.action;

    if (!memorialId || !action) {
      return NextResponse.json(
        { error: "Memorial ID and action are required." },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      "SELECT * FROM memorials WHERE id = ? LIMIT 1",
      [memorialId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Memorial not found." },
        { status: 404 }
      );
    }

    const memorial = rows[0];

    if (action === "verify_payment") {
      await db.execute(
        `UPDATE memorials
         SET payment_status = ?,
             payment_method = ?
         WHERE id = ?`,
        ["paid", memorial.payment_method || "bank_transfer", memorialId]
      );

      if (memorial.user_id) {
        await db.execute(
          `UPDATE users
           SET plan = ?,
               is_active = ?
           WHERE id = ?`,
          [memorial.package_slug || "paid", 1, memorial.user_id]
        );
      }

      await db.execute(
        `UPDATE affiliate_referrals
         SET payment_status = 'paid'
         WHERE memorial_id = ?`,
        [memorialId]
      );

      return NextResponse.json({
        success: true,
        message: "Payment verified. Memorial is now active permanently.",
      });
    }

    if (action === "reject_payment") {
      await db.execute(
        `UPDATE memorials
         SET payment_status = ?
         WHERE id = ?`,
        ["rejected_bank_transfer", memorialId]
      );

      return NextResponse.json({
        success: true,
        message: "Bank transfer payment was rejected.",
      });
    }

    if (action === "mark_expired") {
      await db.execute(
        `UPDATE memorials
         SET payment_status = ?
         WHERE id = ?`,
        ["expired_bank_transfer", memorialId]
      );

      return NextResponse.json({
        success: true,
        message: "Bank transfer payment marked as expired.",
      });
    }

    if (action === "reactivate_pending") {
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + 48);

      await db.execute(
        `UPDATE memorials
         SET payment_status = ?,
             payment_method = ?,
             payment_due_at = ?
         WHERE id = ?`,
        ["pending_bank_transfer", "bank_transfer", dueDate, memorialId]
      );

      return NextResponse.json({
        success: true,
        message: "Bank transfer review window reopened for 48 hours.",
      });
    }

    return NextResponse.json(
      { error: "Invalid payment action." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}