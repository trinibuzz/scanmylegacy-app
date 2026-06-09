import Link from "next/link";
import mysql from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GiftOrder = {
  id: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  recipient_name: string;
  relationship: string | null;
  recipient_status: string | null;
  occasion: string | null;
  gift_message: string | null;
  delivery_method: string | null;
  package_name: string | null;
  package_price_usd: string | number | null;
  package_price_ttd: string | number | null;
  payment_status: string | null;
  gift_status: string | null;
  setup_token: string | null;
  memorial_id: number | null;
  admin_notes: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

async function getConnection() {
  const password = process.env.MYSQL_PASSWORD;

  if (!password) {
    throw new Error(
      "MYSQL_PASSWORD is missing. Add it in Hostinger Node.js environment variables."
    );
  }

  return mysql.createConnection({
    host: "mysql.hostinger.com",
    user: "u569694274_slegacy",
    password,
    database: "u569694274_mylegacy",
  });
}

async function getGiftOrders() {
  let connection: mysql.Connection | null = null;

  try {
    connection = await getConnection();

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `
      SELECT
        id,
        buyer_name,
        buyer_email,
        buyer_phone,
        recipient_name,
        relationship,
        recipient_status,
        occasion,
        gift_message,
        delivery_method,
        package_name,
        package_price_usd,
        package_price_ttd,
        payment_status,
        gift_status,
        setup_token,
        memorial_id,
        admin_notes,
        created_at,
        updated_at
      FROM legacy_gift_orders
      ORDER BY created_at DESC
      `
    );

    return {
      orders: rows as GiftOrder[],
      error: "",
    };
  } catch (error) {
    console.error("Admin gift orders error:", error);

    return {
      orders: [] as GiftOrder[],
      error: error instanceof Error ? error.message : "Unable to load gift orders.",
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

function formatDate(value: Date | string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMoney(value: string | number | null, currency: "USD" | "TTD") {
  const numberValue = Number(value || 0);

  if (!numberValue) {
    return currency === "USD" ? "$0 USD" : "TTD $0";
  }

  if (currency === "USD") {
    return `$${numberValue.toFixed(2)} USD`;
  }

  return `TTD $${numberValue.toFixed(2)}`;
}

function getBadgeClass(status: string | null) {
  const cleanStatus = String(status || "").toLowerCase();

  if (cleanStatus === "paid" || cleanStatus === "verified" || cleanStatus === "completed") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }

  if (cleanStatus === "sent" || cleanStatus === "opened" || cleanStatus === "setup_started") {
    return "border-blue-400/30 bg-blue-400/10 text-blue-200";
  }

  if (cleanStatus === "rejected") {
    return "border-red-400/30 bg-red-400/10 text-red-200";
  }

  return "border-yellow-400/30 bg-yellow-400/10 text-yellow-200";
}

export default async function AdminGiftOrdersPage() {
  const { orders, error } = await getGiftOrders();

  return (
    <main className="min-h-screen bg-[#071426] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#d4af37]">
              ScanMyLegacy Admin
            </p>

            <h1 className="mt-3 font-serif text-4xl">
              Gift Orders
            </h1>

            <p className="mt-2 text-white/70">
              View all Gift a Legacy Page orders submitted from the website.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/dashboard"
              className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Admin Dashboard
            </Link>

            <Link
              href="/gift/start"
              className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-[#071426]"
            >
              New Gift Order
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-100">
            <p className="font-semibold">Unable to load gift orders.</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard title="Total Gift Orders" value={orders.length} />
          <StatCard
            title="Pending Payment"
            value={
              orders.filter((order) => order.payment_status === "pending").length
            }
          />
          <StatCard
            title="Paid / Verified"
            value={
              orders.filter(
                (order) =>
                  order.payment_status === "paid" ||
                  order.payment_status === "verified"
              ).length
            }
          />
          <StatCard
            title="Completed"
            value={
              orders.filter((order) => order.gift_status === "completed").length
            }
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#d4af37]/25 bg-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#0b1f3a] text-xs uppercase tracking-wider text-[#d4af37]">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Buyer</th>
                  <th className="px-5 py-4">Recipient</th>
                  <th className="px-5 py-4">Package</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Gift Status</th>
                  <th className="px-5 py-4">Setup Link</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-white/60">
                      No gift orders found yet.
                    </td>
                  </tr>
                )}

                {orders.map((order) => {
                  const setupLink = order.setup_token
                    ? `https://scanmylegacy.com/gift/setup/${order.setup_token}`
                    : "";

                  return (
                    <tr key={order.id} className="align-top hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">#{order.id}</p>
                        <p className="mt-1 text-xs text-white/50">
                          {order.delivery_method || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">
                          {order.buyer_name}
                        </p>
                        <p className="mt-1 text-white/65">{order.buyer_email}</p>
                        <p className="mt-1 text-white/50">
                          {order.buyer_phone || "No phone"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">
                          {order.recipient_name}
                        </p>
                        <p className="mt-1 text-white/65">
                          {order.relationship || "—"}
                        </p>
                        <p className="mt-1 text-white/50">
                          {order.recipient_status || "unknown"}
                          {order.occasion ? ` • ${order.occasion}` : ""}
                        </p>

                        {order.gift_message && (
                          <p className="mt-3 max-w-xs rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-white/65">
                            {order.gift_message}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">
                          {order.package_name || "—"}
                        </p>
                        <p className="mt-1 text-white/60">
                          {formatMoney(order.package_price_usd, "USD")}
                        </p>
                        <p className="mt-1 text-white/50">
                          {formatMoney(order.package_price_ttd, "TTD")}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClass(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status || "pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClass(
                            order.gift_status
                          )}`}
                        >
                          {order.gift_status || "created"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {setupLink ? (
                          <div className="max-w-xs">
                            <a
                              href={setupLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#d4af37] underline underline-offset-4 hover:text-yellow-200"
                            >
                              Open Setup Link
                            </a>
                            <p className="mt-2 break-all text-xs text-white/45">
                              {setupLink}
                            </p>
                          </div>
                        ) : (
                          <span className="text-white/50">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-white/60">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-sm text-white/45">
          This page is read-only for now. Next step will add buttons to mark
          gift orders as paid, sent, or completed.
        </p>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-white/55">{title}</p>
      <p className="mt-2 font-serif text-3xl text-[#d4af37]">{value}</p>
    </div>
  );
}