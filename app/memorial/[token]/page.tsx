import { db } from "../../../lib/db";
import GuestAccess from "./GuestAccess";

export default async function MemorialPage({ params }: any) {
  const { token } = params;

  const [rows]: any = await db.execute(
    "SELECT * FROM memorials WHERE invite_token = ? LIMIT 1",
    [token]
  );

  const memorial = rows[0];

  if (!memorial) {
    return (
      <main className="min-h-screen bg-[#0b1320] p-10 text-white">
        Invalid legacy link.
      </main>
    );
  }

  const pageType = memorial.page_type === "living" ? "living" : "memorial";

  const pageTypeLabel =
    pageType === "living" ? "Living Legacy Page" : "Memorial Page";

  const pageWord = pageType === "living" ? "legacy page" : "memorial";

  const lockedTitle =
    pageType === "living"
      ? "Living Legacy Page Not Active Yet"
      : "Memorial Not Active Yet";

  const [galleryRows]: any = await db.execute(
    "SELECT file_url FROM memorial_gallery WHERE memorial_id = ? ORDER BY id ASC",
    [memorial.id]
  );

  memorial.gallery_photos = galleryRows.map((photo: any) =>
    photo.file_url.startsWith("/") ? photo.file_url : `/${photo.file_url}`
  );

  memorial.page_type = pageType;
  memorial.page_type_label = pageTypeLabel;

  const price = Number(memorial.package_price || 0);
  const isPaidPackage = price > 0;

  const now = new Date();

  const paymentDueAt = memorial.payment_due_at
    ? new Date(memorial.payment_due_at)
    : null;

  const bankTransferStillWithin48Hours =
    memorial.payment_status === "pending_bank_transfer" &&
    paymentDueAt &&
    now.getTime() <= paymentDueAt.getTime();

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

  const isActive =
    !isPaidPackage ||
    memorial.payment_status === "paid" ||
    memorial.payment_status === "free" ||
    bankTransferStillWithin48Hours;

  if (!isActive) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
        <div className="max-w-xl rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center shadow-2xl">
          <div className="mb-4 text-5xl">🔒</div>

          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            {pageTypeLabel}
          </p>

          <h1 className="mb-4 font-serif text-3xl text-[#d4af37]">
            {lockedTitle}
          </h1>

          {memorial.payment_status === "expired_bank_transfer" ? (
            <p className="text-gray-300">
              This {pageWord} was temporarily active while bank transfer payment
              was being reviewed. Payment could not be confirmed within 48
              hours, so the {pageWord} has been temporarily deactivated until
              payment is verified.
            </p>
          ) : (
            <p className="text-gray-300">
              This {pageWord} is pending payment and cannot be viewed until
              payment is completed or verified.
            </p>
          )}
        </div>
      </main>
    );
  }

  return <GuestAccess memorial={memorial} token={token} />;
}