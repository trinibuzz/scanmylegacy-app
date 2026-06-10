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
  created_at: string | null;
};

async function getGiftOrders() {
  let connection: mysql.Connection | null = null;

  try {
    const password = process.env.MYSQL_PASSWORD;

    if (!password) {
      throw new Error("MYSQL_PASSWORD is missing in Hostinger.");
    }

    connection = await mysql.createConnection({
      host: "mysql.hostinger.com",
      user: "u569694274_slegacy",
      password,
      database: "u569694274_mylegacy",
    });

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
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
      FROM legacy_gift_orders
      ORDER BY id DESC
      `
    );

    const cleanRows = JSON.parse(JSON.stringify(rows)) as GiftOrder[];

    return {
      orders: cleanRows,
      error: "",
    };
  } catch (error) {
    return {
      orders: [] as GiftOrder[],
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

function money(value: string | number | null, currency: "USD" | "TTD") {
  const amount = Number(value || 0);

  if (currency === "USD") {
    return `$${amount.toFixed(2)} USD`;
  }

  return `TTD $${amount.toFixed(2)}`;
}

function badge(status: string | null) {
  const value = status || "pending";

  return (
    <span className="inline-block rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold text-[#d4af37]">
      {value}
    </span>
  );
}

export default async function AdminGiftOrdersPage() {
  const { orders, error } = await getGiftOrders();

  return (
    <main className="min-h-screen bg-[#071426] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            ScanMyLegacy Admin
          </p>

          <h1 className="mt-3 font-serif text-4xl">Gift Orders</h1>

          <p className="mt-2 text-white/70">
            Read-only list of Gift a Legacy Page orders.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/admin/dashboard"
              className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Back to Dashboard
            </a>

            <a
              href="/gift/start"
              className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-[#071426]"
            >
              New Gift Order
            </a>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-100">
            <p className="font-semibold">Unable to load gift orders.</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">Total Orders</p>
            <p className="mt-2 text-3xl font-bold text-[#d4af37]">
              {orders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">Pending Payment</p>
            <p className="mt-2 text-3xl font-bold text-[#d4af37]">
              {
                orders.filter((order) => order.payment_status === "pending")
                  .length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">Paid / Verified</p>
            <p className="mt-2 text-3xl font-bold text-[#d4af37]">
              {
                orders.filter(
                  (order) =>
                    order.payment_status === "paid" ||
                    order.payment_status === "verified"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">Completed</p>
            <p className="mt-2 text-3xl font-bold text-[#d4af37]">
              {
                orders.filter((order) => order.gift_status === "completed")
                  .length
              }
            </p>
          </div>
        </div>

        {orders.length === 0 && !error && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
            No gift orders found yet.
          </div>
        )}

        <div className="grid gap-5">
          {orders.map((order) => {
            const setupLink = order.setup_token
              ? `https://scanmylegacy.com/gift/setup/${order.setup_token}`
              : "";

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-[#d4af37]/20 bg-white/5 p-6 shadow-xl"
              >
                <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start">
                  <div>
                    <p className="text-sm text-white/50">Order #{order.id}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">
                      {order.recipient_name}
                    </h2>
                    <p className="mt-1 text-white/60">
                      Created: {order.created_at || "—"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {badge(order.payment_status)}
                    {badge(order.gift_status)}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold text-[#d4af37]">
                      Buyer
                    </p>
                    <p className="mt-2 text-white">{order.buyer_name}</p>
                    <p className="text-white/65">{order.buyer_email}</p>
                    <p className="text-white/50">
                      {order.buyer_phone || "No phone"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#d4af37]">
                      Recipient
                    </p>
                    <p className="mt-2 text-white">{order.recipient_name}</p>
                    <p className="text-white/65">
                      {order.relationship || "—"}
                    </p>
                    <p className="text-white/50">
                      {order.recipient_status || "unknown"}
                      {order.occasion ? ` • ${order.occasion}` : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#d4af37]">
                      Package
                    </p>
                    <p className="mt-2 text-white">
                      {order.package_name || "—"}
                    </p>
                    <p className="text-white/65">
                      {money(order.package_price_usd, "USD")}
                    </p>
                    <p className="text-white/50">
                      {money(order.package_price_ttd, "TTD")}
                    </p>
                  </div>
                </div>

                {order.gift_message && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-[#071426] p-4">
                    <p className="text-sm font-semibold text-[#d4af37]">
                      Gift Message
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-white/75">
                      {order.gift_message}
                    </p>
                  </div>
                )}

                {setupLink && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-[#071426] p-4">
                    <p className="text-sm font-semibold text-[#d4af37]">
                      Setup Link
                    </p>

                    <a
                      href={setupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[#d4af37] underline underline-offset-4"
                    >
                      Open Setup Link
                    </a>

                    <p className="mt-2 break-all text-xs text-white/45">
                      {setupLink}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-white/45">
          This page is read-only. Next we will add admin buttons.
        </p>
      </div>
    </main>
  );
}