import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";

type GiftOrderBody = {
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  recipient_name?: string;
  relationship?: string;
  recipient_status?: "living" | "passed" | "unknown";
  occasion?: string;
  gift_message?: string;
  delivery_method?: "whatsapp" | "email" | "print" | "private";
  package_name?: string;
  package_price_usd?: number;
  package_price_ttd?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GiftOrderBody;

    const {
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
    } = body;

    if (!buyer_name || !buyer_email || !recipient_name || !package_name) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const setupToken = crypto.randomBytes(32).toString("hex");

    const [result]: any = await pool.query(
      `
      INSERT INTO legacy_gift_orders (
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
        setup_token
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        buyer_name,
        buyer_email,
        buyer_phone || null,
        recipient_name,
        relationship || null,
        recipient_status || "unknown",
        occasion || null,
        gift_message || null,
        delivery_method || "whatsapp",
        package_name,
        package_price_usd || 0,
        package_price_ttd || 0,
        setupToken,
      ]
    );

    return NextResponse.json({
      success: true,
      gift_order_id: result.insertId,
      setup_token: setupToken,
      setup_link: `/gift/setup/${setupToken}`,
    });
  } catch (error) {
    console.error("Gift order error:", error);

    return NextResponse.json(
      { error: "Unable to create gift order." },
      { status: 500 }
    );
  }
}