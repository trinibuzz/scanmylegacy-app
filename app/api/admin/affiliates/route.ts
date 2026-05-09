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
      return NextResponse.json(
        { error: "Unauthorized admin access." },
        { status: 401 }
      );
    }

    const [affiliates]: any = await db.execute(
      `SELECT
        a.id,
        a.full_name,
        a.email,
        a.referral_code,
        a.commission_rate,
        a.status,
        a.created_at,

        COUNT(DISTINCT s.id) AS referral_visits,

        COUNT(DISTINCT r.id) AS total_referrals,

        COALESCE(SUM(CASE WHEN r.payment_status = 'paid' THEN 1 ELSE 0 END), 0) AS paid_referrals,

        COALESCE(SUM(CASE WHEN r.id IS NOT NULL AND r.payment_status <> 'paid' THEN 1 ELSE 0 END), 0) AS pending_referrals,

        COALESCE(SUM(r.package_price), 0) AS total_revenue,

        COALESCE(SUM(CASE WHEN r.payment_status = 'paid' THEN r.package_price ELSE 0 END), 0) AS paid_revenue,

        COALESCE(SUM(r.commission_amount), 0) AS total_commission,

        COALESCE(SUM(CASE WHEN r.payment_status = 'paid' THEN r.commission_amount ELSE 0 END), 0) AS paid_commission,

        COALESCE(SUM(CASE WHEN r.id IS NOT NULL AND r.payment_status <> 'paid' THEN r.commission_amount ELSE 0 END), 0) AS pending_commission

      FROM affiliates a
      LEFT JOIN affiliate_sessions s ON s.affiliate_id = a.id
      LEFT JOIN affiliate_referrals r ON r.affiliate_id = a.id
      GROUP BY
        a.id,
        a.full_name,
        a.email,
        a.referral_code,
        a.commission_rate,
        a.status,
        a.created_at
      ORDER BY a.created_at DESC`
    );

    const [referrals]: any = await db.execute(
      `SELECT
        r.id,
        r.affiliate_id,
        a.full_name AS affiliate_name,
        a.email AS affiliate_email,
        a.referral_code,
        r.memorial_id,
        r.customer_name,
        r.package_name,
        r.package_price,
        r.commission_amount,
        r.payment_status,
        r.created_at
      FROM affiliate_referrals r
      LEFT JOIN affiliates a ON a.id = r.affiliate_id
      ORDER BY r.created_at DESC
      LIMIT 100`
    );

    const totals = affiliates.reduce(
      (acc: any, affiliate: any) => {
        acc.total_affiliates += 1;
        acc.active_affiliates += affiliate.status === "active" ? 1 : 0;
        acc.referral_visits += Number(affiliate.referral_visits || 0);
        acc.total_referrals += Number(affiliate.total_referrals || 0);
        acc.paid_referrals += Number(affiliate.paid_referrals || 0);
        acc.pending_referrals += Number(affiliate.pending_referrals || 0);
        acc.total_revenue += Number(affiliate.total_revenue || 0);
        acc.paid_revenue += Number(affiliate.paid_revenue || 0);
        acc.total_commission += Number(affiliate.total_commission || 0);
        acc.paid_commission += Number(affiliate.paid_commission || 0);
        acc.pending_commission += Number(affiliate.pending_commission || 0);

        return acc;
      },
      {
        total_affiliates: 0,
        active_affiliates: 0,
        referral_visits: 0,
        total_referrals: 0,
        paid_referrals: 0,
        pending_referrals: 0,
        total_revenue: 0,
        paid_revenue: 0,
        total_commission: 0,
        paid_commission: 0,
        pending_commission: 0,
      }
    );

    return NextResponse.json({
      success: true,
      totals,
      affiliates,
      referrals,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to load affiliate tracker." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized admin access." },
        { status: 401 }
      );
    }

    const { affiliate_id, action } = await req.json();

    if (!affiliate_id || !action) {
      return NextResponse.json(
        { error: "Missing affiliate or action." },
        { status: 400 }
      );
    }

    if (action === "deactivate") {
      await db.execute(
        "UPDATE affiliates SET status = 'inactive' WHERE id = ?",
        [affiliate_id]
      );

      return NextResponse.json({
        success: true,
        message: "Affiliate deactivated.",
      });
    }

    if (action === "activate") {
      await db.execute("UPDATE affiliates SET status = 'active' WHERE id = ?", [
        affiliate_id,
      ]);

      return NextResponse.json({
        success: true,
        message: "Affiliate activated.",
      });
    }

    if (action === "delete") {
      const [referrals]: any = await db.execute(
        "SELECT COUNT(*) AS total FROM affiliate_referrals WHERE affiliate_id = ?",
        [affiliate_id]
      );

      const totalReferrals = Number(referrals[0]?.total || 0);

      if (totalReferrals > 0) {
        return NextResponse.json(
          {
            error:
              "This affiliate has referral sales records. Deactivate them instead so commission history stays safe.",
          },
          { status: 400 }
        );
      }

      await db.execute("DELETE FROM affiliate_sessions WHERE affiliate_id = ?", [
        affiliate_id,
      ]);

      await db.execute("DELETE FROM affiliates WHERE id = ?", [affiliate_id]);

      return NextResponse.json({
        success: true,
        message: "Affiliate deleted.",
      });
    }

    return NextResponse.json(
      { error: "Invalid affiliate action." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Affiliate action failed." },
      { status: 500 }
    );
  }
}