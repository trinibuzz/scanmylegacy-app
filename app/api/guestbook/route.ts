import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");
}

async function saveFile(file: File | null, folderName: string) {
  if (!file || file.size === 0) return "";

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", "guestbook", folderName);
  await mkdir(uploadDir, { recursive: true });

  const originalName = file.name.split("/").pop() || "guestbook-file";
  const fileName = `${Date.now()}-${safeFileName(originalName)}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return `/uploads/guestbook/${folderName}/${fileName}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing memorial token." },
        { status: 400 }
      );
    }

    const [memorialRows]: any = await db.execute(
      "SELECT id FROM memorials WHERE invite_token = ? LIMIT 1",
      [token]
    );

    if (memorialRows.length === 0) {
      return NextResponse.json(
        { error: "Memorial not found." },
        { status: 404 }
      );
    }

    const memorialId = memorialRows[0].id;

    const [entries]: any = await db.execute(
      `SELECT
        id,
        guest_name,
        message,
        image_url,
        video_url,
        audio_url,
        created_at
       FROM guestbook_entries
       WHERE memorial_id = ?
       ORDER BY created_at DESC`,
      [memorialId]
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

    if (!token) {
      return NextResponse.json(
        { error: "Missing memorial token." },
        { status: 400 }
      );
    }

    if (!guest_name || !guest_name.trim()) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Please write a tribute message." },
        { status: 400 }
      );
    }

    const [memorialRows]: any = await db.execute(
      "SELECT id FROM memorials WHERE invite_token = ? LIMIT 1",
      [token]
    );

    if (memorialRows.length === 0) {
      return NextResponse.json(
        { error: "Memorial not found." },
        { status: 404 }
      );
    }

    const memorialId = memorialRows[0].id;

    const imageUrl = await saveFile(image, "images");
    const videoUrl = await saveFile(video, "videos");
    const audioUrl = await saveFile(audio, "audio");

    await db.execute(
      `INSERT INTO guestbook_entries
       (memorial_id, guest_name, message, image_url, video_url, audio_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        memorialId,
        guest_name.trim(),
        message.trim(),
        imageUrl || null,
        videoUrl || null,
        audioUrl || null,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
