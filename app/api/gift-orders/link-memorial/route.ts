import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LinkMemorialBody = {
  gift_token?: string;
  memorial_id?: string | number;
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
    const body = (await req.json()) as LinkMemorialBody;

    if (!body.gift_token || !body.memorial_id) {
      return NextResponse.json(
        { error: "Missing gift token or memorial ID." },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const [result] = await connection.execute<mysql.ResultSetHeader>(
      `
      UPDATE legacy_gift_orders
      SET
        memorial_id = ?,
        gift_status = 'completed',
        updated_at = CURRENT_TIMESTAMP
      WHERE setup_token = ?
      LIMIT 1
      `,
      [body.memorial_id, body.gift_token]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Gift order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gift order connected to memorial.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect gift order.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}