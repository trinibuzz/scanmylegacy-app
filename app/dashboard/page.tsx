import { db } from "../../lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
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

  const [userRows]: any = await db.execute(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [session.user_id]
  );

  if (userRows.length === 0) {
    redirect("/login");
  }

  const user = userRows[0];

  const [memorials]: any = await db.execute(
    "SELECT * FROM memorials WHERE user_id = ? ORDER BY created_at DESC",
    [user.id]
  );

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://deepskyblue-donkey-850675.hostingersite.com";

  return (
    <main className="min-h-screen bg-[#0b1320] p-8 text-white">
      <h1 className="mb-6 font-serif text-3xl">Welcome, {user.name}</h1>

      <h2 className="mb-4 text-xl text-gray-300">Your Memorials</h2>

      {memorials.length === 0 ? (
        <p className="text-gray-400">No memorials yet.</p>
      ) : (
        <div className="grid gap-4">
          {memorials.map((m: any) => {
            const link = `${siteUrl}/memorial/${m.invite_token}`;

            return (
              <div
                key={m.id}
                className="rounded-lg border border-[#1f2a44] bg-[#111a2e] p-4"
              >
                <h3 className="text-lg font-semibold">{m.full_name}</h3>

                <p className="text-sm text-gray-400">
                  {m.birth_date
                    ? new Date(m.birth_date).toLocaleDateString()
                    : ""}
                  {" — "}
                  {m.death_date
                    ? new Date(m.death_date).toLocaleDateString()
                    : ""}
                </p>

                <p className="mt-2 text-gray-300">{m.biography}</p>

                {m.invite_token && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`/memorial/${m.invite_token}`}
                      className="rounded bg-[#d4af37] px-4 py-2 text-black"
                    >
                      View
                    </a>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `View this memorial: ${link}`
                      )}`}
                      target="_blank"
                      className="rounded bg-green-600 px-4 py-2 text-white"
                    >
                      WhatsApp
                    </a>

                    <span className="rounded border border-gray-500 px-4 py-2 text-sm text-gray-300">
                      {link}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}