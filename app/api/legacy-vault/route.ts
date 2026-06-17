import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSessionUserId() {
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

function getPersistentUploadsRoot() {
  const cwd = process.cwd();

  if (cwd.includes("public_html")) {
    const beforePublicHtml = cwd.split("public_html")[0];
    return path.join(beforePublicHtml, "uploads");
  }

  if (cwd.includes("nodejs")) {
    const beforeNodejs = cwd.split("nodejs")[0];
    return path.join(beforeNodejs, "uploads");
  }

  return path.join(cwd, "uploads");
}

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanText(value: any, maxLength = 3000) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeMediaUrl(value: any) {
  if (!value) return null;

  let cleanValue = String(value).trim().replace(/\\/g, "/");

  if (
    cleanValue.startsWith("http://") ||
    cleanValue.startsWith("https://") ||
    cleanValue.startsWith("/api/uploads/")
  ) {
    return cleanValue;
  }

  if (cleanValue.startsWith("/uploads/")) {
    return cleanValue.replace("/uploads/", "/api/uploads/");
  }

  if (cleanValue.startsWith("uploads/")) {
    return cleanValue.replace("uploads/", "/api/uploads/");
  }

  return cleanValue;
}

async function saveFile(file: File | null, folderName: string) {
  if (!file || file.size === 0) return "";

  const maxFileSize = 75 * 1024 * 1024;

  if (file.size > maxFileSize) {
    throw new Error("File is too large. Please upload a file under 75MB.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsRoot = getPersistentUploadsRoot();
  const uploadDir = path.join(uploadsRoot, "legacy-vault", folderName);

  await mkdir(uploadDir, { recursive: true });

  const originalName = file.name.split("/").pop() || "legacy-vault-file";
  const cleanName = safeFileName(originalName) || "legacy-vault-file";
  const fileName = `${Date.now()}-${cleanName}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return `/api/uploads/legacy-vault/${folderName}/${fileName}`;
}

async function getMemorialByToken(token: string) {
  const [rows]: any = await db.execute(
    `
    SELECT id, user_id, page_type
    FROM memorials
    WHERE invite_token = ?
    LIMIT 1
    `,
    [token]
  );

  if (rows.length === 0) return null;

  return rows[0];
}

async function getOwnedMemorial(memorialId: number, userId: number) {
  const [rows]: any = await db.execute(
    `
    SELECT id, user_id, page_type
    FROM memorials
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [memorialId, userId]
  );

  if (rows.length === 0) return null;

  return rows[0];
}

async function getVaultEntry(entryId: number) {
  const [rows]: any = await db.execute(
    `
    SELECT *
    FROM legacy_vault_entries
    WHERE id = ?
    LIMIT 1
    `,
    [entryId]
  );

  if (rows.length === 0) return null;

  return rows[0];
}

function prepareEntry(entry: any) {
  return {
    ...entry,
    image_url: normalizeMediaUrl(entry.image_url),
    video_url: normalizeMediaUrl(entry.video_url),
    audio_url: normalizeMediaUrl(entry.audio_url),
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const token = searchParams.get("token");
    const memorialIdParam = searchParams.get("memorial_id");
    const ownerMode = searchParams.get("owner") === "1";

    let memorialId: number | null = null;

    if (ownerMode) {
      const userId = await getSessionUserId();

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const memorialIdFromQuery = Number(memorialIdParam);

      if (!memorialIdFromQuery) {
        return NextResponse.json(
          { error: "Missing memorial ID." },
          { status: 400 }
        );
      }

      const memorial = await getOwnedMemorial(
        memorialIdFromQuery,
        Number(userId)
      );

      if (!memorial) {
        return NextResponse.json(
          { error: "Legacy page not found." },
          { status: 404 }
        );
      }

      memorialId = Number(memorial.id);
    } else {
      if (!token) {
        return NextResponse.json(
          { error: "Missing legacy token." },
          { status: 400 }
        );
      }

      const memorial = await getMemorialByToken(token);

      if (!memorial) {
        return NextResponse.json(
          { error: "Legacy page not found." },
          { status: 404 }
        );
      }

      memorialId = Number(memorial.id);
    }

    const [rows]: any = await db.execute(
      `
      SELECT
        id,
        memorial_id,
        title,
        category,
        story,
        image_url,
        video_url,
        audio_url,
        sort_order,
        is_visible,
        created_at,
        updated_at
      FROM legacy_vault_entries
      WHERE memorial_id = ?
        ${ownerMode ? "" : "AND is_visible = 1"}
      ORDER BY sort_order ASC, created_at DESC
      `,
      [memorialId]
    );

    return NextResponse.json({
      success: true,
      entries: rows.map((entry: any) => prepareEntry(entry)),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load Legacy Vault." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const memorialId = Number(formData.get("memorial_id"));
    const title = cleanText(formData.get("title"), 255);
    const category = cleanText(formData.get("category"), 100);
    const story = cleanText(formData.get("story"), 10000);
    const sortOrder = Number(formData.get("sort_order") || 0);
    const isVisible = String(formData.get("is_visible") || "1") === "1" ? 1 : 0;

    const image = formData.get("image") as File | null;
    const video = formData.get("video") as File | null;
    const audio = formData.get("audio") as File | null;

    if (!memorialId) {
      return NextResponse.json(
        { error: "Missing legacy page ID." },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    const memorial = await getOwnedMemorial(memorialId, Number(userId));

    if (!memorial) {
      return NextResponse.json(
        { error: "Legacy page not found or access denied." },
        { status: 403 }
      );
    }

    const imageUrl = await saveFile(image, "images");
    const videoUrl = await saveFile(video, "videos");
    const audioUrl = await saveFile(audio, "audio");

    const [result]: any = await db.execute(
      `
      INSERT INTO legacy_vault_entries
      (memorial_id, title, category, story, image_url, video_url, audio_url, sort_order, is_visible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        memorialId,
        title,
        category || null,
        story || null,
        imageUrl || null,
        videoUrl || null,
        audioUrl || null,
        sortOrder,
        isVisible,
      ]
    );

    return NextResponse.json({
      success: true,
      entry_id: result.insertId,
      message: "Legacy Vault story added successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add Legacy Vault story." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const entryId = Number(formData.get("entry_id"));
    const title = cleanText(formData.get("title"), 255);
    const category = cleanText(formData.get("category"), 100);
    const story = cleanText(formData.get("story"), 10000);
    const sortOrder = Number(formData.get("sort_order") || 0);
    const isVisible = String(formData.get("is_visible") || "1") === "1" ? 1 : 0;

    const image = formData.get("image") as File | null;
    const video = formData.get("video") as File | null;
    const audio = formData.get("audio") as File | null;

    if (!entryId) {
      return NextResponse.json(
        { error: "Legacy Vault story ID is required." },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    const entry = await getVaultEntry(entryId);

    if (!entry) {
      return NextResponse.json(
        { error: "Legacy Vault story not found." },
        { status: 404 }
      );
    }

    const memorial = await getOwnedMemorial(
      Number(entry.memorial_id),
      Number(userId)
    );

    if (!memorial) {
      return NextResponse.json(
        { error: "You are not allowed to edit this story." },
        { status: 403 }
      );
    }

    let imageUrl = normalizeMediaUrl(entry.image_url);
    let videoUrl = normalizeMediaUrl(entry.video_url);
    let audioUrl = normalizeMediaUrl(entry.audio_url);

    const removeImage = String(formData.get("remove_image") || "0") === "1";
    const removeVideo = String(formData.get("remove_video") || "0") === "1";
    const removeAudio = String(formData.get("remove_audio") || "0") === "1";

    if (removeImage) imageUrl = null;
    if (removeVideo) videoUrl = null;
    if (removeAudio) audioUrl = null;

    const newImageUrl = await saveFile(image, "images");
    const newVideoUrl = await saveFile(video, "videos");
    const newAudioUrl = await saveFile(audio, "audio");

    if (newImageUrl) imageUrl = newImageUrl;
    if (newVideoUrl) videoUrl = newVideoUrl;
    if (newAudioUrl) audioUrl = newAudioUrl;

    await db.execute(
      `
      UPDATE legacy_vault_entries
      SET title = ?,
          category = ?,
          story = ?,
          image_url = ?,
          video_url = ?,
          audio_url = ?,
          sort_order = ?,
          is_visible = ?
      WHERE id = ?
      `,
      [
        title,
        category || null,
        story || null,
        imageUrl,
        videoUrl,
        audioUrl,
        sortOrder,
        isVisible,
        entryId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Legacy Vault story updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update Legacy Vault story." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const entryId = Number(body.entry_id);

    if (!entryId) {
      return NextResponse.json(
        { error: "Legacy Vault story ID is required." },
        { status: 400 }
      );
    }

    const entry = await getVaultEntry(entryId);

    if (!entry) {
      return NextResponse.json(
        { error: "Legacy Vault story not found." },
        { status: 404 }
      );
    }

    const memorial = await getOwnedMemorial(
      Number(entry.memorial_id),
      Number(userId)
    );

    if (!memorial) {
      return NextResponse.json(
        { error: "You are not allowed to delete this story." },
        { status: 403 }
      );
    }

    await db.execute(
      `
      DELETE FROM legacy_vault_entries
      WHERE id = ?
      `,
      [entryId]
    );

    return NextResponse.json({
      success: true,
      message: "Legacy Vault story deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete Legacy Vault story." },
      { status: 500 }
    );
  }
}