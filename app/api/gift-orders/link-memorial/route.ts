import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LinkMemorialBody = {
  gift_token?: string;
  memorial_id?: string | number;
};

type ColumnRow = {
  Field: string;
};

type GiftOrderRow = {
  id: number;
  payment_status?: string | null;
  package_slug?: string | null;
  package_name?: string | null;
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

function isGiftPaid(paymentStatus?: string | null) {
  const status = String(paymentStatus || "").toLowerCase();

  return (
    status === "paid" ||
    status === "verified" ||
    status === "payment_verified" ||
    status.includes("paid") ||
    status.includes("verified")
  );
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

    const giftOrderColumns = await getTableColumns(
      connection,
      "legacy_gift_orders"
    );

    const memorialColumns = await getTableColumns(connection, "memorials");

    const [giftRows] = await connection.execute<mysql.RowDataPacket[]>(
      `
      SELECT *
      FROM legacy_gift_orders
      WHERE setup_token = ?
      LIMIT 1
      `,
      [body.gift_token]
    );

    if (giftRows.length === 0) {
      return NextResponse.json(
        { error: "Gift order not found." },
        { status: 404 }
      );
    }

    const giftOrder = giftRows[0] as GiftOrderRow;
    const giftPaid = isGiftPaid(giftOrder.payment_status);

    const giftOrderUpdates: string[] = [];
    const giftOrderValues: any[] = [];

    if (hasColumn(giftOrderColumns, "memorial_id")) {
      giftOrderUpdates.push("memorial_id = ?");
      giftOrderValues.push(body.memorial_id);
    }

    if (hasColumn(giftOrderColumns, "gift_status")) {
      giftOrderUpdates.push("gift_status = ?");
      giftOrderValues.push(giftPaid ? "completed" : "setup_started");
    }

    if (hasColumn(giftOrderColumns, "updated_at")) {
      giftOrderUpdates.push("updated_at = CURRENT_TIMESTAMP");
    }

    if (giftOrderUpdates.length > 0) {
      await connection.execute(
        `
        UPDATE legacy_gift_orders
        SET ${giftOrderUpdates.join(", ")}
        WHERE setup_token = ?
        LIMIT 1
        `,
        [...giftOrderValues, body.gift_token]
      );
    }

    let memorialUpdated = false;

    if (giftPaid) {
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

      if (hasColumn(memorialColumns, "package_slug") && giftOrder.package_slug) {
        memorialUpdates.push("package_slug = ?");
        memorialValues.push(giftOrder.package_slug);
      }

      if (hasColumn(memorialColumns, "package_name") && giftOrder.package_name) {
        memorialUpdates.push("package_name = ?");
        memorialValues.push(giftOrder.package_name);
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
          [...memorialValues, body.memorial_id]
        );

        memorialUpdated = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: giftPaid
        ? "Gift order connected to memorial and memorial activated."
        : "Gift order connected to memorial. It will activate after payment is verified.",
      memorial_id: body.memorial_id,
      gift_order_id: giftOrder.id,
      gift_paid: giftPaid,
      memorial_updated: memorialUpdated,
    });
  } catch (error) {
    console.error("Gift link memorial error:", error);

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