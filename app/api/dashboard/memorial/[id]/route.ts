import { db } from "../../../../../lib/db";
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

async function ensureUploadFolders() {
  const uploadsRoot = getPersistentUploadsRoot();

  const musicRoot = path.join(uploadsRoot, "music");
  const galleryRoot = path.join(uploadsRoot, "gallery");
  const chatRoot = path.join(uploadsRoot, "chat");

  await mkdir(uploadsRoot, { recursive: true });
  await mkdir(musicRoot, { recursive: true });
  await mkdir(galleryRoot, { recursive: true });
  await mkdir(chatRoot, { recursive: true });

  return {
    uploadsRoot,
    musicRoot,
    galleryRoot,
    chatRoot,
  };
}

function makeSafeFileName(originalName: string, fallback: string) {
  const cleanOriginalName = originalName.split("/").pop() || fallback;

  const safeName = cleanOriginalName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${Date.now()}-${safeName || fallback}`;
}

function cleanPublicPath(pathValue: any) {
  if (!pathValue) return "";

  let cleanPath = String(pathValue).trim();
  cleanPath = cleanPath.replace(/\\/g, "/");
  cleanPath = cleanPath.replace(/^public\//, "");
  cleanPath = cleanPath.replace(/^\/public\//, "/");

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  return cleanPath;
}

async function expireBankTransferIfNeeded(memorial: any) {
  if (memorial.payment_status !== "pending_bank_transfer") {
    return memorial;
  }

  if (!memorial.payment_due_at) {
    return memorial;
  }

  const now = new Date();
  const paymentDueAt = new Date(memorial.payment_due_at);

  if (now.getTime() <= paymentDueAt.getTime()) {
    return memorial;
  }

  await db.execute(
    `
    UPDATE memorials
    SET payment_status = ?
    WHERE id = ? AND payment_status = ?
    `,
    ["expired_bank_transfer", memorial.id, "pending_bank_transfer"]
  );

  return {
    ...memorial,
    payment_status: "expired_bank_transfer",
  };
}

function canManageMemorial(memorial: any) {
  return memorial.payment_status !== "expired_bank_transfer";
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memorialId = params.id;

    const [memorialRows]: any = await db.execute(
      `
      SELECT *
      FROM memorials
      WHERE id = ? AND user_id = ?
      LIMIT 1
      `,
      [memorialId, userId]
    );

    if (memorialRows.length === 0) {
      return NextResponse.json(
        { error: "Memorial not found." },
        { status: 404 }
      );
    }

    const memorial = await expireBankTransferIfNeeded(memorialRows[0]);

    memorial.cover_photo = cleanPublicPath(memorial.cover_photo);
    memorial.memorial_music = cleanPublicPath(memorial.memorial_music);

    const [galleryRows]: any = await db.execute(
      `
      SELECT *
      FROM memorial_gallery
      WHERE memorial_id = ?
      ORDER BY id ASC
      `,
      [memorialId]
    );

    const gallery = galleryRows.map((photo: any) => ({
      ...photo,
      file_url: cleanPublicPath(photo.file_url),
    }));

    const [reactionRows]: any = await db.execute(
      `
      SELECT
        id,
        memorial_id,
        reaction_type,
        guest_name,
        message,
        flower_type,
        created_at
      FROM memorial_reactions
      WHERE memorial_id = ?
      ORDER BY created_at DESC
      LIMIT 200
      `,
      [memorialId]
    );

    return NextResponse.json({
      success: true,
      memorial,
      gallery,
      reactions: reactionRows,
    });
  } catch (error: any) {
    console.error("Dashboard memorial GET error:", error);

    return NextResponse.json(
      { error: error.message || "Unable to load memorial." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memorialId = params.id;

    const [checkRows]: any = await db.execute(
      `
      SELECT *
      FROM memorials
      WHERE id = ? AND user_id = ?
      LIMIT 1
      `,
      [memorialId, userId]
    );

    if (checkRows.length === 0) {
      return NextResponse.json(
        { error: "Memorial not found." },
        { status: 404 }
      );
    }

    const memorial = await expireBankTransferIfNeeded(checkRows[0]);

    if (!canManageMemorial(memorial)) {
      return NextResponse.json(
        {
          error:
            "This page is temporarily deactivated because payment was not verified within 48 hours.",
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const full_name = String(formData.get("full_name") || "").trim();
    const birth_date = String(formData.get("birth_date") || "");
    const death_date = String(formData.get("death_date") || "");
    const biography = String(formData.get("biography") || "");

    const coverPhoto = formData.get("cover_photo") as File | null;
    const memorialMusic = formData.get("memorial_music") as File | null;
    const galleryPhotos = formData.getAll("gallery_photos") as File[];

    if (!full_name) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    const { uploadsRoot, musicRoot, galleryRoot } = await ensureUploadFolders();

    let coverPhotoPath = cleanPublicPath(memorial.cover_photo);
    let memorialMusicPath = cleanPublicPath(memorial.memorial_music);

    if (coverPhoto && coverPhoto.size > 0) {
      const bytes = await coverPhoto.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = makeSafeFileName(coverPhoto.name, "cover-photo.jpg");

      await writeFile(path.join(uploadsRoot, fileName), buffer);

      coverPhotoPath = `/api/uploads/${fileName}`;
    }

    if (memorialMusic && memorialMusic.size > 0) {
      const bytes = await memorialMusic.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = makeSafeFileName(
        memorialMusic.name,
        "memorial-music.mp3"
      );

      await writeFile(path.join(musicRoot, fileName), buffer);

      memorialMusicPath = `/api/uploads/music/${fileName}`;
    }

    await db.execute(
      `
      UPDATE memorials
      SET full_name = ?,
          birth_date = ?,
          death_date = ?,
          biography = ?,
          cover_photo = ?,
          memorial_music = ?
      WHERE id = ? AND user_id = ?
      `,
      [
        full_name,
        birth_date || null,
        death_date || null,
        biography || "",
        coverPhotoPath,
        memorialMusicPath,
        memorialId,
        userId,
      ]
    );

    for (const photo of galleryPhotos) {
      if (photo && photo.size > 0) {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = makeSafeFileName(photo.name, "gallery-photo.jpg");

        await writeFile(path.join(galleryRoot, fileName), buffer);

        const photoPath = `/api/uploads/gallery/${fileName}`;

        await db.execute(
          `
          INSERT INTO memorial_gallery (memorial_id, file_type, file_url)
          VALUES (?, ?, ?)
          `,
          [memorialId, "image", photoPath]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Page updated successfully.",
    });
  } catch (error: any) {
    console.error("Dashboard memorial POST error:", error);

    return NextResponse.json(
      { error: error.message || "Unable to update page." },
      { status: 500 }
    );
  }
}


export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memorialId = params.id;
    const body = await req.json();

    const action = String(body.action || "");
    const reactionId = Number(body.reaction_id);
    const message = String(body.message || "").trim().slice(0, 1000);
    const flowerType = String(body.flower_type || "rose").trim().slice(0, 50);

    if (action !== "edit_reaction") {
      return NextResponse.json(
        { error: "Invalid dashboard action." },
        { status: 400 }
      );
    }

    if (!reactionId) {
      return NextResponse.json(
        { error: "Blessing or flower ID is required." },
        { status: 400 }
      );
    }

    const [checkRows]: any = await db.execute(
      `
      SELECT *
      FROM memorials
      WHERE id = ? AND user_id = ?
      LIMIT 1
      `,
      [memorialId, userId]
    );

    if (checkRows.length === 0) {
      return NextResponse.json(
        { error: "Memorial not found." },
        { status: 404 }
      );
    }

    const memorial = await expireBankTransferIfNeeded(checkRows[0]);

    if (!canManageMemorial(memorial)) {
      return NextResponse.json(
        {
          error:
            "This page is temporarily deactivated because payment was not verified within 48 hours.",
        },
        { status: 403 }
      );
    }

    const [reactionRows]: any = await db.execute(
      `
      SELECT id, reaction_type
      FROM memorial_reactions
      WHERE id = ? AND memorial_id = ?
      LIMIT 1
      `,
      [reactionId, memorialId]
    );

    if (reactionRows.length === 0) {
      return NextResponse.json(
        { error: "Blessing or flower not found." },
        { status: 404 }
      );
    }

    await db.execute(
      `
      UPDATE memorial_reactions
      SET message = ?,
          flower_type = CASE
            WHEN reaction_type = 'flower' THEN ?
            ELSE flower_type
          END
      WHERE id = ? AND memorial_id = ?
      `,
      [message, flowerType || "rose", reactionId, memorialId]
    );

    return NextResponse.json({
      success: true,
      message: "Blessing or flower updated successfully.",
    });
  } catch (error: any) {
    console.error("Dashboard memorial PATCH error:", error);

    return NextResponse.json(
      { error: error.message || "Unable to update blessing or flower." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memorialId = params.id;
    const body = await req.json();
    const gallery_id = body.gallery_id;
    const reaction_id = body.reaction_id;

    if (!gallery_id && !reaction_id) {
      return NextResponse.json(
        { error: "Gallery photo ID or blessing/flower ID is required." },
        { status: 400 }
      );
    }

    const [checkRows]: any = await db.execute(
      `
      SELECT *
      FROM memorials
      WHERE id = ? AND user_id = ?
      LIMIT 1
      `,
      [memorialId, userId]
    );

    if (checkRows.length === 0) {
      return NextResponse.json(
        { error: "Memorial not found." },
        { status: 404 }
      );
    }

    const memorial = await expireBankTransferIfNeeded(checkRows[0]);

    if (!canManageMemorial(memorial)) {
      return NextResponse.json(
        {
          error:
            "This page is temporarily deactivated because payment was not verified within 48 hours.",
        },
        { status: 403 }
      );
    }

    if (reaction_id) {
      await db.execute(
        `
        DELETE FROM memorial_reactions
        WHERE id = ? AND memorial_id = ?
        `,
        [reaction_id, memorialId]
      );

      return NextResponse.json({
        success: true,
        message: "Blessing or flower deleted successfully.",
      });
    }

    await db.execute(
      `
      DELETE FROM memorial_gallery
      WHERE id = ? AND memorial_id = ?
      `,
      [gallery_id, memorialId]
    );

    return NextResponse.json({
      success: true,
      message: "Gallery photo removed.",
    });
  } catch (error: any) {
    console.error("Dashboard memorial DELETE error:", error);

    return NextResponse.json(
      { error: error.message || "Unable to remove gallery photo." },
      { status: 500 }
    );
  }
}