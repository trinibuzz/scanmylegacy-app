import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MarkPaidBody = {
  gift_order_id?: string | number;
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

export async function POST(req: Request) {
  let connection: mysql.Connection | null = null;

  try {
    const body = (await req.json()) as MarkPaidBody;
    const giftOrderId = body.gift_order_id;

    if (!giftOrderId) {
      return NextResponse.json(
        { error: "Missing gift order ID." },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const [result] = await connection.execute<mysql.ResultSetHeader>(
      `
      UPDATE legacy_gift_orders
      SET
        payment_status = 'verified',
        gift_status = 'setup_started',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      LIMIT 1
      `,
      [giftOrderId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Gift order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gift order marked as paid.",
      gift_order_id: giftOrderId,
    });
  } catch (error) {
    console.error("Gift mark paid error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to mark gift order as paid.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}