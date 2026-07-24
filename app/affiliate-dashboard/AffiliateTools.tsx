"use client";

type AffiliateToolsProps = {
  referralLink: string;
  shareMessage: string;
};

export default function AffiliateTools({
  referralLink,
  shareMessage,
}: AffiliateToolsProps) {
  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(message);
    } catch {
      alert("Could not copy. Please copy manually.");
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => copyText(referralLink, "Referral link copied.")}
        className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-[#061b3a] transition hover:bg-[#f0c94a]"
      >
        Copy Referral Link
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-green-400/40 bg-green-500/10 px-6 py-3 text-center text-sm font-bold text-green-300 transition hover:bg-green-500/20"
      >
        Share on WhatsApp
      </a>

      <button
        type="button"
        onClick={() => copyText(shareMessage, "Marketing message copied.")}
        className="rounded-full border border-[#d4af37]/40 px-6 py-3 text-sm font-bold text-[#d4af37] transition hover:bg-[#d4af37]/10"
      >
        Copy Message
      </button>
    </div>
  );
}