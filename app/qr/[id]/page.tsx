import { db } from "../../../lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";

export default async function QRPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const [sessionRows]: any = await db.execute(
    "SELECT * FROM sessions WHERE id = ? LIMIT 1",
    [sessionCookie.value]
  );

  if (sessionRows.length === 0) {
    redirect("/login");
  }

  const session = sessionRows[0];

  const [memorialRows]: any = await db.execute(
    "SELECT * FROM memorials WHERE id = ? AND user_id = ? LIMIT 1",
    [params.id, session.user_id]
  );

  if (memorialRows.length === 0) {
    redirect("/dashboard");
  }

  const memorial = memorialRows[0];

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://deepskyblue-donkey-850675.hostingersite.com";

  const memorialLink = `${siteUrl}/memorial/${memorial.invite_token}`;

  const qrImage = await QRCode.toDataURL(memorialLink, {
    width: 500,
    margin: 2,
  });

  return (
    <main className="min-h-screen bg-[#0b1320] p-8 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center">
        <h1 className="mb-3 font-serif text-4xl text-[#d4af37]">
          Memorial QR Code
        </h1>

        <p className="mb-2 text-xl font-semibold">
          {memorial.full_name}
        </p>

        <p className="mb-6 break-all text-sm text-gray-400">
          {memorialLink}
        </p>

        <div className="mx-auto mb-6 w-fit rounded-2xl bg-white p-4">
          <img
            src={qrImage}
            alt="Memorial QR Code"
            className="h-[320px] w-[320px]"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={qrImage}
            download={`${memorial.full_name}-qr-code.png`}
            className="rounded bg-[#d4af37] px-6 py-3 font-semibold text-black"
          >
            Download QR
          </a>

          <a
            href={memorialLink}
            target="_blank"
            className="rounded border border-[#d4af37] px-6 py-3 text-[#d4af37]"
          >
            Open Memorial
          </a>

          <a
            href={`/admin/memorial/${memorial.id}`}
            className="rounded bg-blue-600 px-6 py-3 text-white"
          >
            Back to Admin
          </a>
        </div>
      </div>
    </main>
  );
}