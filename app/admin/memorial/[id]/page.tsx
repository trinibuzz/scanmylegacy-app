import { db } from "../../../../lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MemorialAdmin({
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

  const [guestbookRows]: any = await db.execute(
    "SELECT * FROM guestbook_entries WHERE memorial_id = ? ORDER BY created_at DESC",
    [memorial.id]
  );

  return (
    <main className="min-h-screen bg-[#0b1320] p-8 text-white">
      <h1 className="mb-6 font-serif text-4xl">
        Manage Memorial
      </h1>

      <div className="mb-8 rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
        <h2 className="mb-3 text-2xl font-semibold">
          {memorial.full_name}
        </h2>

        <p className="mb-2 text-gray-300">
          {memorial.birth_date
            ? new Date(memorial.birth_date).toLocaleDateString()
            : ""}
          {" — "}
          {memorial.death_date
            ? new Date(memorial.death_date).toLocaleDateString()
            : ""}
        </p>

        <p className="text-gray-400">
          {memorial.biography}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`/edit-memorial/${memorial.id}`}
            className="rounded bg-[#d4af37] px-4 py-2 text-black"
          >
            Edit Memorial
          </a>

          <a
            href={`/gallery/${memorial.id}`}
            className="rounded bg-blue-600 px-4 py-2"
          >
            Manage Gallery
          </a>

          <a
            href={`/qr/${memorial.id}`}
            className="rounded bg-green-600 px-4 py-2"
          >
            QR Code
          </a>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-3xl">
          Guestbook Posts
        </h2>

        {guestbookRows.length === 0 ? (
          <p className="text-gray-400">
            No guestbook entries yet.
          </p>
        ) : (
          <div className="space-y-4">
            {guestbookRows.map((post: any) => (
              <div
                key={post.id}
                className="rounded-xl border border-[#1f2a44] bg-[#111a2e] p-4"
              >
                <h3 className="font-semibold">
                  {post.guest_name}
                </h3>

                <p className="mt-2 text-gray-300">
                  {post.message}
                </p>

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Guestbook upload"
                    className="mt-4 max-h-[300px] rounded-lg object-cover"
                  />
                )}

                {post.video_url && (
                  <video
                    controls
                    className="mt-4 w-full rounded-lg"
                  >
                    <source src={post.video_url} />
                  </video>
                )}

                {post.audio_url && (
                  <audio
                    controls
                    className="mt-4 w-full"
                  >
                    <source src={post.audio_url} />
                  </audio>
                )}

                <div className="mt-4">
                  <a
                    href={`/delete-guestbook/${post.id}`}
                    className="rounded bg-red-600 px-4 py-2"
                  >
                    Delete
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}