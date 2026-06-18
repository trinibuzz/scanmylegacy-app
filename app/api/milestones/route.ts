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

async function saveImage(file: File | null) {
  if (!file || file.size === 0) return "";

  const maxFileSize = 25 * 1024 * 1024;

  if (file.size > maxFileSize) {
    throw new Error("Image is too large. Please upload an image under 25MB.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsRoot = getPersistentUploadsRoot();
  const uploadDir = path.join(uploadsRoot, "milestones", "images");

  await mkdir(uploadDir, { recursive: true });

  const originalName = file.name.split("/").pop() || "milestone-image";
  const cleanName = safeFileName(originalName) || "milestone-image";
  const fileName = `${Date.now()}-${cleanName}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return `/api/uploads/milestones/images/${fileName}`;
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

async function getMilestone(milestoneId: number) {
  const [rows]: any = await db.execute(
    `
    SELECT *
    FROM legacy_milestones
    WHERE id = ?
    LIMIT 1
    `,
    [milestoneId]
  );

  if (rows.length === 0) return null;

  return rows[0];
}

function prepareMilestone(row: any) {
  return {
    ...row,
    image_url: normalizeMediaUrl(row.image_url),
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
          { error: "Missing legacy page ID." },
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
        milestone_date,
        category,
        description,
        image_url,
        sort_order,
        is_visible,
        created_at,
        updated_at
      FROM legacy_milestones
      WHERE memorial_id = ?
        ${ownerMode ? "" : "AND is_visible = 1"}
      ORDER BY 
        CASE WHEN milestone_date IS NULL THEN 1 ELSE 0 END ASC,
        milestone_date ASC,
        sort_order ASC,
        created_at ASC
      `,
      [memorialId]
    );

    return NextResponse.json({
      success: true,
      milestones: rows.map((row: any) => prepareMilestone(row)),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load milestones." },
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
    const milestoneDate = cleanText(formData.get("milestone_date"), 20);
    const category = cleanText(formData.get("category"), 100);
    const description = cleanText(formData.get("description"), 5000);
    const sortOrder = Number(formData.get("sort_order") || 0);
    const isVisible = String(formData.get("is_visible") || "1") === "1" ? 1 : 0;

    const image = formData.get("image") as File | null;

    if (!memorialId) {
      return NextResponse.json(
        { error: "Missing legacy page ID." },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Milestone title is required." },
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

    const imageUrl = await saveImage(image);

    const [result]: any = await db.execute(
      `
      INSERT INTO legacy_milestones
      (memorial_id, title, milestone_date, category, description, image_url, sort_order, is_visible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        memorialId,
        title,
        milestoneDate || null,
        category || null,
        description || null,
        imageUrl || null,
        sortOrder,
        isVisible,
      ]
    );

    return NextResponse.json({
      success: true,
      milestone_id: result.insertId,
      message: "Milestone added successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add milestone." },
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

    const milestoneId = Number(formData.get("milestone_id"));
    const title = cleanText(formData.get("title"), 255);
    const milestoneDate = cleanText(formData.get("milestone_date"), 20);
    const category = cleanText(formData.get("category"), 100);
    const description = cleanText(formData.get("description"), 5000);
    const sortOrder = Number(formData.get("sort_order") || 0);
    const isVisible = String(formData.get("is_visible") || "1") === "1" ? 1 : 0;
    const removeImage = String(formData.get("remove_image") || "0") === "1";

    const image = formData.get("image") as File | null;

    if (!milestoneId) {
      return NextResponse.json(
        { error: "Milestone ID is required." },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Milestone title is required." },
        { status: 400 }
      );
    }

    const milestone = await getMilestone(milestoneId);

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found." },
        { status: 404 }
      );
    }

    const memorial = await getOwnedMemorial(
      Number(milestone.memorial_id),
      Number(userId)
    );

    if (!memorial) {
      return NextResponse.json(
        { error: "You are not allowed to edit this milestone." },
        { status: 403 }
      );
    }

    let imageUrl = normalizeMediaUrl(milestone.image_url);

    if (removeImage) imageUrl = null;

    const newImageUrl = await saveImage(image);

    if (newImageUrl) imageUrl = newImageUrl;

    await db.execute(
      `
      UPDATE legacy_milestones
      SET title = ?,
          milestone_date = ?,
          category = ?,
          description = ?,
          image_url = ?,
          sort_order = ?,
          is_visible = ?
      WHERE id = ?
      `,
      [
        title,
        milestoneDate || null,
        category || null,
        description || null,
        imageUrl,
        sortOrder,
        isVisible,
        milestoneId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Milestone updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update milestone." },
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
    const milestoneId = Number(body.milestone_id);

    if (!milestoneId) {
      return NextResponse.json(
        { error: "Milestone ID is required." },
        { status: 400 }
      );
    }

    const milestone = await getMilestone(milestoneId);

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found." },
        { status: 404 }
      );
    }

    const memorial = await getOwnedMemorial(
      Number(milestone.memorial_id),
      Number(userId)
    );

    if (!memorial) {
      return NextResponse.json(
        { error: "You are not allowed to delete this milestone." },
        { status: 403 }
      );
    }

    await db.execute(
      `
      DELETE FROM legacy_milestones
      WHERE id = ?
      `,
      [milestoneId]
    );

    return NextResponse.json({
      success: true,
      message: "Milestone deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete milestone." },
      { status: 500 }
    );
  }
}