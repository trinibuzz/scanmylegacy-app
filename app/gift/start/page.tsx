import GiftStartForm from "./GiftStartForm";

export const metadata = {
  title: "Start a Legacy Gift | ScanMyLegacy",
};

export default function GiftStartPage() {
  return (
    <main className="min-h-screen bg-[#071426] px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.35em] text-[#d4af37]">
          Gift a Legacy Page
        </p>

        <h1 className="mt-4 font-serif text-4xl md:text-5xl">
          Start a Legacy Gift
        </h1>

        <p className="mt-4 max-w-2xl text-white/75">
          Complete the form below so we can prepare a Legacy Gift Page for your
          loved one.
        </p>

        <GiftStartForm />
      </div>
    </main>
  );
}