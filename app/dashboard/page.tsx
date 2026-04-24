import { db } from "../../lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  if (!userCookie) {
    redirect("/login");
  }

  const user = JSON.parse(userCookie.value);

  const [memorials]: any = await db.execute(
    "SELECT * FROM memorials WHERE user_id = ? ORDER BY created_at DESC",
    [user.id]
  );

  return (
    <main className="min-h-screen bg-[#0b1320] text-white p-8">
      <h1 className="text-3xl font-serif mb-6">
        Welcome, {user.name}
      </h1>

      <h2 className="text-xl mb-4 text-gray-300">
        Your Memorials
      </h2>

      {memorials.length === 0 ? (
        <p className="text-gray-400">No memorials yet.</p>
      ) : (
        <div className="grid gap-4">
          {memorials.map((m: any) => (
            <div
              key={m.id}
              className="p-4 bg-[#111a2e] rounded-lg border border-[#1f2a44]"
            >
              <h3 className="text-lg font-semibold">{m.full_name}</h3>
              <p className="text-gray-400 text-sm">
                {m.birth_date ? new Date(m.birth_date).toLocaleDateString() : ""}
{" — "}
{m.death_date ? new Date(m.death_date).toLocaleDateString() : ""}
              </p>
              <p className="mt-2 text-gray-300 line-clamp-2">
                {m.biography}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}