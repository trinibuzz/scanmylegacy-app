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

    if (!userId) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const url = new URL(req.url);
    const memorialId = url.searchParams.get("memorial_id") || "";

    const owns = await verifyOwner(memorialId, userId);

    if (!owns) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const [members]: any = await db.execute(
      "SELECT * FROM family_members WHERE memorial_id = ? ORDER BY generation ASC, created_at ASC",
      [memorialId]
    );

    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const formData = await req.formData();

    const memorialId = formData.get("memorial_id") as string;
    const name = formData.get("name") as string;
    const relationship = formData.get("relationship") as string;
    const parentId = formData.get("parent_id") as string;
    const spouseId = formData.get("spouse_id") as string;
    const generation = formData.get("generation") as string;
    const birthDate = formData.get("birth_date") as string;
    const deathDate = formData.get("death_date") as string;
    const photo = formData.get("photo") as File | null;

    const owns = await verifyOwner(memorialId, userId);

    if (!owns) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let photoUrl = "";

    if (photo && photo.size > 0) {
      const uploadDir =
        "/home/u569694274/domains/deepskyblue-donkey-850675.hostingersite.com/public_html/uploads";

      await mkdir(uploadDir, { recursive: true });

      const safeName = photo.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "-");

      const fileName = `${Date.now()}-family-${safeName}`;
      const filePath = path.join(uploadDir, fileName);

      const bytes = await photo.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      photoUrl = `/uploads/${fileName}`;
    }

    await db.execute(
      `INSERT INTO family_members 
      (memorial_id, name, relationship, parent_id, spouse_id, generation, photo_url, birth_date, death_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        memorialId,
        name,
        relationship || null,
        parentId || null,
        spouseId || null,
        generation || 0,
        photoUrl || null,
        birthDate || null,
        deathDate || null,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id") || "";
    const memorialId = url.searchParams.get("memorial_id") || "";

    const owns = await verifyOwner(memorialId, userId);

    if (!owns) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    await db.execute(
      "DELETE FROM family_members WHERE id = ? AND memorial_id = ?",
      [id, memorialId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}