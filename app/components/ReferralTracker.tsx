"use client";

import { useEffect } from "react";

const STORAGE_KEY = "scanmylegacy_ref";

function isInternalUrl(url: URL) {
  return url.origin === window.location.origin;
}

function shouldSkipUrl(url: URL) {
  const pathname = url.pathname.toLowerCase();

  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    url.hash.startsWith("#")
  );
}

export default function ReferralTracker() {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const refFromUrl = currentUrl.searchParams.get("ref");

    if (refFromUrl) {
      localStorage.setItem(STORAGE_KEY, refFromUrl);
    }

    const getSavedRef = () => {
      return localStorage.getItem(STORAGE_KEY) || "";
    };

    const handleClick = (event: MouseEvent) => {
      const savedRef = getSavedRef();

      if (!savedRef) return;

      const target = event.target as HTMLElement | null;
      const link = target?.closest("a") as HTMLAnchorElement | null;

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:")) return;
      if (href.startsWith("tel:")) return;
      if (href.startsWith("javascript:")) return;

      const url = new URL(href, window.location.origin);

      if (!isInternalUrl(url)) return;
      if (shouldSkipUrl(url)) return;

      if (!url.searchParams.get("ref")) {
        url.searchParams.set("ref", savedRef);
        link.href = url.pathname + url.search + url.hash;
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}