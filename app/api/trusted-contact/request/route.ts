import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeValue(value: any) {
  return String(value || "").trim().toLowerCase();
}

function cleanPhone(value: any) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function isValidRequestType(value: string) {
  return [
    "convert_to_memorial",
    "release_after_passing",
    "ownership_transfer",
    "general_release_request",
  ].includes(value);
}

function requestTypeLabel(value: string) {
  const labels: any = {
    convert_to_memorial: "Convert Living Legacy to Memorial",
    release_after_passing: "Release After Passing Messages",
    ownership_transfer: "Request Ownership Transfer",
    general_release_request: "General Family Release Request",
  };

  return labels[value] || "General Family Release Request";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = String(body.token || "").trim();
    const request_type = String(body.request_type || "").trim();
    const trusted_contact_name = String(body.trusted_contact_name || "")
      .trim()
      .slice(0, 255);
    const trusted_contact_email = String(body.trusted_contact_email || "")
      .trim()
      .slice(0, 255);
    const trusted_contact_phone = String(body.trusted_contact_phone || "")
      .trim()
      .slice(0, 100);
    const request_note = String(body.request_note || "").trim().slice(0, 3000);

    if (!token) {
      return NextResponse.json(
        { error: "Legacy page token is required." },
        { status: 400 }
      );
    }

    if (!isValidRequestType(request_type)) {
      return NextResponse.json(
        { error: "Please choose a valid release request type." },
        { status: 400 }
      );
    }

    if (!trusted_contact_name) {
      return NextResponse.json(
        { error: "Trusted contact name is required." },
        { status: 400 }
      );
    }

    if (!trusted_contact_email && !trusted_contact_phone) {
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
          trusted_contact_enabled,
          trusted_contact_name,
          trusted_contact_email,
          trusted_contact_phone
        FROM memorials
        WHERE invite_token = ?
           OR public_token = ?
           OR token = ?
        LIMIT 1
      `,
      [token, token, token]
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

    const savedName = normalizeValue(memorial.trusted_contact_name);
    const enteredName = normalizeValue(trusted_contact_name);

    const savedEmail = normalizeValue(memorial.trusted_contact_email);
    const enteredEmail = normalizeValue(trusted_contact_email);

    const savedPhone = cleanPhone(memorial.trusted_contact_phone);
    const enteredPhone = cleanPhone(trusted_contact_phone);

    const nameMatches = savedName && enteredName && savedName === enteredName;
    const emailMatches = savedEmail && enteredEmail && savedEmail === enteredEmail;
    const phoneMatches =
      savedPhone && enteredPhone && savedPhone.length >= 6 && savedPhone === enteredPhone;

    if (!nameMatches || (!emailMatches && !phoneMatches)) {
      return NextResponse.json(
        {
          error:
            "Trusted Contact details do not match the information saved by the page owner.",
        },
        { status: 403 }
      );
    }

    const [existingRows]: any = await db.execute(
      `
        SELECT id
        FROM trusted_contact_release_requests
        WHERE memorial_id = ?
          AND request_type = ?
          AND status = 'pending'
        LIMIT 1
      `,
      [memorial.id, request_type]
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message:
            "A pending request of this type already exists. ScanMyLegacy admin will review it.",
        }
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
          request_note,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        memorial.id,
        request_type,
        trusted_contact_name,
        trusted_contact_email || null,
        trusted_contact_phone || null,
        request_note || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: `${requestTypeLabel(
        request_type
      )} request submitted. ScanMyLegacy admin will review it before anything is changed or released.`,
    });
  } catch (error: any) {
    console.error("Trusted contact release request error:", error);

    return NextResponse.json(
      { error: error.message || "Unable to submit trusted contact request." },
      { status: 500 }
    );
  }
}