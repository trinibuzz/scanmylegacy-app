import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

function getPublicHtmlRoot() {
  const cwd = process.cwd();

  if (cwd.includes("public_html")) {
    const beforePublicHtml = cwd.split("public_html")[0];
    return path.join(beforePublicHtml, "public_html");
  }

  return path.join(cwd, "public");
}

async function ensureChatUploadFolder() {
  const publicRoot = getPublicHtmlRoot();
  const chatRoot = path.join(publicRoot, "uploads", "chat");

  await mkdir(chatRoot, { recursive: true });

  return chatRoot;
}

function makeSafeFileName(originalName: string, fallback: string) {
  const cleanOriginalName = originalName.split("/").pop() || fallback;

  const safeName = cleanOriginalName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");

  return `${Date.now()}-${safeName}`;
}

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
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let memorial_id = "";
    let guest_name = "";
    let bodyText = "";
    let imageUrl = "";
    let videoUrl = "";
    let audioUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      memorial_id = formData.get("memorial_id") as string;
      guest_name = formData.get("guest_name") as string;
      bodyText = ((formData.get("body") as string) || "").trim();

      const mediaFile = formData.get("media") as File | null;

      if (mediaFile && mediaFile.size > 0) {
        const maxFileSize = 50 * 1024 * 1024;

        if (mediaFile.size > maxFileSize) {
          return NextResponse.json(
            {
              error:
                "File is too large. Please upload a file under 50MB.",
            },
            { status: 400 }
          );
        }

        const isImage = mediaFile.type.startsWith("image/");
        const isVideo = mediaFile.type.startsWith("video/");
        const isAudio = mediaFile.type.startsWith("audio/");

        if (!isImage && !isVideo && !isAudio) {
          return NextResponse.json(
            {
              error:
                "Please upload an image, video, or audio file only.",
            },
            { status: 400 }
          );
        }

        const chatRoot = await ensureChatUploadFolder();

        const bytes = await mediaFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = makeSafeFileName(mediaFile.name, "chat-media");
        await writeFile(path.join(chatRoot, fileName), buffer);

        const fileUrl = `/uploads/chat/${fileName}`;

        if (isImage) imageUrl = fileUrl;
        if (isVideo) videoUrl = fileUrl;
        if (isAudio) audioUrl = fileUrl;
      }
    } else {
      const body = await req.json();

      memorial_id = body.memorial_id;
      guest_name = body.guest_name;
      bodyText = (body.body || "").trim();
    }

    if (!memorial_id || !guest_name) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (!bodyText && !imageUrl && !videoUrl && !audioUrl) {
      return NextResponse.json(
        {
          error: "Please enter a message or attach a file.",
        },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `INSERT INTO memorial_chat_messages
      (memorial_id, guest_name, body, image_url, video_url, audio_url)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        memorial_id,
        guest_name,
        bodyText,
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
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}