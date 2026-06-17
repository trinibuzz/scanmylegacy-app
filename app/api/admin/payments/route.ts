import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  return adminSession?.value === "active";
}

function quoteIdentifier(identifier: string) {
  return `\`${String(identifier).replace(/`/g, "``")}\``;
}

async function deleteLegacyPageSafely(memorialId: number) {
  /*
    This removes records connected by memorial_id from any table that has
    a memorial_id column, then deletes the main memorial/legacy page.
    It does NOT delete the user account.
  */

  const [tablesWithMemorialId]: any = await db.execute(
    `
      SELECT TABLE_NAME AS table_name
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND COLUMN_NAME = 'memorial_id'
    `
  );

  for (const table of tablesWithMemorialId) {
    const tableName = table.table_name;

    if (!tableName || tableName === "memorials") continue;

    await db.execute(
      `DELETE FROM ${quoteIdentifier(tableName)} WHERE memorial_id = ?`,
      [memorialId]
    );
  }

  await db.execute(`DELETE FROM memorials WHERE id = ?`, [memorialId]);
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
            'paid',
            'verified'
          )
       ORDER BY 
          CASE 
            WHEN m.payment_status = 'pending_bank_transfer' THEN 1
            WHEN m.payment_status = 'expired_bank_transfer' THEN 2
            WHEN m.payment_status = 'rejected_bank_transfer' THEN 3
            WHEN m.payment_status = 'pending' THEN 4
            WHEN m.payment_status = 'paid' THEN 5
            WHEN m.payment_status = 'verified' THEN 6
            ELSE 7
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
        error: error.message || "Failed to load payment records.",
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

    const memorialId = Number(body.memorial_id);
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
        { error: "Memorial / legacy page not found." },
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
        message: "Payment verified. Legacy page is now active permanently.",
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

    if (action === "delete_legacy_page") {
      await deleteLegacyPageSafely(memorialId);

      return NextResponse.json({
        success: true,
        message:
          "Legacy page deleted successfully. The owner account was not deleted.",
      });
    }

    return NextResponse.json(
      { error: "Invalid payment action." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Payment action failed.",
      },
      { status: 500 }
    );
  }
}