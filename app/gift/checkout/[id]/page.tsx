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
  delivery_method: string | null;
  package_name: string | null;
  package_price_usd: string | number | null;
  package_price_ttd: string | number | null;
  payment_status: string | null;
  gift_status: string | null;
  created_at: string | null;
};

async function getGiftOrder(id: string) {
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
        delivery_method,
        package_name,
        package_price_usd,
        package_price_ttd,
        payment_status,
        gift_status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
      FROM legacy_gift_orders
      WHERE id = ?
      LIMIT 1
      `,
      [id]
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

export default async function GiftCheckoutPage({
  params,
}: {
  params: { id: string };
}) {
  const { order, error } = await getGiftOrder(params.id);

  if (error) {
    return (
      <main className="min-h-screen bg-[#071426] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/30 bg-red-400/10 p-8">
          <h1 className="font-serif text-3xl text-red-100">
            Checkout Error
          </h1>
          <p className="mt-4 text-red-100/85">{error}</p>

          <Link
            href="/gift/start"
            className="mt-6 inline-block rounded-full bg-[#d4af37] px-6 py-3 font-semibold text-[#071426]"
          >
            Start Again
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#071426] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="font-serif text-3xl">Gift Order Not Found</h1>
          <p className="mt-4 text-white/70">
            We could not find this gift order. Please start again.
          </p>

          <Link
            href="/gift/start"
            className="mt-6 inline-block rounded-full bg-[#d4af37] px-6 py-3 font-semibold text-[#071426]"
          >
            Start Again
          </Link>
        </div>
      </main>
    );
  }

  const isFree = Number(order.package_price_usd || 0) === 0;

  return (
    <main className="min-h-screen bg-[#071426] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.35em] text-[#d4af37]">
          ScanMyLegacy Checkout
        </p>

        <h1 className="mt-4 font-serif text-4xl md:text-5xl">
          Complete Your Legacy Gift
        </h1>

        <p className="mt-4 max-w-2xl text-white/75">
          Your gift order has been created. Complete payment below so we can
          prepare and release the private setup link.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <section className="rounded-3xl border border-[#d4af37]/25 bg-white/5 p-6 md:p-8">
            <h2 className="font-serif text-3xl text-[#d4af37]">
              Order Summary
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info label="Order Number" value={`#${order.id}`} />
              <Info label="Payment Status" value={order.payment_status || "pending"} />
              <Info label="Buyer Name" value={order.buyer_name} />
              <Info label="Buyer Email" value={order.buyer_email} />
              <Info label="Buyer Phone" value={order.buyer_phone || "—"} />
              <Info label="Recipient" value={order.recipient_name} />
              <Info label="Relationship" value={order.relationship || "—"} />
              <Info label="Occasion" value={order.occasion || "—"} />
              <Info label="Package" value={order.package_name || "—"} />
              <Info label="Delivery Method" value={order.delivery_method || "—"} />
            </div>

            <div className="mt-8 rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Amount Due
              </p>

              <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-serif text-4xl text-white">
                    {money(order.package_price_usd, "USD")}
                  </p>
                  <p className="mt-1 text-xl text-white/75">
                    {money(order.package_price_ttd, "TTD")}
                  </p>
                </div>

                <p className="max-w-md text-sm leading-relaxed text-white/70">
                  Payment must be verified before the recipient receives the
                  private setup link.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h2 className="font-serif text-3xl text-[#d4af37]">
              Payment Options
            </h2>

            {isFree ? (
              <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5">
                <p className="font-semibold text-emerald-100">
                  Free Trial Gift
                </p>
                <p className="mt-2 text-emerald-100/80">
                  This is a free 14-day starter tribute. No payment is due.
                  Admin will review and activate the gift.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 rounded-2xl border border-[#d4af37]/25 bg-[#071426] p-5">
                  <p className="font-semibold text-[#d4af37]">
                    Bank Transfer
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-white/75">
                    <p>
                      <span className="text-white">Bank:</span> Add bank name
                    </p>
                    <p>
                      <span className="text-white">Account Name:</span>{" "}
                      ScanMyLegacy
                    </p>
                    <p>
                      <span className="text-white">Account Number:</span> Add
                      account number
                    </p>
                    <p>
                      <span className="text-white">Reference:</span> Gift Order
                      #{order.id}
                    </p>
                  </div>

                  <p className="mt-4 rounded-xl bg-white/5 p-4 text-sm leading-relaxed text-white/70">
                    After sending payment, WhatsApp or email your payment
                    receipt/reference with your Gift Order number.
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-[#071426] p-5">
                  <p className="font-semibold text-[#d4af37]">
                    Online Payment
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    WiPay checkout button will be added here next.
                  </p>

                  <button
                    disabled
                    className="mt-4 w-full rounded-full bg-white/15 px-6 py-3 font-semibold text-white/45"
                  >
                    WiPay Coming Next
                  </button>
                </div>
              </>
            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#071426] p-5">
              <p className="font-semibold text-[#d4af37]">
                Need Help?
              </p>
              <p className="mt-2 text-sm text-white/70">
                Contact ScanMyLegacy support with your order number.
              </p>

              <a
                href={`https://wa.me/18687893192?text=${encodeURIComponent(
                  `Good day, I created Gift Order #${order.id} on ScanMyLegacy and I need help completing payment.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full bg-[#d4af37] px-6 py-3 font-semibold text-[#071426]"
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
      <p className="mt-2 text-white">{value}</p>
    </div>
  );
}