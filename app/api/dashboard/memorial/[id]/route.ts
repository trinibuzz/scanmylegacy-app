import { db } from "../../../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

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
    `UPDATE memorials
     SET payment_status = ?
     WHERE id = ? AND payment_status = ?`,
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
      "SELECT * FROM memorials WHERE id = ? AND user_id = ? LIMIT 1",
      [memorialId, userId]
    );

    if (memorialRows.length === 0) {
      return NextResponse.json(
        { error: "Memorial not found." },
        { status: 404 }
      );
    }

    const memorial = await expireBankTransferIfNeeded(memorialRows[0]);

    const [galleryRows]: any = await db.execute(
      "SELECT * FROM memorial_gallery WHERE memorial_id = ? ORDER BY id ASC",
      [memorialId]
    );

    return NextResponse.json({ memorial, gallery: galleryRows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memorialId = params.id;

    const [checkRows]: any = await db.execute(
      "SELECT * FROM memorials WHERE id = ? AND user_id = ? LIMIT 1",
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
            "This memorial is temporarily deactivated because payment was not verified within 48 hours.",
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const full_name = formData.get("full_name") as string;
    const birth_date = formData.get("birth_date") as string;
    const death_date = formData.get("death_date") as string;
    const biography = formData.get("biography") as string;

    const coverPhoto = formData.get("cover_photo") as File | null;
    const memorialMusic = formData.get("memorial_music") as File | null;
    const galleryPhotos = formData.getAll("gallery_photos") as File[];

    if (!full_name) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    const uploadsRoot = path.join(process.cwd(), "public", "uploads");
    const musicRoot = path.join(uploadsRoot, "music");
    const galleryRoot = path.join(uploadsRoot, "gallery");

    await mkdir(uploadsRoot, { recursive: true });
    await mkdir(musicRoot, { recursive: true });
    await mkdir(galleryRoot, { recursive: true });

    let coverPhotoPath = memorial.cover_photo || "";
    let memorialMusicPath = memorial.memorial_music || "";

    if (coverPhoto && coverPhoto.size > 0) {
      const bytes = await coverPhoto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const originalName = coverPhoto.name.split("/").pop() || "cover-photo";
      const safeName = originalName.toLowerCase().replace(/[^a-z0-9.]/g, "-");
      const fileName = `${Date.now()}-${safeName}`;

      await writeFile(path.join(uploadsRoot, fileName), buffer);
      coverPhotoPath = `/uploads/${fileName}`;
    }

    if (memorialMusic && memorialMusic.size > 0) {
      const bytes = await memorialMusic.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const originalName =
        memorialMusic.name.split("/").pop() || "memorial-music";
      const safeName = originalName.toLowerCase().replace(/[^a-z0-9.]/g, "-");
      const fileName = `${Date.now()}-${safeName}`;

      await writeFile(path.join(musicRoot, fileName), buffer);
      memorialMusicPath = `/uploads/music/${fileName}`;
    }

    await db.execute(
      `UPDATE memorials
       SET full_name = ?,
           birth_date = ?,
           death_date = ?,
           biography = ?,
           cover_photo = ?,
           memorial_music = ?
       WHERE id = ? AND user_id = ?`,
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
        const originalName = photo.name.split("/").pop() || "gallery-photo";
        const safeName = originalName.toLowerCase().replace(/[^a-z0-9.]/g, "-");
        const fileName = `${Date.now()}-${safeName}`;

        await writeFile(path.join(galleryRoot, fileName), buffer);

        const photoPath = `/uploads/gallery/${fileName}`;

        await db.execute(
          `INSERT INTO memorial_gallery (memorial_id, file_type, file_url)
           VALUES (?, ?, ?)`,
          [memorialId, "image", photoPath]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    const { gallery_id } = await req.json();

    if (!gallery_id) {
      return NextResponse.json(
        { error: "Gallery photo ID is required." },
        { status: 400 }
      );
    }

    const [checkRows]: any = await db.execute(
      "SELECT * FROM memorials WHERE id = ? AND user_id = ? LIMIT 1",
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
            "This memorial is temporarily deactivated because payment was not verified within 48 hours.",
        },
        { status: 403 }
      );
    }

    await db.execute(
      "DELETE FROM memorial_gallery WHERE id = ? AND memorial_id = ?",
      [gallery_id, memorialId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}