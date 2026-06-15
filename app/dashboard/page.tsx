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
    process.env.NEXT_PUBLIC_SITE_URL || "https://scanmylegacy.com";

  const now = new Date();

  const safeMediaPath = (pathValue: any) => {
    if (!pathValue) return "";

    let cleanPath = String(pathValue).trim();
    cleanPath = cleanPath.replace(/\\/g, "/");

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    cleanPath = cleanPath.replace(/^public\//, "");
    cleanPath = cleanPath.replace(/^\/public\//, "/");

    if (!cleanPath.startsWith("/")) {
      cleanPath = `/${cleanPath}`;
    }

    return encodeURI(cleanPath);
  };

  for (const memorial of memorials) {
    const paymentDueAt = memorial.payment_due_at
      ? new Date(memorial.payment_due_at)
      : null;

    const bankTransferExpired =
      memorial.payment_status === "pending_bank_transfer" &&
      paymentDueAt &&
      now.getTime() > paymentDueAt.getTime();

    if (bankTransferExpired) {
      await db.execute(
        `UPDATE memorials
         SET payment_status = ?
         WHERE id = ? AND payment_status = ?`,
        ["expired_bank_transfer", memorial.id, "pending_bank_transfer"]
      );

      memorial.payment_status = "expired_bank_transfer";
    }
  }

  const livingLegacyCount = memorials.filter(
    (m: any) => m.page_type === "living"
  ).length;

  const memorialCount = memorials.filter(
    (m: any) => m.page_type !== "living"
  ).length;

  const isFreePlan = !user.plan || user.plan === "free";

  const hasPaidOrPendingPaidMemorial = memorials.some((m: any) => {
    const price = Number(m.package_price || 0);

    return (
      price > 0 &&
      (m.payment_status === "paid" ||
        m.payment_status === "pending_bank_transfer")
    );
  });

  let trialEndsAt: Date | null = null;

  if (isFreePlan) {
    if (user.trial_ends_at) {
      trialEndsAt = new Date(user.trial_ends_at);
    } else if (user.created_at) {
      trialEndsAt = new Date(user.created_at);
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    }
  }

  const trialExpired =
    isFreePlan && trialEndsAt ? now.getTime() > trialEndsAt.getTime() : false;

  const msLeft = trialEndsAt ? trialEndsAt.getTime() - now.getTime() : 0;

  const daysLeft =
    isFreePlan && trialEndsAt && !trialExpired
      ? Math.ceil(msLeft / (1000 * 60 * 60 * 24))
      : 0;

  const trialStatusLabel = !isFreePlan
    ? "Not on trial"
    : !trialEndsAt
    ? "Trial date missing"
    : trialExpired
    ? "Trial expired"
    : daysLeft <= 0
    ? "Expires today"
    : daysLeft === 1
    ? "1 day left"
    : `${daysLeft} days left`;

  const currentPaidMemorial = memorials.find(
    (m: any) => Number(m.package_price || 0) > 0
  );

  const effectivePlanSlug = currentPaidMemorial?.package_slug || user.plan;

  const planLabel =
    effectivePlanSlug === "standard-legacy"
      ? "Standard Legacy"
      : effectivePlanSlug === "premium-legacy"
      ? "Premium Legacy"
      : effectivePlanSlug === "eternal-legacy"
      ? "Eternal Legacy"
      : "Starter Tribute";

  const getPageTypeLabel = (type: string) => {
    if (type === "living") return "Living Legacy";
    return "Memorial";
  };

  const getPageTypeBadgeClass = (type: string) => {
    if (type === "living") {
      return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
    }

    return "border-[#d4af37]/40 bg-[#d4af37]/15 text-[#d4af37]";
  };

  const getPageTypeIcon = (type: string) => {
    if (type === "living") return "✍️";
    return "🕊️";
  };

  const getPaymentLabel = (status: string) => {
    if (status === "paid") return "Paid";
    if (status === "free") return "Free Trial";
    if (status === "pending_bank_transfer") return "Bank Transfer Pending";
    if (status === "expired_bank_transfer") return "Payment Review Expired";
    if (status === "pending") return "Pending Payment";
    return "Pending Payment";
  };

  const getPaymentBadgeClass = (status: string) => {
    if (status === "paid") return "bg-green-500/20 text-green-300";
    if (status === "free") return "bg-[#d4af37]/15 text-[#d4af37]";
    if (status === "pending_bank_transfer")
      return "bg-yellow-500/20 text-yellow-200";
    if (status === "expired_bank_transfer")
      return "bg-red-500/20 text-red-300";
    return "bg-[#d4af37]/15 text-[#d4af37]";
  };

  const getBankTransferMessage = (m: any) => {
    if (m.payment_status !== "pending_bank_transfer") return "";

    if (!m.payment_due_at) {
      return "Bank transfer reference submitted. Payment is pending admin review.";
    }

    const dueAt = new Date(m.payment_due_at);
    const hoursLeft = Math.max(
      0,
      Math.ceil((dueAt.getTime() - now.getTime()) / (1000 * 60 * 60))
    );

    return `Bank transfer reference submitted. Temporary access is active while payment is reviewed. About ${hoursLeft} hour${
      hoursLeft === 1 ? "" : "s"
    } left before automatic deactivation if payment is not verified.`;
  };

  const packageStatusText = currentPaidMemorial
    ? currentPaidMemorial.payment_status === "paid"
      ? "Your legacy package is active."
      : currentPaidMemorial.payment_status === "pending_bank_transfer"
      ? "Bank transfer submitted. Temporary access is active while payment is reviewed."
      : currentPaidMemorial.payment_status === "expired_bank_transfer"
      ? "Bank transfer review expired. Payment must be verified to reactivate."
      : "Your paid package is pending payment."
    : !isFreePlan
    ? "Your legacy package is active."
    : !trialEndsAt
    ? "Free trial date needs to be checked."
    : trialExpired
    ? "Your free trial has expired."
    : daysLeft <= 0
    ? "Your free trial expires today."
    : `${trialStatusLabel} in your free trial`;

  const accountIsActive =
    Number(user.is_active) !== 0 &&
    (!trialExpired || hasPaidOrPendingPaidMemorial);

  if (
    (trialExpired || Number(user.is_active) === 0) &&
    !hasPaidOrPendingPaidMemorial
  ) {
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
                  Manage your Living Legacy and Memorial pages, share your
                  private links, view your package status, and continue
                  preserving stories, wishes, memories, and family history.
                </p>
              </div>

              <div className="rounded-2xl border border-[#d4af37]/30 bg-black/20 p-5">
                <p className="text-sm text-gray-400">Current Package</p>

                <h2 className="mt-1 font-serif text-2xl text-[#d4af37]">
                  {planLabel}
                </h2>

                <p className="mt-2 text-sm text-gray-300">
                  {packageStatusText}
                </p>

                {isFreePlan && !currentPaidMemorial && (
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
            <p className="text-sm text-gray-400">Total Pages</p>
            <h3 className="mt-2 text-3xl font-bold text-[#d4af37]">
              {memorials.length}
            </h3>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
            <p className="text-sm text-gray-400">Living Legacy</p>
            <h3 className="mt-2 text-3xl font-bold text-emerald-300">
              {livingLegacyCount}
            </h3>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
            <p className="text-sm text-gray-400">Memorials</p>
            <h3 className="mt-2 text-3xl font-bold text-[#d4af37]">
              {memorialCount}
            </h3>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
            <p className="text-sm text-gray-400">Account</p>
            <h3
              className={`mt-2 text-xl font-semibold ${
                accountIsActive ? "text-green-300" : "text-red-300"
              }`}
            >
              {accountIsActive ? "Active" : "Inactive"}
            </h3>
          </div>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
            <p className="text-sm text-gray-400">Plan</p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {planLabel}
            </h3>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
            <p className="text-sm text-gray-400">
              {currentPaidMemorial ? "Payment Status" : "Trial Status"}
            </p>

            <h3
              className={`mt-2 text-xl font-semibold ${
                currentPaidMemorial?.payment_status === "expired_bank_transfer"
                  ? "text-red-300"
                  : currentPaidMemorial?.payment_status ===
                    "pending_bank_transfer"
                  ? "text-yellow-300"
                  : trialExpired
                  ? "text-red-300"
                  : isFreePlan && daysLeft <= 0
                  ? "text-yellow-300"
                  : "text-white"
              }`}
            >
              {currentPaidMemorial
                ? getPaymentLabel(currentPaidMemorial.payment_status)
                : trialStatusLabel}
            </h3>
          </div>
        </section>

        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Legacy Control
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                Your Legacy Pages
              </h2>
            </div>

            <a
              href="/packages"
              className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
            >
              Create Another Page
            </a>
          </div>

          {memorials.length === 0 ? (
            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center">
              <div className="mb-4 text-5xl">✍️</div>

              <h3 className="mb-3 font-serif text-2xl text-[#d4af37]">
                No legacy pages yet
              </h3>

              <p className="mx-auto max-w-xl text-gray-400">
                Begin by creating a beautiful Living Legacy or Memorial page
                where stories, memories, wishes, photos, and family history can
                be preserved for generations.
              </p>

              <a
                href="/packages"
                className="mt-6 inline-block rounded-lg bg-[#d4af37] px-6 py-3 font-semibold text-black"
              >
                Create Legacy Page
              </a>
            </div>
          ) : (
            <div className="grid gap-6">
              {memorials.map((m: any) => {
                const link = `${siteUrl}/memorial/${m.invite_token}`;
                const isExpiredBankTransfer =
                  m.payment_status === "expired_bank_transfer";
                const bankTransferMessage = getBankTransferMessage(m);

                const pageType =
                  m.page_type === "living" ? "living" : "memorial";
                const pageTypeLabel = getPageTypeLabel(pageType);
                const pageTypeIcon = getPageTypeIcon(pageType);

                const pageWord =
                  pageType === "living" ? "legacy page" : "memorial";

                const linkLabel =
                  pageType === "living" ? "Legacy Link" : "Memorial Link";

                const viewButtonLabel =
                  pageType === "living" ? "View Legacy Page" : "View Memorial";

                const manageButtonLabel =
                  pageType === "living"
                    ? "Manage Legacy Page"
                    : "Manage Memorial";

                const shareText =
                  pageType === "living"
                    ? `View this legacy page: ${link}`
                    : `View this memorial: ${link}`;

                const emailSubject =
                  pageType === "living"
                    ? `Legacy Page of ${m.full_name}`
                    : `Memorial of ${m.full_name}`;

                return (
                  <div
                    key={m.id}
                    className={`overflow-hidden rounded-3xl border bg-[#111a2e] shadow-xl ${
                      isExpiredBankTransfer
                        ? "border-red-400/30 opacity-75"
                        : "border-[#1f2a44]"
                    }`}
                  >
                    <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                      <div className="relative min-h-[220px] bg-[#081827]">
                        {m.cover_photo ? (
                          <img
                            src={safeMediaPath(m.cover_photo)}
                            alt={m.full_name}
                            className="h-full min-h-[220px] w-full object-cover object-[center_20%]"
                          />
                        ) : (
                          <div className="flex h-full min-h-[220px] items-center justify-center text-6xl">
                            {pageTypeIcon}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      </div>

                      <div className="p-6 md:p-8">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-4 py-2 text-xs font-semibold ${getPageTypeBadgeClass(
                                  pageType
                                )}`}
                              >
                                {pageTypeIcon} {pageTypeLabel}
                              </span>
                            </div>

                            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#d4af37]">
                              {pageTypeLabel}
                            </p>

                            <h3 className="font-serif text-3xl text-white">
                              {m.full_name}
                            </h3>

                            <p className="mt-2 text-sm text-gray-400">
                              {m.birth_date
                                ? new Date(m.birth_date).toLocaleDateString()
                                : ""}
                              {m.death_date ? " — " : ""}
                              {m.death_date
                                ? new Date(m.death_date).toLocaleDateString()
                                : pageType === "living"
                                ? "Living Legacy"
                                : ""}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-4 py-2 text-xs font-semibold ${getPaymentBadgeClass(
                              m.payment_status
                            )}`}
                          >
                            {getPaymentLabel(m.payment_status)}
                          </span>
                        </div>

                        {bankTransferMessage && (
                          <div className="mb-5 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-sm leading-relaxed text-yellow-100">
                            {bankTransferMessage}
                          </div>
                        )}

                        {isExpiredBankTransfer && (
                          <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm leading-relaxed text-red-100">
                            This {pageWord} was temporarily active while bank
                            transfer payment was being reviewed. Payment was not
                            verified within 48 hours, so access is now
                            temporarily deactivated until payment is confirmed.
                          </div>
                        )}

                        <p className="line-clamp-3 text-gray-300">
                          {m.biography || "No story added yet."}
                        </p>

                        <div className="mt-6 rounded-xl border border-[#1f2a44] bg-[#0b1320] p-4">
                          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                            {linkLabel}
                          </p>

                          <div className="break-all rounded-lg bg-black/30 p-3 text-sm text-gray-300">
                            {link}
                          </div>
                        </div>

                        {m.invite_token && (
                          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            {isExpiredBankTransfer ? (
                              <button
                                disabled
                                className="cursor-not-allowed rounded-lg bg-gray-700 px-5 py-3 text-sm font-semibold text-gray-300"
                              >
                                Awaiting Payment Verification
                              </button>
                            ) : (
                              <>
                                <a
                                  href={`/memorial/${m.invite_token}`}
                                  className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
                                >
                                  {viewButtonLabel}
                                </a>

                                <a
                                  href={`/dashboard/memorial/${m.id}`}
                                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
                                >
                                  {manageButtonLabel}
                                </a>

                                {Number(m.enable_family_tree) === 1 && (
                                  <a
                                    href={`/family-tree/${m.id}`}
                                    className="rounded-lg border border-[#d4af37]/50 bg-[#111a2e] px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
                                  >
                                    Manage Family Tree
                                  </a>
                                )}

                                <a
                                  href={`https://wa.me/?text=${encodeURIComponent(
                                    shareText
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white"
                                >
                                  Share WhatsApp
                                </a>

                                <a
                                  href={`mailto:?subject=${encodeURIComponent(
                                    emailSubject
                                  )}&body=${encodeURIComponent(shareText)}`}
                                  className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37]"
                                >
                                  Share Email
                                </a>
                              </>
                            )}
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