import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const memorialId = url.searchParams.get("memorial_id");

    if (!memorialId) {
      return NextResponse.json(
        { error: "Missing memorial_id" },
        { status: 400 }
      );
    }

    const [members]: any = await db.execute(
      `SELECT *
       FROM family_members
       WHERE memorial_id = ?
       ORDER BY generation ASC, created_at ASC`,
      [memorialId]
    );

    return NextResponse.json({ members });
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

    const memorial_id = formData.get("memorial_id");
    const name = formData.get("name");
    const relationship = formData.get("relationship");
    const parent_id = formData.get("parent_id");
    const spouse_id = formData.get("spouse_id");
    const generation = formData.get("generation");
    const birth_date = formData.get("birth_date");
    const death_date = formData.get("death_date");

    if (!memorial_id) {
      return NextResponse.json(
        { error: "Missing memorial_id" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Missing name" },
        { status: 400 }
      );
    }

    if (!relationship) {
      return NextResponse.json(
        { error: "Missing relationship" },
        { status: 400 }
      );
    }

    await db.execute(
      `INSERT INTO family_members (
        memorial_id,
        name,
        relationship,
        parent_id,
        spouse_id,
        generation,
        birth_date,
        death_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        memorial_id,
        name,
        relationship,
        parent_id || null,
        spouse_id || null,
        generation || 0,
        birth_date || null,
        death_date || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Family member added",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const memorialId = url.searchParams.get("memorial_id");

    if (!id || !memorialId) {
      return NextResponse.json(
        { error: "Missing delete info" },
        { status: 400 }
      );
    }

    await db.execute(
      `DELETE FROM family_members
       WHERE id = ? AND memorial_id = ?`,
      [id, memorialId]
    );

    return NextResponse.json({
      success: true,
      message: "Family member deleted",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}