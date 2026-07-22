import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanText(value: any, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeCompare(value: any) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
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

function preparePrivateEntry(entry: any) {
  return {
    id: entry.id,
    memorial_id: entry.memorial_id,
    title: entry.title,
    category: entry.category,
    story: entry.story,
    image_url: normalizeMediaUrl(entry.image_url),
    video_url: normalizeMediaUrl(entry.video_url),
    audio_url: normalizeMediaUrl(entry.audio_url),
    recipient_name: entry.recipient_name,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
  };
}

async function getMemorialByToken(token: string) {
  const [rows]: any = await db.execute(
    `
    SELECT id, page_type
    FROM memorials
    WHERE invite_token = ?
    LIMIT 1
    `,
    [token]
  );

  if (rows.length === 0) return null;

  return rows[0];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = cleanText(body.token, 255);
    const recipientName = cleanText(body.recipient_name, 255);
    const recipientContact = cleanText(body.recipient_contact, 255);
    const accessCode = cleanText(body.access_code, 100);

    if (!token) {
      return NextResponse.json(
        { error: "Missing legacy token." },
        { status: 400 }
      );
    }

    if (!recipientName) {
      return NextResponse.json(
        { error: "Recipient name is required." },
        { status: 400 }
      );
    }

    if (!accessCode) {
      return NextResponse.json(
        { error: "Private access code is required." },
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
        recipient_name,
        recipient_contact,
        created_at,
        updated_at
      FROM legacy_vault_entries
      WHERE memorial_id = ?
        AND visibility_type = 'recipient_only'
        AND recipient_access_code = ?
      ORDER BY sort_order ASC, created_at DESC
      `,
      [memorial.id, accessCode]
    );

    const requestedName = normalizeCompare(recipientName);
    const requestedContact = normalizeCompare(recipientContact);

    const matchedEntries = rows.filter((entry: any) => {
      const savedName = normalizeCompare(entry.recipient_name);
      const savedContact = normalizeCompare(entry.recipient_contact);

      const nameMatches = !savedName || savedName === requestedName;
      const contactMatches =
        !savedContact || (requestedContact && savedContact === requestedContact);

      return nameMatches && contactMatches;
    });

    if (matchedEntries.length === 0) {
      return NextResponse.json(
        {
          error:
            "No private message was found for those details. Please check the recipient name and access code.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      entries: matchedEntries.map((entry: any) => preparePrivateEntry(entry)),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to unlock private messages." },
      { status: 500 }
    );
  }
}