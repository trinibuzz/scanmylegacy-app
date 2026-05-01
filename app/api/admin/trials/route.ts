import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function requireAdmin() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");
  return adminSession && adminSession.value === "active";
}

export async function GET() {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [records]: any = await db.execute(
      `SELECT
        users.id AS user_id,
        users.name AS owner_name,
        users.email,
        users.plan,
        users.trial_ends_at,
        users.is_active,
        memorials.id AS memorial_id,
        memorials.full_name AS memorial_name,
        memorials.package_slug,
        memorials.package_name,
        memorials.package_price,
        memorials.payment_status
      FROM users
      LEFT JOIN memorials ON memorials.user_id = users.id
      ORDER BY users.created_at DESC`
    );

    return NextResponse.json({ records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user_id, memorial_id, action } = await req.json();

    if (!user_id || !action) {
      return NextResponse.json({ error: "Missing user or action." }, { status: 400 });
    }

    if (action === "extend_7" || action === "extend_14") {
      const days = action === "extend_7" ? 7 : 14;
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + days);

      await db.execute(
        "UPDATE users SET plan = 'free', trial_ends_at = ?, is_active = 1 WHERE id = ?",
        [trialEndsAt, user_id]
      );
    }

    if (action === "standard") {
      await db.execute(
        "UPDATE users SET plan = 'standard-legacy', trial_ends_at = NULL, is_active = 1 WHERE id = ?",
        [user_id]
      );

      if (memorial_id) {
        await db.execute(
          `UPDATE memorials
           SET payment_status = 'paid',
               package_slug = 'standard-legacy',
               package_name = 'Standard Legacy',
               package_price = 59
           WHERE id = ?`,
          [memorial_id]
        );
      }
    }

    if (action === "premium") {
      await db.execute(
        "UPDATE users SET plan = 'premium-legacy', trial_ends_at = NULL, is_active = 1 WHERE id = ?",
        [user_id]
      );

      if (memorial_id) {
        await db.execute(
          `UPDATE memorials
           SET payment_status = 'paid',
               package_slug = 'premium-legacy',
               package_name = 'Premium Legacy',
               package_price = 89
           WHERE id = ?`,
          [memorial_id]
        );
      }
    }

    if (action === "eternal") {
      await db.execute(
        "UPDATE users SET plan = 'eternal-legacy', trial_ends_at = NULL, is_active = 1 WHERE id = ?",
        [user_id]
      );

      if (memorial_id) {
        await db.execute(
          `UPDATE memorials
           SET payment_status = 'paid',
               package_slug = 'eternal-legacy',
               package_name = 'Eternal Legacy',
               package_price = 129
           WHERE id = ?`,
          [memorial_id]
        );
      }
    }

    if (action === "deactivate") {
      await db.execute("UPDATE users SET is_active = 0 WHERE id = ?", [user_id]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
