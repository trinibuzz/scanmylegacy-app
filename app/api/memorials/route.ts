import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const [sessionRows]: any = await db.execute(
      "SELECT * FROM sessions WHERE id = ? LIMIT 1",
      [sessionCookie.value]
    );

    if (sessionRows.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const session = sessionRows[0];

    const [userRows]: any = await db.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [session.user_id]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const user = userRows[0];

    const formData = await req.formData();

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

    const inviteToken =
      Math.random().toString(36).substring(2) + Date.now();

    await db.execute(
      "INSERT INTO memorials (user_id, full_name, birth_date, death_date, biography, invite_token, cover_photo) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        user.id,
        full_name,
        birth_date,
        death_date,
        biography,
        inviteToken,
        coverPhotoPath,
      ]
    );

    return NextResponse.json({
      success: true,
      link: `/memorial/${inviteToken}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}