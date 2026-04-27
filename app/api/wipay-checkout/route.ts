import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      memorial_id,
      package_name,
      package_price,
      customer_name,
    } = body;

    if (!memorial_id || !package_price) {
      return NextResponse.json(
        { error: "Missing payment data" },
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

    const payload = new URLSearchParams();

    payload.append("account_number", accountNumber);
    payload.append("country_code", "TT");
    payload.append("currency", "TTD");
    payload.append("environment", "live");
    payload.append("fee_structure", "customer_pay");
    payload.append("method", "credit_card");
    payload.append("order_id", `memorial_${memorial_id}`);
    payload.append("origin", "ScanMyLegacy");
    payload.append(
      "response_url",
      `${siteUrl}/payment-success?memorial_id=${memorial_id}`
    );
    payload.append("total", String(package_price));

    const response = await fetch(
      "https://tt.wipayfinancial.com/plugins/payments/request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
      }
    );

    const responseText = await response.text();

    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          error: "WiPay returned invalid response",
          details: responseText.slice(0, 500),
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.message || data.error || "WiPay checkout failed",
          details: data,
        },
        { status: 500 }
      );
    }

    const checkoutUrl =
      data.url ||
      data.payment_url ||
      data.redirect_url ||
      data.checkout_url;

    if (!checkoutUrl) {
      return NextResponse.json(
        {
          error: "WiPay did not return checkout URL",
          details: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkout_url: checkoutUrl,
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