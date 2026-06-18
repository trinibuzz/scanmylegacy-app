import SiteHeader from "../components/SiteHeader";

export default function FAQPage() {
  const faqSections = [
    {
      title: "About ScanMyLegacy",
      description:
        "General questions about what the platform does and who it is for.",
      faqs: [
        {
          q: "What is ScanMyLegacy?",
          a: "ScanMyLegacy is a digital legacy platform that helps families preserve memories, stories, photos, videos, audio, family history, milestones, and messages in one private online page. It can be used for both Living Legacy pages and Memorial pages.",
        },
        {
          q: "What is a Living Legacy page?",
          a: "A Living Legacy page is created while a person is alive. It allows them to record their life story, upload photos from birth to present, share advice, recipes, family secrets, voice notes, video messages, milestones, and special memories for future generations.",
        },
        {
          q: "What is a Memorial page?",
          a: "A Memorial page is created in honor of someone who has passed away. It gives family and friends a private place to view photos, read the life story, light candles, send flowers, leave tributes, view the family tree, and share memories together.",
        },
        {
          q: "What is the difference between Living Legacy and Memorial?",
          a: "Living Legacy is for someone who is still alive and wants to document their life, wisdom, memories, and messages. Memorial is for honoring someone after they pass away. A Living Legacy page can later be converted into a Memorial page by the admin when needed.",
        },
        {
          q: "Who can use ScanMyLegacy?",
          a: "Individuals, families, funeral homes, churches, community groups, caregivers, and anyone who wants to preserve a person’s story can use ScanMyLegacy.",
        },
      ],
    },
    {
      title: "Creating A Page",
      description:
        "How to start, build, and manage a Living Legacy or Memorial page.",
      faqs: [
        {
          q: "How do I create a legacy page?",
          a: "Choose a package, create an account, enter the person’s details, upload a cover photo, add the life story, add gallery photos, and then share the private link or QR code with family and friends.",
        },
        {
          q: "Can I edit the page after it is created?",
          a: "Yes. The owner can log in anytime to update the story, photos, music, gallery, Legacy Vault, Milestones, Family Messages, and other details.",
        },
        {
          q: "Can I create a page for someone else?",
          a: "Yes. A family member, friend, or authorized person can create a Living Legacy or Memorial page for someone else.",
        },
        {
          q: "Can I create more than one page?",
          a: "Yes. You can create and manage multiple legacy pages from your dashboard.",
        },
        {
          q: "Can I start with a Living Legacy and change it later to Memorial?",
          a: "Yes. A Living Legacy page can be converted into a Memorial page by admin when the time comes. The information, photos, memories, family tree, and messages can remain connected to the page.",
        },
      ],
    },
    {
      title: "Features",
      description:
        "What visitors and page owners can do inside a ScanMyLegacy page.",
      faqs: [
        {
          q: "What features are included on a legacy page?",
          a: "Features may include My Story, Legacy Vault, Milestones, Blessings or Candles, Flowers, Family Tree, Chatroom, Family & Guest Messages, photo gallery, slideshow, music, video uploads, audio uploads, and a private share link.",
        },
        {
          q: "What is the Legacy Vault?",
          a: "The Legacy Vault is a special area where the owner can add deeper personal memories, recipes, family history, advice, life lessons, future messages, photos, videos, and voice notes. The owner can choose what is visible to the public page.",
        },
        {
          q: "What are Milestones?",
          a: "Milestones are important life events such as birth, school years, graduation, marriage, children, career achievements, travel, birthdays, community work, and other major moments. They help tell the person’s life story in a timeline style.",
        },
        {
          q: "What is the Family Tree?",
          a: "The Family Tree helps families show roots, branches, relationships, parents, children, siblings, and generations in a visual way.",
        },
        {
          q: "What is the Chatroom?",
          a: "The Chatroom allows invited family and friends to share live messages, memories, photos, videos, and audio in one private family space.",
        },
        {
          q: "What are Family & Guest Messages?",
          a: "Family & Guest Messages allow visitors to leave longer messages, memories, blessings, tributes, photos, videos, or audio messages on the page.",
        },
        {
          q: "What are Blessings, Candles, and Flowers?",
          a: "For Living Legacy pages, visitors can leave blessings and send flowers. For Memorial pages, visitors can light candles and plant flowers. These actions allow family and friends to show love, support, and remembrance.",
        },
        {
          q: "Can I upload photos, videos, and audio?",
          a: "Yes. Owners can upload photos, videos, audio, music, voice notes, and gallery images. Visitors may also be able to post media in chat or family messages depending on the page features.",
        },
      ],
    },
    {
      title: "Privacy & Sharing",
      description:
        "How access, invite links, QR codes, and privacy work.",
      faqs: [
        {
          q: "Is my legacy page private?",
          a: "Yes. Legacy pages are private and are normally accessed by a private invite link or QR code. Only people with the link can view the page.",
        },
        {
          q: "Can people find my page on Google?",
          a: "The page is designed to be shared privately by link or QR code. It is not meant to be a public social media profile.",
        },
        {
          q: "How do I share the page with family and friends?",
          a: "You can share the private page link by WhatsApp, text message, email, social media, or by printing the QR code on programs, flyers, keepsakes, or funeral materials.",
        },
        {
          q: "Do visitors need an account?",
          a: "Visitors do not need a full account to view a shared page. They may be asked to enter their name before entering the private page.",
        },
        {
          q: "Can the owner remove unwanted messages?",
          a: "Yes. The owner can manage and delete unwanted chat messages, family messages, blessings, candles, and flowers from the dashboard.",
        },
      ],
    },
    {
      title: "Payments, Packages & Trial",
      description:
        "Information about pricing, trial access, payment methods, and activation.",
      faqs: [
        {
          q: "Do you offer a free trial?",
          a: "Yes. ScanMyLegacy offers a 14-day Starter Tribute trial so users can experience the platform before choosing a paid package.",
        },
        {
          q: "How long does a page stay online?",
          a: "That depends on the package selected. ScanMyLegacy offers packages such as a free trial, 3-year access, 5-year access, and lifetime access.",
        },
        {
          q: "What payment options are available?",
          a: "Payment options may include WiPay online checkout and bank transfer. Bank transfers may require admin verification before full activation.",
        },
        {
          q: "What happens after I pay?",
          a: "After payment is verified, the legacy page becomes active based on the selected package. You can then continue managing and sharing the page.",
        },
        {
          q: "What happens with bank transfer payments?",
          a: "If you choose bank transfer, your page may be temporarily active while payment is reviewed. If payment is not verified within the review period, access may be temporarily disabled until admin confirms payment.",
        },
        {
          q: "Can I upgrade later?",
          a: "Yes. You can upgrade your package later if you want a longer period or more permanent access.",
        },
        {
          q: "Can someone purchase a legacy page as a gift?",
          a: "Yes. A person can purchase a legacy page as a gift for someone else. Gift orders can be connected to the person’s legacy page after payment is verified.",
        },
      ],
    },
    {
      title: "Managing The Page",
      description:
        "Questions about the dashboard, editing, and owner control.",
      faqs: [
        {
          q: "Who manages the legacy page?",
          a: "The person who created the page, or the assigned owner, manages it from the dashboard.",
        },
        {
          q: "What can the owner change?",
          a: "The owner can update the name, dates, story, cover photo, music, gallery, Legacy Vault, Milestones, chat messages, family messages, blessings, candles, flowers, and more.",
        },
        {
          q: "Can I hide something from the public page?",
          a: "Yes. Some areas, such as Legacy Vault entries and Milestones, can be marked visible or hidden from the public page.",
        },
        {
          q: "Can I remove a photo or message?",
          a: "Yes. The owner can remove gallery photos, unwanted visitor messages, chat posts, flowers, candles, or blessings from the dashboard.",
        },
        {
          q: "Can I add music to the page?",
          a: "Yes. You can upload a song, memorial music, or voice note to help create a more emotional and personal experience.",
        },
      ],
    },
    {
      title: "Funeral Homes, Families & QR Codes",
      description:
        "How ScanMyLegacy can be used with services, programs, and keepsakes.",
      faqs: [
        {
          q: "Can funeral homes use ScanMyLegacy?",
          a: "Yes. Funeral homes can offer ScanMyLegacy as an added service to families who want a modern digital memorial or living legacy experience.",
        },
        {
          q: "Can the QR code be printed?",
          a: "Yes. The private QR code can be printed on funeral programs, banners, cards, keepsakes, invitations, and other materials.",
        },
        {
          q: "Can family members contribute after the funeral?",
          a: "Yes. Family and friends can continue adding messages, memories, photos, videos, and audio after the service, depending on the page settings.",
        },
        {
          q: "Is ScanMyLegacy only for funerals?",
          a: "No. ScanMyLegacy is also for living persons who want to preserve their story while they are alive. It can be used for parents, grandparents, community leaders, pastors, teachers, artists, business owners, and anyone with a story worth preserving.",
        },
      ],
    },
    {
      title: "Support",
      description:
        "What to do if you need help.",
      faqs: [
        {
          q: "What if I need help setting up my page?",
          a: "You can contact ScanMyLegacy support for help with setup, uploads, payments, and general questions.",
        },
        {
          q: "What if I make a mistake?",
          a: "Most information can be edited from the dashboard. If you need help correcting something important, contact support.",
        },
        {
          q: "What if my page is not showing?",
          a: "Check that your payment is verified, your package is active, and you are using the correct private link. If the problem continues, contact support.",
        },
        {
          q: "How do I contact support?",
          a: "You can contact ScanMyLegacy through the support email, website contact options, or the contact information provided on the site.",
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      <section className="relative min-h-[70vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/faq-hero.jpg"
          alt="Frequently Asked Questions"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/82 to-[#0b1320]/45" />

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              FAQ
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              Frequently Asked Questions
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              Everything you need to know about creating, managing, sharing, and
              preserving a Living Legacy or Memorial page with ScanMyLegacy.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/packages"
                className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
              >
                View Packages
              </a>

              <a
                href="/gift/start"
                className="rounded-full border border-[#d4af37]/50 bg-black/20 px-6 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
              >
                Gift A Legacy
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d4af37]/10 bg-[#081827] px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Living Legacy",
            "Memorial Pages",
            "Private QR Access",
            "Family Memories",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[#d4af37]/15 bg-[#111a2e] p-5 text-center shadow-xl"
            >
              <p className="text-sm uppercase tracking-[0.22em] text-[#d4af37]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Help Center
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl">
            Answers Before You Start
          </h2>

          <p className="mx-auto mt-4 max-w-3xl leading-relaxed text-gray-400">
            These questions are organized by topic so families, page owners,
            visitors, and funeral partners can quickly understand how the
            platform works.
          </p>
        </div>

        <div className="space-y-12">
          {faqSections.map((section) => (
            <div key={section.title}>
              <div className="mb-5 rounded-2xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl">
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                  {section.title}
                </p>

                <p className="max-w-3xl text-sm leading-relaxed text-gray-400">
                  {section.description}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {section.faqs.map((faq) => (
                  <div
                    key={faq.q}
                    className="rounded-2xl border border-[#d4af37]/15 bg-[#111a2e] p-6 shadow-xl transition hover:border-[#d4af37]/40"
                  >
                    <h3 className="mb-3 font-serif text-xl text-[#d4af37]">
                      {faq.q}
                    </h3>

                    <p className="text-sm leading-relaxed text-gray-300">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 text-center">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-8 shadow-2xl sm:p-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Still Need Help?
          </p>

          <h2 className="mb-4 font-serif text-3xl sm:text-4xl">
            We Are Here To Help You Preserve Every Memory
          </h2>

          <p className="mx-auto mb-8 max-w-2xl leading-relaxed text-gray-400">
            Explore our packages, create a Living Legacy, build a Memorial page,
            or gift a legacy to someone you love.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/packages"
              className="rounded-full bg-[#d4af37] px-8 py-4 font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
            >
              View Packages
            </a>

            <a
              href="/gift/start"
              className="rounded-full border border-[#d4af37]/50 px-8 py-4 font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
            >
              Gift A Legacy
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}