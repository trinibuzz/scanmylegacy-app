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

  const now = new Date();
  const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const isFreePlan = !user.plan || user.plan === "free";
  const trialExpired = isFreePlan && trialEndsAt && now > trialEndsAt;

  const daysLeft =
    trialEndsAt && !trialExpired
      ? Math.max(
          0,
          Math.ceil(
            (trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const planLabel =
    user.plan === "standard-legacy"
      ? "Standard Legacy"
      : user.plan === "premium-legacy"
      ? "Premium Legacy"
      : user.plan === "eternal-legacy"
      ? "Eternal Legacy"
      : "Starter Tribute";

  if (trialExpired || Number(user.is_active) === 0) {
    redirect("/packages?expired=1");
  }

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10 overflow-hidden rounded-3xl border border-[#d4af37]/30 bg-[#111a2e] shadow-2xl">
          <div className="bg-gradient-to-r from-[#081827] via-[#111a2e] to-[#081827] p-8 md:p-10">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Owner Dashboard
            </p>

            <div className="grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-center">
              <div>
                <h1 className="font-serif text-4xl font-bold md:text-5xl">
                  Welcome, {user.name}
                </h1>

                <p className="mt-4 max-w-2xl text-gray-300">
                  Manage your loved one’s memorial, share the memorial link,
                  view your package status, and continue preserving their story.
                </p>
              </div>

              <div className="rounded-2xl border border-[#d4af37]/30 bg-black/20 p-5">
                <p className="text-sm text-gray-400">Current Package</p>

                <h2 className="mt-1 font-serif text-2xl text-[#d4af37]">
                  {planLabel}
                </h2>

                {isFreePlan ? (
                  <p className="mt-2 text-sm text-gray-300">
                    {trialEndsAt
                      ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in your free trial`
                      : "Free trial active"}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-gray-300">
                    Your memorial package is active.
                  </p>
                )}

                {isFreePlan && (
                  <a
                    href="/packages"
                    className="mt-5 inline-block rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
                  >
                    Upgrade Package
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
            <p className="text-sm text-gray-400">Memorials</p>
            <h3 className="mt-2 text-3xl font-bold text-[#d4af37]">
              {memorials.length}
            </h3>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
            <p className="text-sm text-gray-400">Plan</p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {planLabel}
            </h3>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
            <p className="text-sm text-gray-400">Trial Status</p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {isFreePlan ? `${daysLeft} days left` : "Not on trial"}
            </h3>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
            <p className="text-sm text-gray-400">Account</p>
            <h3 className="mt-2 text-xl font-semibold text-green-300">
              Active
            </h3>
          </div>
        </section>

        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Memorial Control
              </p>

              <h2 className="mt-2 font-serif text-3xl">Your Memorials</h2>
            </div>

            <a
              href="/packages"
              className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
            >
              Create Another Memorial
            </a>
          </div>

          {memorials.length === 0 ? (
            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center">
              <div className="mb-4 text-5xl">🕯️</div>

              <h3 className="mb-3 font-serif text-2xl text-[#d4af37]">
                No memorials yet
              </h3>

              <p className="mx-auto max-w-xl text-gray-400">
                Begin by creating a beautiful memorial page where family and
                friends can view memories, leave tributes, and keep their story
                alive.
              </p>

              <a
                href="/packages"
                className="mt-6 inline-block rounded-lg bg-[#d4af37] px-6 py-3 font-semibold text-black"
              >
                Create Memorial
              </a>
            </div>
          ) : (
            <div className="grid gap-6">
              {memorials.map((m: any) => {
                const link = `${siteUrl}/memorial/${m.invite_token}`;

                const paymentLabel =
                  m.payment_status === "paid"
                    ? "Paid"
                    : m.payment_status === "free"
                    ? "Free Trial"
                    : "Pending Payment";

                return (
                  <div
                    key={m.id}
                    className="overflow-hidden rounded-3xl border border-[#1f2a44] bg-[#111a2e] shadow-xl"
                  >
                    <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                      <div className="relative min-h-[220px] bg-[#081827]">
                        {m.cover_photo ? (
                          <img
                            src={m.cover_photo}
                            alt={m.full_name}
                            className="h-full min-h-[220px] w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-[220px] items-center justify-center text-6xl">
                            🕯️
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      </div>

                      <div className="p-6 md:p-8">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#d4af37]">
                              Memorial
                            </p>

                            <h3 className="font-serif text-3xl text-white">
                              {m.full_name}
                            </h3>

                            <p className="mt-2 text-sm text-gray-400">
                              {m.birth_date
                                ? new Date(m.birth_date).toLocaleDateString()
                                : ""}
                              {" — "}
                              {m.death_date
                                ? new Date(m.death_date).toLocaleDateString()
                                : ""}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-4 py-2 text-xs font-semibold ${
                              m.payment_status === "paid"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-[#d4af37]/15 text-[#d4af37]"
                            }`}
                          >
                            {paymentLabel}
                          </span>
                        </div>

                        <p className="line-clamp-3 text-gray-300">
                          {m.biography || "No biography added yet."}
                        </p>

                        <div className="mt-6 rounded-xl border border-[#1f2a44] bg-[#0b1320] p-4">
                          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                            Memorial Link
                          </p>

                          <div className="break-all rounded-lg bg-black/30 p-3 text-sm text-gray-300">
                            {link}
                          </div>
                        </div>

                        {m.invite_token && (
                          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <a
                              href={`/memorial/${m.invite_token}`}
                              className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
                            >
                              View Memorial
                            </a>

                            <a
                              href={`/dashboard/memorial/${m.id}`}
                              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
                            >
                              Manage Memorial
                            </a>

                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(
                                `View this memorial: ${link}`
                              )}`}
                              target="_blank"
                              className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white"
                            >
                              Share WhatsApp
                            </a>

                            <a
                              href={`mailto:?subject=${encodeURIComponent(
                                `Memorial of ${m.full_name}`
                              )}&body=${encodeURIComponent(
                                `View this memorial: ${link}`
                              )}`}
                              className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37]"
                            >
                              Share Email
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
