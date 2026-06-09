import { NextResponse } from "next/server";
import crypto from "crypto";
import mysql from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
};

function getPackagePrices(packageName: string) {
  if (packageName.includes("Standard Legacy")) {
    return { usd: 59, ttd: 400 };
  }

  if (packageName.includes("Premium Legacy")) {
    return { usd: 89, ttd: 600 };
  }

  if (packageName.includes("Eternal Legacy")) {
    return { usd: 129, ttd: 875 };
  }

  return { usd: 0, ttd: 0 };
}

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

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Gift orders API is working",
  });
}

export async function POST(req: Request) {
  let connection: mysql.Connection | null = null;

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
    } = body;

    if (!buyer_name || !buyer_email || !recipient_name || !package_name) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const prices = getPackagePrices(package_name);
    const setupToken = crypto.randomBytes(32).toString("hex");

    connection = await getConnection();

    const [result] = await connection.execute<mysql.ResultSetHeader>(
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
        prices.usd,
        prices.ttd,
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
      {
        error: "Unable to create gift order.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}