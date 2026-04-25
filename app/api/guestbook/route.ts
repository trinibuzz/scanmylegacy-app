import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const uploadDir =
  "/home/u569694274/domains/deepskyblue-donkey-850675.hostingersite.com/public_html/uploads";

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]/g, "-");
}

async function saveFile(file: File | null, folderPrefix: string) {
  if (!file || file.size === 0) return "";

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${folderPrefix}-${safeFileName(file.name)}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const [memorialRows]: any = await db.execute(
      "SELECT id FROM memorials WHERE invite_token = ? LIMIT 1",
      [token]
    );

    if (memorialRows.length === 0) {
      return NextResponse.json({ error: "Invalid memorial" }, { status: 404 });
    }

    const memorial = memorialRows[0];

    const [entries]: any = await db.execute(
      "SELECT * FROM guestbook_entries WHERE memorial_id = ? ORDER BY created_at DESC",
      [memorial.id]
    );

    return NextResponse.json({ entries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const token = formData.get("token") as string;
    const guest_name = formData.get("guest_name") as string;
    const message = formData.get("message") as string;

    const image = formData.get("image") as File | null;
    const video = formData.get("video") as File | null;
    const audio = formData.get("audio") as File | null;

    if (!token || !guest_name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const [memorialRows]: any = await db.execute(
      "SELECT id FROM memorials WHERE invite_token = ? LIMIT 1",
      [token]
    );

    if (memorialRows.length === 0) {
      return NextResponse.json({ error: "Invalid memorial" }, { status: 404 });
    }

    const memorial = memorialRows[0];

    const imageUrl = await saveFile(image, "image");
    const videoUrl = await saveFile(video, "video");
    const audioUrl = await saveFile(audio, "audio");

    await db.execute(
      "INSERT INTO guestbook_entries (memorial_id, guest_name, message, image_url, video_url, audio_url) VALUES (?, ?, ?, ?, ?, ?)",
      [memorial.id, guest_name, message, imageUrl, videoUrl, audioUrl]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}