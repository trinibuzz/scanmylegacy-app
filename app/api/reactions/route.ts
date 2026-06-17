import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  return adminSession?.value === "active";
}

function normalizeReactionType(value: any) {
  const reactionType = String(value || "").trim().toLowerCase();

  if (reactionType !== "candle" && reactionType !== "flower") {
    return "";
  }

  return reactionType;
}

function cleanText(value: any, maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

async function getMemorialByToken(token: string) {
  const [memorialRows]: any = await db.execute(
    "SELECT id FROM memorials WHERE invite_token = ? LIMIT 1",
    [token]
  );

  if (memorialRows.length === 0) {
    return null;
  }

  return memorialRows[0];
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const memorial = await getMemorialByToken(token);

    if (!memorial) {
      return NextResponse.json({ error: "Invalid memorial" }, { status: 404 });
    }

    const [counts]: any = await db.execute(
      `SELECT reaction_type, COUNT(*) AS total
       FROM memorial_reactions
       WHERE memorial_id = ?
       GROUP BY reaction_type`,
      [memorial.id]
    );

    let candles = 0;
    let flowers = 0;

    counts.forEach((row: any) => {
      if (row.reaction_type === "candle") candles = Number(row.total);
      if (row.reaction_type === "flower") flowers = Number(row.total);
    });

    const [reactions]: any = await db.execute(
      `SELECT 
          id,
          memorial_id,
          reaction_type,
          guest_name,
          message,
          flower_type,
          created_at,
          updated_at,
          TIMESTAMPDIFF(SECOND, created_at, NOW()) AS seconds_old
       FROM memorial_reactions
       WHERE memorial_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [memorial.id]
    );

    const preparedReactions = reactions.map((reaction: any) => {
      const secondsOld = Number(reaction.seconds_old || 0);
      const guestEditSecondsLeft = Math.max(0, 120 - secondsOld);

      return {
        ...reaction,
        guest_edit_seconds_left: guestEditSecondsLeft,
        guest_can_edit: guestEditSecondsLeft > 0,
      };
    });

    return NextResponse.json({
      candles,
      flowers,
      reactions: preparedReactions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load reactions." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = cleanText(body.token, 255);
    const reactionType = normalizeReactionType(body.reaction_type);
    const guestName = cleanText(body.guest_name || "Someone", 120) || "Someone";
    const message = cleanText(body.message, 1000);
    const flowerType = cleanText(body.flower_type, 50);

    if (!token || !reactionType) {
      return NextResponse.json(
        { error: "Missing reaction info" },
        { status: 400 }
      );
    }

    const memorial = await getMemorialByToken(token);

    if (!memorial) {
      return NextResponse.json({ error: "Invalid memorial" }, { status: 404 });
    }

    const [result]: any = await db.execute(
      `INSERT INTO memorial_reactions 
       (memorial_id, reaction_type, guest_name, message, flower_type)
       VALUES (?, ?, ?, ?, ?)`,
      [
        memorial.id,
        reactionType,
        guestName,
        message,
        reactionType === "flower" ? flowerType || "rose" : null,
      ]
    );

    return NextResponse.json({
      success: true,
      reaction_id: result.insertId,
      guest_edit_seconds_left: 120,
      message:
        reactionType === "flower"
          ? "Flower posted. You can edit it for 2 minutes."
          : "Blessing posted. You can edit it for 2 minutes.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save reaction." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const token = cleanText(body.token, 255);
    const reactionId = Number(body.reaction_id);
    const guestName = cleanText(body.guest_name, 120);
    const message = cleanText(body.message, 1000);
    const flowerType = cleanText(body.flower_type, 50);

    if (!token || !reactionId || !guestName) {
      return NextResponse.json(
        { error: "Token, reaction ID, and guest name are required." },
        { status: 400 }
      );
    }

    const memorial = await getMemorialByToken(token);

    if (!memorial) {
      return NextResponse.json({ error: "Invalid memorial" }, { status: 404 });
    }

    const [rows]: any = await db.execute(
      `SELECT 
          id,
          memorial_id,
          reaction_type,
          guest_name,
          created_at,
          TIMESTAMPDIFF(SECOND, created_at, NOW()) AS seconds_old
       FROM memorial_reactions
       WHERE id = ?
         AND memorial_id = ?
       LIMIT 1`,
      [reactionId, memorial.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Blessing or flower not found." },
        { status: 404 }
      );
    }

    const reaction = rows[0];
    const secondsOld = Number(reaction.seconds_old || 0);

    if (secondsOld > 120) {
      return NextResponse.json(
        {
          error:
            "The 2-minute edit window has expired. Please contact the page owner to make changes.",
        },
        { status: 403 }
      );
    }

    const originalGuestName = String(reaction.guest_name || "")
      .trim()
      .toLowerCase();

    const submittedGuestName = guestName.trim().toLowerCase();

    if (originalGuestName !== submittedGuestName) {
      return NextResponse.json(
        {
          error:
            "Only the person who posted this blessing or flower can edit it during the 2-minute window.",
        },
        { status: 403 }
      );
    }

    await db.execute(
      `UPDATE memorial_reactions
       SET message = ?,
           flower_type = CASE 
             WHEN reaction_type = 'flower' THEN ?
             ELSE flower_type
           END
       WHERE id = ?
         AND memorial_id = ?`,
      [message, flowerType || "rose", reactionId, memorial.id]
    );

    return NextResponse.json({
      success: true,
      message: "Your post was updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update reaction." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authorized = await isAdminAuthorized();

    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized admin access." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const reactionId = Number(body.reaction_id);

    if (!reactionId) {
      return NextResponse.json(
        { error: "Reaction ID is required." },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      "SELECT id FROM memorial_reactions WHERE id = ? LIMIT 1",
      [reactionId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Blessing or flower not found." },
        { status: 404 }
      );
    }

    await db.execute("DELETE FROM memorial_reactions WHERE id = ?", [
      reactionId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Blessing or flower deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete reaction." },
      { status: 500 }
    );
  }
}