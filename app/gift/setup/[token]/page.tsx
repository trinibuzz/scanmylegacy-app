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
  created_at: string | null;
};

async function getGiftOrder(token: string) {
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
        memorial_id,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
      FROM legacy_gift_orders
      WHERE setup_token = ?
      LIMIT 1
      `,
      [token]
    );

    const cleanRows = JSON.parse(JSON.stringify(rows)) as GiftOrder[];

    return {
      order: cleanRows[0] || null,
      error: "",
    };
  } catch (error) {
    return {
      order: null,
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

function isGiftActive(order: GiftOrder) {
  return (
    order.payment_status === "verified" ||
    order.payment_status === "paid" ||
    order.package_price_usd === "0.00" ||
    Number(order.package_price_usd || 0) === 0
  );
}

export default async function GiftSetupPage({
  params,
}: {
  params: { token: string };
}) {
  const { order, error } = await getGiftOrder(params.token);

  if (error) {
    return (
      <main className="min-h-screen bg-[#071426] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/30 bg-red-400/10 p-8 text-center">
          <div className="mb-5 text-5xl">⚠️</div>

          <h1 className="font-serif text-4xl text-red-100">
            Gift Setup Error
          </h1>

          <p className="mt-4 text-red-100/80">{error}</p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-[#d4af37] px-6 py-3 font-semibold text-[#071426]"
          >
            Back Home
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#071426] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mb-5 text-5xl">🔒</div>

          <h1 className="font-serif text-4xl text-[#d4af37]">
            Gift Link Not Found
          </h1>

          <p className="mt-4 text-white/70">
            This Legacy Gift link is invalid or no longer available.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-[#d4af37] px-6 py-3 font-semibold text-[#071426]"
          >
            Back Home
          </Link>
        </div>
      </main>
    );
  }

  const active = isGiftActive(order);

  return (
    <main className="min-h-screen bg-[#071426] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.35em] text-[#d4af37]">
          ScanMyLegacy Gift Setup
        </p>

        <h1 className="mt-4 font-serif text-4xl md:text-6xl">
          {active ? "Your Legacy Gift Is Ready" : "This Gift Is Not Active Yet"}
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">
          {active
            ? "This Legacy Gift has been paid and verified. You can now begin preparing the digital memory page for your loved one."
            : "This Legacy Gift has been created, but payment has not been verified yet. Once payment is confirmed, this setup page will become active."}
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-3xl border border-[#d4af37]/25 bg-white/5 p-6 md:p-8">
            <h2 className="font-serif text-3xl text-[#d4af37]">
              Gift Details
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info label="Gift Order" value={`#${order.id}`} />
              <Info label="Payment Status" value={order.payment_status || "pending"} />
              <Info label="Gift Status" value={order.gift_status || "created"} />
              <Info label="Package" value={order.package_name || "—"} />
              <Info label="Amount USD" value={money(order.package_price_usd, "USD")} />
              <Info label="Amount TTD" value={money(order.package_price_ttd, "TTD")} />
              <Info label="Recipient" value={order.recipient_name} />
              <Info label="Relationship" value={order.relationship || "—"} />
              <Info label="Occasion" value={order.occasion || "—"} />
              <Info label="Recipient Status" value={order.recipient_status || "unknown"} />
            </div>

            {order.gift_message && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#071426] p-5">
                <p className="text-sm uppercase tracking-wider text-[#d4af37]">
                  Gift Message
                </p>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-white/75">
                  {order.gift_message}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h2 className="font-serif text-3xl text-[#d4af37]">
              Next Step
            </h2>

            {active ? (
              <>
                <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5">
                  <p className="font-semibold text-emerald-100">
                    Payment Verified
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
                    This gift is ready for setup. The next step will connect
                    this gift order to the memorial creation form.
                  </p>
                </div>

                <Link
                  href={`/create-memorial?gift_token=${encodeURIComponent(
                    params.token
                  )}`}
                  className="mt-6 block rounded-full bg-[#d4af37] px-6 py-4 text-center font-semibold text-[#071426]"
                >
                  Start Building Legacy Page
                </Link>

                <p className="mt-4 text-sm leading-relaxed text-white/55">
                  If this button does not open the correct memorial form yet, no
                  problem. The setup page is working, and the next step is to
                  connect it to your existing memorial creation page.
                </p>
              </>
            ) : (
              <>
                <div className="mt-6 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-5">
                  <p className="font-semibold text-yellow-100">
                    Awaiting Payment Verification
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-yellow-100/80">
                    The setup link will become active once payment is confirmed
                    by ScanMyLegacy.
                  </p>
                </div>

                <Link
                  href={`/payment-option?payment_for=gift&gift_order_id=${order.id}&package_name=${encodeURIComponent(
                    order.package_name || ""
                  )}&package_price=${encodeURIComponent(
                    String(order.package_price_usd || 0)
                  )}&customer_name=${encodeURIComponent(order.buyer_name)}`}
                  className="mt-6 block rounded-full bg-[#d4af37] px-6 py-4 text-center font-semibold text-[#071426]"
                >
                  Complete Payment
                </Link>
              </>
            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#071426] p-5">
              <p className="font-semibold text-[#d4af37]">Need Help?</p>

              <p className="mt-2 text-sm text-white/70">
                Contact ScanMyLegacy support with Gift Order #{order.id}.
              </p>

              <a
                href={`https://wa.me/18687893192?text=${encodeURIComponent(
                  `Good day, I need help with ScanMyLegacy Gift Order #${order.id}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full border border-[#d4af37]/60 px-5 py-3 text-sm font-semibold text-[#d4af37]"
              >
                WhatsApp Support
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071426] p-4">
      <p className="text-xs uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-2 break-words text-white">{value}</p>
    </div>
  );
}