import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  return adminSession?.value === "active";
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

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();

    let query = `
      SELECT 
        m.id,
        m.user_id,
        m.full_name,
        m.creator_name,
        m.creator_email,
        m.creator_phone,
        m.creator_relationship,
        m.birth_date,
        m.death_date,
        m.invite_token,
        m.cover_photo,
        m.package_slug,
        m.package_name,
        m.package_price,
        m.payment_status,
        m.payment_method,
        m.payment_reference,
        m.payment_due_at,
        m.created_at,
        m.enable_family_tree,
        m.enable_reminders,
        u.name AS owner_name,
        u.email AS owner_email,
        u.plan AS user_plan,
        u.is_active AS user_is_active
      FROM memorials m
      LEFT JOIN users u ON u.id = m.user_id
    `;

    const values: any[] = [];

    if (search) {
      query += `
        WHERE 
          m.full_name LIKE ?
          OR m.creator_name LIKE ?
          OR m.creator_email LIKE ?
          OR u.name LIKE ?
          OR u.email LIKE ?
      `;

      const likeSearch = `%${search}%`;

      values.push(
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch
      );
    }

    query += `
      ORDER BY m.created_at DESC
      LIMIT 300
    `;

    const [rows]: any = await db.execute(query, values);

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

    if (action === "activate_paid") {
      await db.execute(
        `UPDATE memorials
         SET payment_status = ?
         WHERE id = ?`,
        ["paid", memorialId]
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

      return NextResponse.json({
        success: true,
        message: "Memorial activated as paid.",
      });
    }

    if (action === "deactivate") {
      await db.execute(
        `UPDATE memorials
         SET payment_status = ?
         WHERE id = ?`,
        ["deactivated", memorialId]
      );

      return NextResponse.json({
        success: true,
        message: "Memorial deactivated.",
      });
    }

    if (action === "reactivate_pending_bank_transfer") {
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
        message: "Bank transfer review reopened for 48 hours.",
      });
    }

    if (action === "mark_free") {
      await db.execute(
        `UPDATE memorials
         SET payment_status = ?
         WHERE id = ?`,
        ["free", memorialId]
      );

      if (memorial.user_id) {
        await db.execute(
          `UPDATE users
           SET plan = ?,
               is_active = ?
           WHERE id = ?`,
          ["free", 1, memorial.user_id]
        );
      }

      return NextResponse.json({
        success: true,
        message: "Memorial marked as free.",
      });
    }

    return NextResponse.json(
      { error: "Invalid memorial action." },
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