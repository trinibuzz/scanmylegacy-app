import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

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
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const [rows]: any = await db.execute(
      "SELECT * FROM memorials WHERE id = ? AND user_id = ? LIMIT 1",
      [id, userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 });
    }

    return NextResponse.json({ memorial: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const formData = await req.formData();

    const id = formData.get("id") as string;
    const full_name = formData.get("full_name") as string;
    const birth_date = formData.get("birth_date") as string;
    const death_date = formData.get("death_date") as string;
    const biography = formData.get("biography") as string;
    const coverPhoto = formData.get("cover_photo") as File | null;

    let coverPhotoPath = "";

    if (coverPhoto && coverPhoto.size > 0) {
      const bytes = await coverPhoto.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir =
        "/home/u569694274/domains/deepskyblue-donkey-850675.hostingersite.com/public_html/uploads";

      await mkdir(uploadDir, { recursive: true });

      const safeName = coverPhoto.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "-");

      const fileName = `${Date.now()}-${safeName}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      coverPhotoPath = `/uploads/${fileName}`;
    }

    if (coverPhotoPath) {
      await db.execute(
        "UPDATE memorials SET full_name = ?, birth_date = ?, death_date = ?, biography = ?, cover_photo = ? WHERE id = ? AND user_id = ?",
        [full_name, birth_date, death_date, biography, coverPhotoPath, id, userId]
      );
    } else {
      await db.execute(
        "UPDATE memorials SET full_name = ?, birth_date = ?, death_date = ?, biography = ? WHERE id = ? AND user_id = ?",
        [full_name, birth_date, death_date, biography, id, userId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}