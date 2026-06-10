import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GiftOrderRow = {
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
};

async function getConnection() {
  const password = process.env.MYSQL_PASSWORD;

  if (!password) {
    throw new Error("MYSQL_PASSWORD is missing in Hostinger.");
  }

  return mysql.createConnection({
    host: "mysql.hostinger.com",
    user: "u569694274_slegacy",
    password,
    database: "u569694274_mylegacy",
  });
}

export async function GET(req: Request) {
  let connection: mysql.Connection | null = null;

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing gift token." },
        { status: 400 }
      );
    }

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
        memorial_id
      FROM legacy_gift_orders
      WHERE setup_token = ?
      LIMIT 1
      `,
      [token]
    );

    const cleanRows = JSON.parse(JSON.stringify(rows)) as GiftOrderRow[];
    const order = cleanRows[0];

    if (!order) {
      return NextResponse.json(
        { error: "Gift order not found." },
        { status: 404 }
      );
    }

    const isActive =
      order.payment_status === "verified" ||
      order.payment_status === "paid" ||
      Number(order.package_price_usd || 0) === 0;

    if (!isActive) {
      return NextResponse.json(
        { error: "This gift is not active yet." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load gift order.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}