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

async function verifyOwner(memorialId: string, userId: number) {
  const [rows]: any = await db.execute(
    "SELECT id FROM memorials WHERE id = ? AND user_id = ? LIMIT 1",
    [memorialId, userId]
  );

  return rows.length > 0;
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const url = new URL(req.url);
    const memorialId = url.searchParams.get("memorial_id") || "";

    const owns = await verifyOwner(memorialId, userId);
    if (!owns) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

    const [files]: any = await db.execute(
      "SELECT * FROM memorial_gallery WHERE memorial_id = ? ORDER BY created_at DESC",
      [memorialId]
    );

    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const formData = await req.formData();
    const memorialId = formData.get("memorial_id") as string;
    const file = formData.get("file") as File | null;

    const owns = await verifyOwner(memorialId, userId);
    if (!owns) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadDir =
      "/home/u569694274/domains/deepskyblue-donkey-850675.hostingersite.com/public_html/uploads";

    await mkdir(uploadDir, { recursive: true });

    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "-");
    const fileName = `${Date.now()}-gallery-${safeName}`;
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const fileUrl = `/uploads/${fileName}`;

    let fileType = "file";
    if (file.type.startsWith("image/")) fileType = "image";
    if (file.type.startsWith("video/")) fileType = "video";
    if (file.type.startsWith("audio/")) fileType = "audio";

    await db.execute(
      "INSERT INTO memorial_gallery (memorial_id, file_type, file_url) VALUES (?, ?, ?)",
      [memorialId, fileType, fileUrl]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}