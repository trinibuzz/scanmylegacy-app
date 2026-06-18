import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

type ColumnRow = {
  Field: string;
};

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  return adminSession?.value === "active";
}

async function getTableColumns(tableName: string) {
  const [rows]: any = await db.execute(`SHOW COLUMNS FROM \`${tableName}\``);

  return rows.map((row: ColumnRow) => String(row.Field));
}

function hasColumn(columns: string[], columnName: string) {
  return columns.includes(columnName);
}

function firstExistingColumn(columns: string[], names: string[]) {
  return names.find((name) => columns.includes(name)) || null;
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
    const requestedPageType = String(searchParams.get("page_type") || "")
      .trim()
      .toLowerCase();

    const memorialColumns = await getTableColumns("memorials");

    const pageTypeColumn = firstExistingColumn(memorialColumns, [
      "page_type",
      "legacy_type",
      "memorial_type",
      "type",
    ]);

    const statusColumn = firstExistingColumn(memorialColumns, [
      "status",
      "memorial_status",
    ]);

    const isActiveColumn = firstExistingColumn(memorialColumns, [
      "is_active",
      "active",
    ]);

    const pageTypeExpression = pageTypeColumn
      ? `m.\`${pageTypeColumn}\``
      : `
        CASE
          WHEN m.death_date IS NULL OR m.death_date = '' THEN 'living_legacy'
          ELSE 'memorial'
        END
      `;

    const pageTypeSelect = `${pageTypeExpression} AS page_type`;

    const statusSelect = statusColumn
      ? `m.\`${statusColumn}\` AS status`
      : `
        CASE
          WHEN m.payment_status IN ('paid', 'verified', 'free') THEN 'active'
          WHEN m.payment_status LIKE 'pending%' THEN 'pending'
          WHEN m.payment_status IN ('deactivated', 'expired') THEN 'inactive'
          ELSE 'inactive'
        END AS status
      `;

    const isActiveSelect = isActiveColumn
      ? `m.\`${isActiveColumn}\` AS is_active`
      : `
        CASE
          WHEN m.payment_status IN ('paid', 'verified', 'free') THEN 1
          ELSE 0
        END AS is_active
      `;

    let query = `
      SELECT 
        m.id,
        m.id AS memorial_id,
        m.user_id,
        m.full_name,
        m.full_name AS memorial_name,
        m.creator_name,
        m.creator_email,
        m.creator_phone,
        m.creator_relationship,
        m.birth_date,
        m.death_date,
        m.invite_token,
        m.invite_token AS token,
        m.invite_token AS public_token,
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
        ${pageTypeSelect},
        ${statusSelect},
        ${isActiveSelect},
        u.name AS owner_name,
        u.email AS owner_email,
        u.email AS email,
        u.plan AS user_plan,
        u.is_active AS user_is_active
      FROM memorials m
      LEFT JOIN users u ON u.id = m.user_id
    `;

    const whereParts: string[] = [];
    const values: any[] = [];

    if (requestedPageType === "memorial") {
      whereParts.push(
        `LOWER(COALESCE(${pageTypeExpression}, 'memorial')) NOT LIKE '%living%'`
      );
    }

    if (requestedPageType === "living" || requestedPageType === "living_legacy") {
      whereParts.push(
        `LOWER(COALESCE(${pageTypeExpression}, '')) LIKE '%living%'`
      );
    }

    if (search) {
      whereParts.push(`
        (
          m.full_name LIKE ?
          OR m.creator_name LIKE ?
          OR m.creator_email LIKE ?
          OR u.name LIKE ?
          OR u.email LIKE ?
        )
      `);

      const likeSearch = `%${search}%`;

      values.push(
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch
      );
    }

    if (whereParts.length > 0) {
      query += ` WHERE ${whereParts.join(" AND ")} `;
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
    console.error("Admin memorials GET error:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to load memorial records.",
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
    const memorialColumns = await getTableColumns("memorials");

    const updates: string[] = [];
    const values: any[] = [];

    const addUpdate = (column: string, value: any) => {
      if (hasColumn(memorialColumns, column)) {
        updates.push(`\`${column}\` = ?`);
        values.push(value);
      }
    };

    const addCurrentTimestamp = (column: string) => {
      if (hasColumn(memorialColumns, column)) {
        updates.push(`\`${column}\` = CURRENT_TIMESTAMP`);
      }
    };

    if (action === "activate_paid") {
      addUpdate("payment_status", "paid");
      addUpdate("payment_verified", 1);
      addUpdate("status", "active");
      addUpdate("is_active", 1);
      addCurrentTimestamp("activated_at");
      addCurrentTimestamp("updated_at");

      if (updates.length > 0) {
        await db.execute(
          `
          UPDATE memorials
          SET ${updates.join(", ")}
          WHERE id = ?
          `,
          [...values, memorialId]
        );
      }

      if (memorial.user_id) {
        await db.execute(
          `
          UPDATE users
          SET plan = ?,
              is_active = ?
          WHERE id = ?
          `,
          [memorial.package_slug || "paid", 1, memorial.user_id]
        );
      }

      return NextResponse.json({
        success: true,
        message: "Memorial activated as paid.",
      });
    }

    if (action === "deactivate") {
      addUpdate("payment_status", "deactivated");
      addUpdate("status", "inactive");
      addUpdate("is_active", 0);
      addCurrentTimestamp("updated_at");

      if (updates.length > 0) {
        await db.execute(
          `
          UPDATE memorials
          SET ${updates.join(", ")}
          WHERE id = ?
          `,
          [...values, memorialId]
        );
      }

      return NextResponse.json({
        success: true,
        message: "Memorial deactivated.",
      });
    }

    if (action === "reactivate_pending_bank_transfer") {
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + 48);

      addUpdate("payment_status", "pending_bank_transfer");
      addUpdate("payment_method", "bank_transfer");
      addUpdate("payment_due_at", dueDate);
      addUpdate("status", "pending");
      addUpdate("is_active", 0);
      addCurrentTimestamp("updated_at");

      if (updates.length > 0) {
        await db.execute(
          `
          UPDATE memorials
          SET ${updates.join(", ")}
          WHERE id = ?
          `,
          [...values, memorialId]
        );
      }

      return NextResponse.json({
        success: true,
        message: "Bank transfer review reopened for 48 hours.",
      });
    }

    if (action === "mark_free") {
      addUpdate("payment_status", "free");
      addUpdate("payment_verified", 1);
      addUpdate("status", "active");
      addUpdate("is_active", 1);
      addCurrentTimestamp("activated_at");
      addCurrentTimestamp("updated_at");

      if (updates.length > 0) {
        await db.execute(
          `
          UPDATE memorials
          SET ${updates.join(", ")}
          WHERE id = ?
          `,
          [...values, memorialId]
        );
      }

      if (memorial.user_id) {
        await db.execute(
          `
          UPDATE users
          SET plan = ?,
              is_active = ?
          WHERE id = ?
          `,
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
    console.error("Admin memorials POST error:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to update memorial record.",
      },
      { status: 500 }
    );
  }
}
