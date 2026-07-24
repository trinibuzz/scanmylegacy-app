"use client";

import { useEffect } from "react";

export default function AffiliateClickTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get("ref");

    if (!referralCode) return;

    const cleanCode = referralCode.trim();
    if (!cleanCode) return;

    const storageKey = `scanmylegacy_affiliate_click_${cleanCode}`;

    const lastClick = localStorage.getItem(storageKey);
    const now = Date.now();

    if (lastClick) {
      const lastClickTime = Number(lastClick);
      const thirtyMinutes = 30 * 60 * 1000;

      if (!Number.isNaN(lastClickTime) && now - lastClickTime < thirtyMinutes) {
        return;
      }
    }

    localStorage.setItem(storageKey, String(now));
    localStorage.setItem("scanmylegacy_ref", cleanCode);

    fetch("/api/affiliate-click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referralCode: cleanCode,
        pageUrl: window.location.href,
        referrer: document.referrer || "",
        userAgent: navigator.userAgent || "",
      }),
    }).catch(() => {});
  }, []);

  return null;
}