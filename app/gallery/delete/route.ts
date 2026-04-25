import { db } from "../../../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getUserId() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) return null;

  const [sessionRows]: any = await db.execute(
    "SELECT * FROM sessions WHERE id = ? LIMIT 1",
    [sessionCookie.value]
  );

  if (sessionRows.length === 0) return null;

  return sessionRows[0].user_id;
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const memorialId = url.searchParams.get("memorial_id");

    const [rows]: any = await db.execute(
      `SELECT mg.id
       FROM memorial_gallery mg
       JOIN memorials m ON mg.memorial_id = m.id
       WHERE mg.id = ? 
       AND mg.memorial_id = ? 
       AND m.user_id = ?
       LIMIT 1`,
      [id, memorialId, userId]
    );

    if (rows.length === 0) {
      return NextResponse.redirect(
        new URL(`/gallery/${memorialId}`, req.url)
      );
    }

    await db.execute(
      "DELETE FROM memorial_gallery WHERE id = ? AND memorial_id = ?",
      [id, memorialId]
    );

    return NextResponse.redirect(
      new URL(`/gallery/${memorialId}`, req.url)
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}