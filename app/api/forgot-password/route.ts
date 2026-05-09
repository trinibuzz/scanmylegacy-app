import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://scanmylegacy.com"
  );
}

function getTransporter() {
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure = String(process.env.SMTP_SECURE || "true") === "true";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatMysqlDate(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const cleanedEmail = String(email || "").trim().toLowerCase();

    if (!cleanedEmail) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const [rows]: any = await db.execute(
      "SELECT id, name, email FROM users WHERE email = ? LIMIT 1",
      [cleanedEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "If this email is linked to a ScanMyLegacy account, a password reset link has been sent.",
      });
    }

    const user = rows[0];

    await db.execute(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
      [user.id]
    );

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.execute(
      `INSERT INTO password_reset_tokens
       (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [user.id, token, formatMysqlDate(expiresAt)]
    );

    const resetLink = `${getSiteUrl()}/reset-password/${token}`;

    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"ScanMyLegacy" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Reset your ScanMyLegacy password",
      text: `Hello ${
        user.name || "there"
      },

We received a request to reset your ScanMyLegacy password.

Click this link to reset your password:
${resetLink}

This link expires in 1 hour.

If you did not request this, you can ignore this email.

ScanMyLegacy`,
      html: `
        <div style="font-family: Arial, sans-serif; background:#061b3a; padding:30px; color:#ffffff;">
          <div style="max-width:560px; margin:0 auto; background:#111a2e; border:1px solid rgba(212,175,55,0.35); border-radius:18px; padding:28px;">
            <h1 style="color:#d4af37; margin-top:0;">Reset your password</h1>
            <p>Hello ${user.name || "there"},</p>
            <p>We received a request to reset your ScanMyLegacy password.</p>
            <p style="margin:30px 0;">
              <a href="${resetLink}" style="background:#d4af37; color:#061b3a; padding:14px 22px; border-radius:999px; text-decoration:none; font-weight:bold;">
                Reset Password
              </a>
            </p>
            <p>This link expires in 1 hour.</p>
            <p>If you did not request this, you can ignore this email.</p>
            <p style="color:#d4af37;">ScanMyLegacy</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message:
        "If this email is linked to a ScanMyLegacy account, a password reset link has been sent.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to send reset email." },
      { status: 500 }
    );
  }
}