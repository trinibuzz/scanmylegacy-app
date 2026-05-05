import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#d4af37]/30 bg-[#07111f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#111a2e] text-xl text-[#d4af37]">
                🕯️
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold">
                  Scan<span className="text-[#d4af37]">My</span>Legacy
                </h2>

                <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">
                  Memorial Tribute
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Preserve memories, celebrate lives, and keep their legacy alive
              forever through beautiful digital memorials.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-xl text-[#d4af37]">
              Quick Links
            </h3>

            <div className="grid gap-3 text-sm text-gray-300">
              <Link href="/" className="transition hover:text-[#d4af37]">
                Home
              </Link>

              <Link href="/about" className="transition hover:text-[#d4af37]">
                About Us
              </Link>

              <Link
                href="/how-it-works"
                className="transition hover:text-[#d4af37]"
              >
                How It Works
              </Link>

              <Link
                href="/packages"
                className="transition hover:text-[#d4af37]"
              >
                Packages
              </Link>

              <Link href="/faq" className="transition hover:text-[#d4af37]">
                FAQ
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-xl text-[#d4af37]">
              Memorial Access
            </h3>

            <div className="grid gap-3 text-sm text-gray-300">
              <Link
                href="/register"
                className="transition hover:text-[#d4af37]"
              >
                Book a Spot
              </Link>

              <Link href="/login" className="transition hover:text-[#d4af37]">
                Login
              </Link>

              <Link
                href="/affiliate-login"
                className="transition hover:text-[#d4af37]"
              >
                Affiliate Login
              </Link>

              <Link
                href="/affiliate-signup"
                className="transition hover:text-[#d4af37]"
              >
                Become an Affiliate
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-xl text-[#d4af37]">
              Support
            </h3>

            <div className="space-y-3 text-sm text-gray-300">
              <p>
                <span className="text-[#d4af37]">Email:</span>{" "}
                support@scanmylegacy.com
              </p>

              <p>
                <span className="text-[#d4af37]">Powered by:</span>{" "}
                Trinibuzz All Media Solutions
              </p>

              <p>
                <span className="text-[#d4af37]">Location:</span> Trinidad &
                Tobago
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#d4af37]/20 pt-6">
          <div className="flex flex-col gap-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} ScanMyLegacy. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/privacy-policy"
                className="transition hover:text-[#d4af37]"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms-of-service"
                className="transition hover:text-[#d4af37]"
              >
                Terms of Service
              </Link>

              <Link
                href="/admin/login"
                className="transition hover:text-[#d4af37]"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}