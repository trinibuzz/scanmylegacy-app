"use client";

export default function AffiliateLogoutButton() {
  const logout = async () => {
    try {
      await fetch("/api/affiliate-logout", {
        method: "POST",
      });

      window.location.href = "/affiliate-login";
    } catch {
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full border border-red-400/40 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
    >
      Logout
    </button>
  );
}