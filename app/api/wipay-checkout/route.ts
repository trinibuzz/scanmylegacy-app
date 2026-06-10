import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WiPayCheckoutBody = {
  payment_for?: "memorial" | "gift";
  memorial_id?: string | number;
  gift_order_id?: string | number;
  package_name?: string;
  package_price?: string | number;
  customer_name?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WiPayCheckoutBody;

    const {
      payment_for,
      memorial_id,
      gift_order_id,
      package_name,
      package_price,
      customer_name,
    } = body;

    const paymentFor = payment_for === "gift" ? "gift" : "memorial";
    const isGiftPayment = paymentFor === "gift";

    if (isGiftPayment && !gift_order_id) {
      return NextResponse.json(
        { error: "Missing gift order information" },
        { status: 400 }
      );
    }

    if (!isGiftPayment && !memorial_id) {
      return NextResponse.json(
        { error: "Missing memorial information" },
        { status: 400 }
      );
    }

    if (!package_price) {
      return NextResponse.json(
        { error: "Missing payment amount" },
        { status: 400 }
      );
    }

    const accountNumber = process.env.WIPAY_ACCOUNT_NUMBER;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!accountNumber || !siteUrl) {
      return NextResponse.json(
        { error: "WiPay environment variables missing" },
        { status: 500 }
      );
    }

    const priceNumber = Number(package_price);

    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const exchangeRate = 6.8;
    const ttdAmount = (priceNumber * exchangeRate).toFixed(2);

    const orderId = isGiftPayment
      ? `gift_${gift_order_id}`
      : `memorial_${memorial_id}`;

    const responseUrl = isGiftPayment
      ? `${siteUrl}/payment-success?payment_for=gift&gift_order_id=${encodeURIComponent(
          String(gift_order_id)
        )}`
      : `${siteUrl}/payment-success?payment_for=memorial&memorial_id=${encodeURIComponent(
          String(memorial_id)
        )}`;

    const payload = new URLSearchParams();

    payload.append("account_number", accountNumber);
    payload.append("country_code", "TT");
    payload.append("currency", "TTD");
    payload.append("environment", "live");
    payload.append("fee_structure", "customer_pay");
    payload.append("method", "credit_card");
    payload.append("order_id", orderId);
    payload.append("origin", "ScanMyLegacy");
    payload.append("response_url", responseUrl);
    payload.append("total", ttdAmount);

    if (package_name) {
      payload.append("description", package_name);
    }

    if (customer_name) {
      payload.append("customer_name", customer_name);
    }

    const response = await fetch(
      "https://tt.wipayfinancial.com/plugins/payments/request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
        redirect: "follow",
      }
    );

    const checkoutUrl = response.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "WiPay did not return checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkout_url: checkoutUrl,
      payment_for: paymentFor,
      order_id: orderId,
      amount_ttd: ttdAmount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "WiPay checkout failed",
      },
      { status: 500 }
    );
  }
}