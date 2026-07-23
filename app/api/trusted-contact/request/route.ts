import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanText(value: any, maxLength = 255) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeName(value: any) {
  return String(value || "").trim().toLowerCase();
}

function normalizeEmail(value: any) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value: any) {
  return String(value || "").replace(/\D/g, "");
}

function cleanRequestType(value: any) {
  const requestType = String(value || "").trim();

  const allowedTypes = [
    "convert_to_memorial",
    "release_after_passing",
    "ownership_transfer",
    "general_release_request",
  ];

  if (allowedTypes.includes(requestType)) {
    return requestType;
  }

  return "general_release_request";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = cleanText(body.token, 500);
    const requestType = cleanRequestType(body.request_type);

    const trustedContactName = cleanText(body.trusted_contact_name, 255);
    const trustedContactEmail = cleanText(body.trusted_contact_email, 255);
    const trustedContactPhone = cleanText(body.trusted_contact_phone, 100);
    const accessCode = cleanText(body.access_code, 100);
    const requestNote = cleanText(body.request_note, 3000);

    if (!token) {
      return NextResponse.json(
        { error: "Legacy page token is required." },
        { status: 400 }
      );
    }

    if (!trustedContactName) {
      return NextResponse.json(
        { error: "Trusted contact name is required." },
        { status: 400 }
      );
    }

    if (!trustedContactEmail && !trustedContactPhone) {
      return NextResponse.json(
        { error: "Trusted contact email or phone is required." },
        { status: 400 }
      );
    }

    const [memorialRows]: any = await db.execute(
      `
      SELECT
        id,
        full_name,
        page_type,
        invite_token,
        trusted_contact_enabled,
        trusted_contact_name,
        trusted_contact_email,
        trusted_contact_phone
      FROM memorials
      WHERE invite_token = ?
      LIMIT 1
      `,
      [token]
    );

    if (memorialRows.length === 0) {
      return NextResponse.json(
        { error: "Legacy page not found." },
        { status: 404 }
      );
    }

    const memorial = memorialRows[0];

    if (Number(memorial.trusted_contact_enabled) !== 1) {
      return NextResponse.json(
        { error: "Trusted Contact access is not enabled for this page." },
        { status: 403 }
      );
    }

    const savedName = normalizeName(memorial.trusted_contact_name);
    const enteredName = normalizeName(trustedContactName);

    if (!savedName || savedName !== enteredName) {
      return NextResponse.json(
        { error: "Trusted contact details do not match this legacy page." },
        { status: 403 }
      );
    }

    const savedEmail = normalizeEmail(memorial.trusted_contact_email);
    const enteredEmail = normalizeEmail(trustedContactEmail);

    const savedPhone = normalizePhone(memorial.trusted_contact_phone);
    const enteredPhone = normalizePhone(trustedContactPhone);

    const emailMatches =
      savedEmail.length > 0 &&
      enteredEmail.length > 0 &&
      savedEmail === enteredEmail;

    const phoneMatches =
      savedPhone.length > 0 &&
      enteredPhone.length > 0 &&
      savedPhone === enteredPhone;

    if (!emailMatches && !phoneMatches) {
      return NextResponse.json(
        { error: "Trusted contact email or phone does not match." },
        { status: 403 }
      );
    }

    const [duplicateRows]: any = await db.execute(
      `
      SELECT id
      FROM trusted_contact_release_requests
      WHERE memorial_id = ?
        AND request_type = ?
        AND status = 'pending'
      LIMIT 1
      `,
      [memorial.id, requestType]
    );

    if (duplicateRows.length > 0) {
      return NextResponse.json(
        {
          error:
            "A pending request of this type already exists. Please wait for admin review.",
        },
        { status: 400 }
      );
    }

    await db.execute(
      `
      INSERT INTO trusted_contact_release_requests (
        memorial_id,
        request_type,
        trusted_contact_name,
        trusted_contact_email,
        trusted_contact_phone,
        access_code,
        request_note,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        memorial.id,
        requestType,
        trustedContactName,
        trustedContactEmail || null,
        trustedContactPhone || null,
        accessCode || null,
        requestNote || null,
        "pending",
      ]
    );

    return NextResponse.json({
      success: true,
      message:
        "Trusted contact request submitted. ScanMyLegacy admin will review it before anything is changed.",
    });
  } catch (error: any) {
    console.error("Trusted contact request error:", error);

    return NextResponse.json(
      {
        error:
          error.message || "Unable to submit trusted contact request right now.",
      },
      { status: 500 }
    );
  }
}