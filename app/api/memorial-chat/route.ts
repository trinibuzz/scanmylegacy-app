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

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      memorial_id = formData.get("memorial_id") as string;
      guest_name = formData.get("guest_name") as string;
      bodyText = ((formData.get("body") as string) || "").trim();

      const imageFile = formData.get("image") as File | null;

      if (imageFile && imageFile.size > 0) {
        if (!imageFile.type.startsWith("image/")) {
          return NextResponse.json(
            { error: "Please upload an image file only." },
            { status: 400 }
          );
        }

        const uploadsRoot = path.join(
          process.cwd(),
          "public",
          "uploads",
          "chat"
        );

        await mkdir(uploadsRoot, { recursive: true });

        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const originalName = imageFile.name.split("/").pop() || "chat-photo";
        const safeName = originalName
          .toLowerCase()
          .replace(/[^a-z0-9.]/g, "-");

        const fileName = `${Date.now()}-${safeName}`;

        await writeFile(path.join(uploadsRoot, fileName), buffer);

        imageUrl = `/uploads/chat/${fileName}`;
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

    if (!bodyText && !imageUrl) {
      return NextResponse.json(
        {
          error: "Please enter a message or attach a photo.",
        },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `INSERT INTO memorial_chat_messages
      (memorial_id, guest_name, body, image_url)
      VALUES (?, ?, ?, ?)`,
      [memorial_id, guest_name, bodyText, imageUrl || null]
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