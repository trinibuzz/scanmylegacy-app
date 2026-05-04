import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

function getPublicHtmlRoot() {
  const cwd = process.cwd();

  /*
    Hostinger production path usually looks like:
    /home/USER/domains/scanmylegacy.com/public_html/.builds/source/repository

    Public files must be written to:
    /home/USER/domains/scanmylegacy.com/public_html/uploads
  */
  if (cwd.includes("public_html")) {
    const beforePublicHtml = cwd.split("public_html")[0];
    return path.join(beforePublicHtml, "public_html");
  }

  /*
    Local development fallback:
    C:\Users\Keith Guevara\scanmylegacy-app\public
  */
  return path.join(cwd, "public");
}

async function ensureUploadFolders() {
  const publicRoot = getPublicHtmlRoot();

  const uploadsRoot = path.join(publicRoot, "uploads");
  const musicRoot = path.join(uploadsRoot, "music");
  const galleryRoot = path.join(uploadsRoot, "gallery");

  await mkdir(uploadsRoot, { recursive: true });
  await mkdir(musicRoot, { recursive: true });
  await mkdir(galleryRoot, { recursive: true });

  return {
    uploadsRoot,
    musicRoot,
    galleryRoot,
  };
}

function makeSafeFileName(originalName: string, fallback: string) {
  const cleanOriginalName = originalName.split("/").pop() || fallback;

  const safeName = cleanOriginalName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");

  return `${Date.now()}-${safeName}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const creator_name = formData.get("creator_name") as string;
    const creator_email = formData.get("creator_email") as string;
    const creator_phone = formData.get("creator_phone") as string;
    const creator_relationship = formData.get("creator_relationship") as string;
    const password = formData.get("password") as string;

    const full_name = formData.get("full_name") as string;
    const birth_date = formData.get("birth_date") as string;
    const death_date = formData.get("death_date") as string;
    const biography = formData.get("biography") as string;

    const package_slug = formData.get("package_slug") as string;
    const package_name = formData.get("package_name") as string;
    const package_price = formData.get("package_price") as string;

    const enable_family_tree =
      formData.get("enable_family_tree") === "1" ? 1 : 0;

    const enable_reminders =
      formData.get("enable_reminders") === "1" ? 1 : 0;

    const coverPhoto = formData.get("cover_photo") as File | null;
    const memorialMusic = formData.get("memorial_music") as File | null;
    const galleryPhotos = formData.getAll("gallery_photos") as File[];

    const cleanedEmail = creator_email?.trim().toLowerCase();

    const isFreeTrialRequest =
      Number(package_price) === 0 || package_slug === "starter-tribute";

    if (!creator_name || !cleanedEmail || !full_name) {
      return NextResponse.json(
        {
          error:
            "Creator name, creator email, and memorial full name are required.",
        },
        { status: 400 }
      );
    }

    let userId: any = null;
    let existingUser: any = null;

    /*
      IMPORTANT:
      Use the form email as the source of truth.
      Do not automatically attach a new memorial to the currently logged-in user
      if the form email belongs to someone else.
    */
    const [existingUsers]: any = await db.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [cleanedEmail]
    );

    if (existingUsers.length > 0) {
      existingUser = existingUsers[0];
      userId = existingUser.id;
    }

    /*
      Only use the current session if the logged-in user's email matches
      the creator email on the form.
    */
    if (!userId) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("session");

      if (sessionCookie) {
        const [sessionRows]: any = await db.execute(
          "SELECT * FROM sessions WHERE id = ? LIMIT 1",
          [sessionCookie.value]
        );

        if (sessionRows.length > 0) {
          const [sessionUserRows]: any = await db.execute(
            "SELECT * FROM users WHERE id = ? LIMIT 1",
            [sessionRows[0].user_id]
          );

          if (
            sessionUserRows.length > 0 &&
            String(sessionUserRows[0].email).toLowerCase() === cleanedEmail
          ) {
            existingUser = sessionUserRows[0];
            userId = existingUser.id;
          }
        }
      }
    }

    /*
      Free trial protection:
      - If this email/user already exists, do not allow another Starter Tribute.
      - Paid packages are still allowed.
    */
    if (isFreeTrialRequest && existingUser) {
      return NextResponse.json(
        {
          error:
            "This free trial has already been used. Please choose a paid package to continue preserving this memorial.",
        },
        { status: 403 }
      );
    }

    if (!userId) {
      if (!password || password.length < 6) {
        return NextResponse.json(
          { error: "Please create a password with at least 6 characters." },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      const userPlan = isFreeTrialRequest ? "free" : package_slug || "free";

      const [newUser]: any = await db.execute(
        `INSERT INTO users 
        (name, email, password, plan, trial_ends_at, is_active) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          creator_name || full_name || "Memorial Owner",
          cleanedEmail,
          hashedPassword,
          userPlan,
          isFreeTrialRequest ? trialEndsAt : null,
          1,
        ]
      );

      userId = newUser.insertId;
    }

    const { uploadsRoot, musicRoot, galleryRoot } = await ensureUploadFolders();

    let coverPhotoPath = "";
    let memorialMusicPath = "";

    if (coverPhoto && coverPhoto.size > 0) {
      const bytes = await coverPhoto.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = makeSafeFileName(coverPhoto.name, "cover-photo.jpg");

      await writeFile(path.join(uploadsRoot, fileName), buffer);

      coverPhotoPath = `/uploads/${fileName}`;
    }

    if (memorialMusic && memorialMusic.size > 0) {
      const bytes = await memorialMusic.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = makeSafeFileName(
        memorialMusic.name,
        "memorial-music.mp3"
      );

      await writeFile(path.join(musicRoot, fileName), buffer);

      memorialMusicPath = `/uploads/music/${fileName}`;
    }

    const inviteToken = Math.random().toString(36).substring(2) + Date.now();

    const paymentStatus = Number(package_price) === 0 ? "free" : "pending";

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
        memorial_music,
        package_slug,
        package_name,
        package_price,
        payment_status,
        enable_family_tree,
        enable_reminders
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        creator_name || "",
        cleanedEmail || "",
        creator_phone || "",
        creator_relationship || "",
        full_name,
        birth_date || null,
        death_date || null,
        biography || "",
        inviteToken,
        coverPhotoPath,
        memorialMusicPath,
        package_slug,
        package_name,
        package_price,
        paymentStatus,
        enable_family_tree,
        enable_reminders,
      ]
    );

    const memorialId = result.insertId;

    for (const photo of galleryPhotos) {
      if (photo && photo.size > 0) {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = makeSafeFileName(photo.name, "gallery-photo.jpg");

        await writeFile(path.join(galleryRoot, fileName), buffer);

        const photoPath = `/uploads/gallery/${fileName}`;

        await db.execute(
          `INSERT INTO memorial_gallery (memorial_id, file_url)
           VALUES (?, ?)`,
          [memorialId, photoPath]
        );
      }
    }

    return NextResponse.json({
      success: true,
      memorial: {
        id: memorialId,
        user_id: userId,
        full_name,
        creator_name,
        creator_email: cleanedEmail,
        invite_token: inviteToken,
        link: `/memorial/${inviteToken}`,
        package_slug,
        package_name,
        package_price,
        payment_status: paymentStatus,
        enable_family_tree,
        enable_reminders,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}