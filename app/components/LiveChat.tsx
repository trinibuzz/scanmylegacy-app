"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function LiveChat() {
  const pathname = usePathname();

  const allowedPages = [
    "/",
    "/about",
    "/packages",
    "/faqs",
    "/how-it-works",
    "/login",
    "/create-memorial",
  ];

  const showChat =
    allowedPages.includes(pathname) || pathname.startsWith("/create-memorial");

  if (!showChat) {
    return null;
  }

  return (
    <Script id="tawk-to-live-chat" strategy="afterInteractive">
      {`
        var Tawk_API = Tawk_API || {};
        var Tawk_LoadStart = new Date();

        (function(){
          var s1 = document.createElement("script");
          var s0 = document.getElementsByTagName("script")[0];

          s1.async = true;
          s1.src = "https://embed.tawk.to/69f6cea294a2091c3369d5ea/1jnm1eam4";
          s1.charset = "UTF-8";
          s1.setAttribute("crossorigin", "*");

          s0.parentNode.insertBefore(s1, s0);
        })();
      `}
    </Script>
  );
}