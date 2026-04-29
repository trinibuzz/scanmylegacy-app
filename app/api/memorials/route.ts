import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    let userId: any = null;

    if (sessionCookie) {
      const [sessionRows]: any = await db.execute(
        "SELECT * FROM sessions WHERE id = ? LIMIT 1",
        [sessionCookie.value]
      );

      if (sessionRows.length > 0) {
        const [userRows]: any = await db.execute(
          "SELECT * FROM users WHERE id = ? LIMIT 1",
          [sessionRows[0].user_id]
        );

        if (userRows.length > 0) {
          userId = userRows[0].id;
        }
      }
    }

    const formData = await req.formData();

    const creator_name = formData.get("creator_name") as string;
    const creator_email = formData.get("creator_email") as string;
    const creator_phone = formData.get("creator_phone") as string;
    const creator_relationship = formData.get("creator_relationship") as string;

    const full_name = formData.get("full_name") as string;
    const birth_date = formData.get("birth_date") as string;
    const death_date = formData.get("death_date") as string;
    const biography = formData.get("biography") as string;

    const package_slug = formData.get("package_slug") as string;
    const package_name = formData.get("package_name") as string;
    const package_price = formData.get("package_price") as string;
    const referral_code = formData.get("referral_code") as string;

    const coverPhoto = formData.get("cover_photo") as File | null;

    let coverPhotoPath = "";

    if (coverPhoto && coverPhoto.size > 0) {
      const bytes = await coverPhoto.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir =
        "/home/u569694274/domains/deepskyblue-donkey-850675.hostingersite.com/public_html/uploads";

      await mkdir(uploadDir, { recursive: true });

      const safeName = coverPhoto.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "-");

      const fileName = `${Date.now()}-${safeName}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      coverPhotoPath = `/uploads/${fileName}`;
    }

    const inviteToken =
      Math.random().toString(36).substring(2) + Date.now();

    const paymentStatus =
      Number(package_price) === 0 ? "free" : "pending";

    const [result]: any = await db.execute(
      `INSERT INTO memorials 
      (
        user_id,
        creator_name,
        creator_email,
        creator_phone,
        creator_relationship,
        full_name,
        birth_date,
        death_date,
        biography,
        invite_token,
        cover_photo,
        package_slug,
        package_name,
        package_price,
        payment_status
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        creator_name || "",
        creator_email || "",
        creator_phone || "",
        creator_relationship || "",
        full_name,
        birth_date || null,
        death_date || null,
        biography || "",
        inviteToken,
        coverPhotoPath,
        package_slug,
        package_name,
        package_price,
        paymentStatus,
      ]
    );

    const memorialId = result.insertId;

    if (referral_code) {
      const [affiliateRows]: any = await db.execute(
        "SELECT * FROM affiliates WHERE referral_code = ? AND status = 'active' LIMIT 1",
        [referral_code]
      );

      if (affiliateRows.length > 0) {
        const affiliate = affiliateRows[0];

        const commissionRate = Number(affiliate.commission_rate || 10);
        const packagePriceNumber = Number(package_price || 0);
        const commissionAmount = (packagePriceNumber * commissionRate) / 100;

        await db.execute(
          `INSERT INTO affiliate_referrals
           (affiliate_id, memorial_id, customer_name, package_name, package_price, commission_amount, payment_status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            affiliate.id,
            memorialId,
            creator_name || full_name,
            package_name,
            packagePriceNumber,
            commissionAmount,
            paymentStatus === "free" ? "free" : "pending",
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      memorial: {
        id: memorialId,
        full_name,
        creator_name,
        creator_email,
        invite_token: inviteToken,
        link: `/memorial/${inviteToken}`,
        package_slug,
        package_name,
        package_price,
        payment_status: paymentStatus,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}