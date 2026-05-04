import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memorialId = searchParams.get("memorial_id");

    if (!memorialId) {
      return NextResponse.json(
        { error: "Missing memorial id" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      `SELECT * FROM memorial_chat_messages
       WHERE memorial_id = ? AND is_deleted = 0
       ORDER BY created_at ASC`,
      [memorialId]
    );

    return NextResponse.json({
      success: true,
      messages: rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const memorial_id = formData.get("memorial_id") as string;
    const guest_name = formData.get("guest_name") as string;
    const bodyText = (formData.get("body") as string) || "";
    const mediaFile = formData.get("media") as File | null;

    if (!memorial_id || !guest_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!bodyText.trim() && (!mediaFile || mediaFile.size === 0)) {
      return NextResponse.json(
        { error: "Please enter a message or attach a file." },
        { status: 400 }
      );
    }

    let imageUrl = "";
    let videoUrl = "";
    let audioUrl = "";

    if (mediaFile && mediaFile.size > 0) {
      const uploadsRoot = path.join(process.cwd(), "public", "uploads", "chat");
      await mkdir(uploadsRoot, { recursive: true });

      const bytes = await mediaFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const originalName = mediaFile.name.split("/").pop() || "chat-media";
      const safeName = originalName.toLowerCase().replace(/[^a-z0-9.]/g, "-");
      const fileName = `${Date.now()}-${safeName}`;

      await writeFile(path.join(uploadsRoot, fileName), buffer);

      const fileUrl = `/uploads/chat/${fileName}`;
      const fileType = mediaFile.type || "";

      if (fileType.startsWith("image/")) {
        imageUrl = fileUrl;
      } else if (fileType.startsWith("video/")) {
        videoUrl = fileUrl;
      } else if (fileType.startsWith("audio/")) {
        audioUrl = fileUrl;
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload image, video, or audio." },
          { status: 400 }
        );
      }
    }

    const [result]: any = await db.execute(
      `INSERT INTO memorial_chat_messages
      (memorial_id, guest_name, body, image_url, video_url, audio_url)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        memorial_id,
        guest_name,
        bodyText.trim(),
        imageUrl || null,
        videoUrl || null,
        audioUrl || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message_id: result.insertId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}