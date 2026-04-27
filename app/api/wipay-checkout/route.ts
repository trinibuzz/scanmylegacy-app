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
    const apiKey = process.env.WIPAY_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!accountNumber || !apiKey || !siteUrl) {
      return NextResponse.json(
        { error: "WiPay environment variables missing" },
        { status: 500 }
      );
    }

    const payload = {
      account_number: accountNumber,
      reason: `${package_name} - ScanMyLegacy Memorial`,
      amount: package_price,
      currency: "TTD",
      name: customer_name || "Customer",
      response_url: `${siteUrl}/payment-success?memorial_id=${memorial_id}`,
      cancel_url: `${siteUrl}/payment-cancelled?memorial_id=${memorial_id}`,
    };

    const response = await fetch(
      "https://tt.wipayfinancial.com/plugins/payments/request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.message || "WiPay checkout failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkout_url: data.url || data.payment_url,
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