import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPersistentUploadsRoot() {
  const cwd = process.cwd();

  /*
    Keep uploaded files OUTSIDE public_html and OUTSIDE nodejs deploy folder.

    Hostinger examples:
    App runs from:
    /home/USER/domains/scanmylegacy.com/nodejs

    Persistent upload folder:
    /home/USER/domains/scanmylegacy.com/uploads
  */

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

function getContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".m4a") return "audio/mp4";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".webm") return "video/webm";

  return "application/octet-stream";
}

export async function GET(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const requestedParts = params.path || [];

    if (requestedParts.length === 0) {
      return NextResponse.json({ error: "File path missing." }, { status: 400 });
    }

    const uploadsRoot = getPersistentUploadsRoot();

    const safeParts = requestedParts.map((part) =>
      String(part).replace(/[^a-zA-Z0-9._-]/g, "")
    );

    const filePath = path.join(uploadsRoot, ...safeParts);
    const normalizedRoot = path.resolve(uploadsRoot);
    const normalizedFile = path.resolve(filePath);

    if (!normalizedFile.startsWith(normalizedRoot)) {
      return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
    }

    await stat(normalizedFile);

    const fileBuffer = await readFile(normalizedFile);

    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": getContentType(normalizedFile),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}