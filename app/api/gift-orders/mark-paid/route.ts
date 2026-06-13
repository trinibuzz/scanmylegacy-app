import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MarkPaidBody = {
  gift_order_id?: string | number;
};

type ColumnRow = {
  Field: string;
};

type GiftOrderRow = {
  id: number;
  memorial_id?: number | null;
  linked_memorial_id?: number | null;
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

async function getTableColumns(connection: mysql.Connection, tableName: string) {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    `SHOW COLUMNS FROM \`${tableName}\``
  );

  return rows.map((row) => String((row as ColumnRow).Field));
}

function hasColumn(columns: string[], columnName: string) {
  return columns.includes(columnName);
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

    const giftOrderColumns = await getTableColumns(
      connection,
      "legacy_gift_orders"
    );

    const memorialColumns = await getTableColumns(connection, "memorials");

    const [giftRows] = await connection.execute<mysql.RowDataPacket[]>(
      `
      SELECT *
      FROM legacy_gift_orders
      WHERE id = ?
      LIMIT 1
      `,
      [giftOrderId]
    );

    if (giftRows.length === 0) {
      return NextResponse.json(
        { error: "Gift order not found." },
        { status: 404 }
      );
    }

    const giftOrder = giftRows[0] as GiftOrderRow;

    const linkedMemorialId =
      giftOrder.memorial_id || giftOrder.linked_memorial_id || null;

    const giftOrderUpdates: string[] = [];
    const giftOrderValues: any[] = [];

    if (hasColumn(giftOrderColumns, "payment_status")) {
      giftOrderUpdates.push("payment_status = ?");
      giftOrderValues.push("verified");
    }

    if (hasColumn(giftOrderColumns, "gift_status")) {
      giftOrderUpdates.push("gift_status = ?");
      giftOrderValues.push(linkedMemorialId ? "completed" : "setup_started");
    }

    if (hasColumn(giftOrderColumns, "paid_at")) {
      giftOrderUpdates.push("paid_at = CURRENT_TIMESTAMP");
    }

    if (hasColumn(giftOrderColumns, "verified_at")) {
      giftOrderUpdates.push("verified_at = CURRENT_TIMESTAMP");
    }

    if (hasColumn(giftOrderColumns, "updated_at")) {
      giftOrderUpdates.push("updated_at = CURRENT_TIMESTAMP");
    }

    if (giftOrderUpdates.length > 0) {
      await connection.execute(
        `
        UPDATE legacy_gift_orders
        SET ${giftOrderUpdates.join(", ")}
        WHERE id = ?
        LIMIT 1
        `,
        [...giftOrderValues, giftOrderId]
      );
    }

    let memorialUpdated = false;

    if (linkedMemorialId) {
      const memorialUpdates: string[] = [];
      const memorialValues: any[] = [];

      if (hasColumn(memorialColumns, "payment_status")) {
        memorialUpdates.push("payment_status = ?");
        memorialValues.push("verified");
      }

      if (hasColumn(memorialColumns, "payment_verified")) {
        memorialUpdates.push("payment_verified = ?");
        memorialValues.push(1);
      }

      if (hasColumn(memorialColumns, "status")) {
        memorialUpdates.push("status = ?");
        memorialValues.push("active");
      }

      if (hasColumn(memorialColumns, "is_active")) {
        memorialUpdates.push("is_active = ?");
        memorialValues.push(1);
      }

      if (hasColumn(memorialColumns, "activated_at")) {
        memorialUpdates.push("activated_at = CURRENT_TIMESTAMP");
      }

      if (hasColumn(memorialColumns, "updated_at")) {
        memorialUpdates.push("updated_at = CURRENT_TIMESTAMP");
      }

      if (memorialUpdates.length > 0) {
        await connection.execute(
          `
          UPDATE memorials
          SET ${memorialUpdates.join(", ")}
          WHERE id = ?
          LIMIT 1
          `,
          [...memorialValues, linkedMemorialId]
        );

        memorialUpdated = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: linkedMemorialId
        ? "Gift order marked as paid and connected memorial activated."
        : "Gift order marked as paid. Memorial will activate after setup is linked.",
      gift_order_id: giftOrderId,
      linked_memorial_id: linkedMemorialId,
      memorial_updated: memorialUpdated,
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