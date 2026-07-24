"use client";

import { useEffect, useState } from "react";
import FamilyTreeView from "./FamilyTreeView";
import ChatBox from "./ChatBox";

type ActiveSection =
  | "story"
  | "legacy-vault"
  | "private-messages"
  | "trusted-contact"
  | "milestones"
  | "blessings"
  | "flowers"
  | "family-tree"
  | "chat"
  | "messages";

export default function GuestAccess({ memorial, token }: any) {
  const [allowed, setAllowed] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [visitorCount, setVisitorCount] = useState(0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("story");

  const [legacyVaultEntries, setLegacyVaultEntries] = useState<any[]>([]);
  const [loadingLegacyVault, setLoadingLegacyVault] = useState(false);
  const [privateRecipientName, setPrivateRecipientName] = useState("");
  const [privateRecipientContact, setPrivateRecipientContact] = useState("");
  const [privateAccessCode, setPrivateAccessCode] = useState("");
  const [privateVaultEntries, setPrivateVaultEntries] = useState<any[]>([]);
  const [unlockingPrivateVault, setUnlockingPrivateVault] = useState(false);
  const [privateUnlockMessage, setPrivateUnlockMessage] = useState("");
  const [trustedRequestType, setTrustedRequestType] = useState("convert_to_memorial");
  const [trustedContactName, setTrustedContactName] = useState("");
  const [trustedContactEmail, setTrustedContactEmail] = useState("");
  const [trustedContactPhone, setTrustedContactPhone] = useState("");
  const [trustedAccessCode, setTrustedAccessCode] = useState("");
  const [trustedRequestNote, setTrustedRequestNote] = useState("");
  const [submittingTrustedRequest, setSubmittingTrustedRequest] = useState(false);
  const [trustedRequestMessage, setTrustedRequestMessage] = useState("");
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  const [messageName, setMessageName] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

  const [candles, setCandles] = useState(0);
  const [flowers, setFlowers] = useState(0);
  const [reactions, setReactions] = useState<any[]>([]);

  const [showCandleModal, setShowCandleModal] = useState(false);
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [tributeName, setTributeName] = useState("");
  const [tributeMessage, setTributeMessage] = useState("");
  const [flowerType, setFlowerType] = useState("rose");

  const [showEditReactionModal, setShowEditReactionModal] = useState(false);
  const [editingReaction, setEditingReaction] = useState<any>(null);
  const [editReactionMessage, setEditReactionMessage] = useState("");
  const [editReactionFlowerType, setEditReactionFlowerType] = useState("rose");
  const [savingReactionEdit, setSavingReactionEdit] = useState(false);

  const pageType = memorial.page_type === "living" ? "living" : "memorial";
  const isLivingLegacy = pageType === "living";

  const allowedPageThemes = [
    "classic_gold",
    "heavenly_white",
    "garden_memories",
    "royal_legacy",
    "caribbean_life",
    "modern_minimal",
    "ocean_tribute",
    "christian_faith",
    "military_honour",
    "celebration_life",
  ];

  const selectedPageTheme = allowedPageThemes.includes(
    String(memorial.page_theme || "classic_gold")
  )
    ? String(memorial.page_theme || "classic_gold")
    : "classic_gold";

  const pageThemes: any = {
    classic_gold: {
      bg: "#0b1320",
      card: "#111a2e",
      cardSoft: "#081827",
      accent: "#d4af37",
      text: "#ffffff",
      muted: "#cbd5e1",
      border: "#2a3550",
      heroOverlay: "linear-gradient(to bottom, rgba(11,19,32,0.78), rgba(11,19,32,0.90), #0b1320)",
    },
    heavenly_white: {
      bg: "#f8f5ef",
      card: "#ffffff",
      cardSoft: "#f1eadc",
      accent: "#b88925",
      text: "#1f2933",
      muted: "#5f6b7a",
      border: "#dfd2bd",
      heroOverlay: "linear-gradient(to bottom, rgba(248,245,239,0.75), rgba(248,245,239,0.92), #f8f5ef)",
    },
    garden_memories: {
      bg: "#0f2418",
      card: "#183524",
      cardSoft: "#102a1b",
      accent: "#d7c58a",
      text: "#fffaf0",
      muted: "#d7e3cf",
      border: "#3f5f45",
      heroOverlay: "linear-gradient(to bottom, rgba(15,36,24,0.72), rgba(15,36,24,0.90), #0f2418)",
    },
    royal_legacy: {
      bg: "#170d2c",
      card: "#241343",
      cardSoft: "#1d1036",
      accent: "#f2c96d",
      text: "#ffffff",
      muted: "#ddd2f0",
      border: "#4a2d78",
      heroOverlay: "linear-gradient(to bottom, rgba(23,13,44,0.74), rgba(23,13,44,0.90), #170d2c)",
    },
    caribbean_life: {
      bg: "#06283d",
      card: "#07445f",
      cardSoft: "#053247",
      accent: "#ffb84d",
      text: "#ffffff",
      muted: "#d5f2f7",
      border: "#1b7a8f",
      heroOverlay: "linear-gradient(to bottom, rgba(6,40,61,0.72), rgba(6,40,61,0.90), #06283d)",
    },
    modern_minimal: {
      bg: "#0a0a0a",
      card: "#171717",
      cardSoft: "#111111",
      accent: "#e5e5e5",
      text: "#ffffff",
      muted: "#c7c7c7",
      border: "#3f3f46",
      heroOverlay: "linear-gradient(to bottom, rgba(10,10,10,0.78), rgba(10,10,10,0.90), #0a0a0a)",
    },
    ocean_tribute: {
      bg: "#062434",
      card: "#0b3d56",
      cardSoft: "#082f44",
      accent: "#7dd3fc",
      text: "#f0fbff",
      muted: "#cceaf5",
      border: "#2b7894",
      heroOverlay: "linear-gradient(to bottom, rgba(6,36,52,0.72), rgba(6,36,52,0.90), #062434)",
    },
    christian_faith: {
      bg: "#f7f4ec",
      card: "#ffffff",
      cardSoft: "#efe7d8",
      accent: "#b88a2b",
      text: "#1f2a44",
      muted: "#5f6b7a",
      border: "#d9c69f",
      heroOverlay: "linear-gradient(to bottom, rgba(247,244,236,0.72), rgba(247,244,236,0.92), #f7f4ec)",
    },
    military_honour: {
      bg: "#182315",
      card: "#24331f",
      cardSoft: "#1d2b19",
      accent: "#d4af37",
      text: "#fff8e6",
      muted: "#d7ddc8",
      border: "#4e633d",
      heroOverlay: "linear-gradient(to bottom, rgba(24,35,21,0.74), rgba(24,35,21,0.91), #182315)",
    },
    celebration_life: {
      bg: "#fff4df",
      card: "#ffffff",
      cardSoft: "#ffe7bd",
      accent: "#f59e0b",
      text: "#3b2512",
      muted: "#765638",
      border: "#f7c76f",
      heroOverlay: "linear-gradient(to bottom, rgba(255,244,223,0.72), rgba(255,244,223,0.92), #fff4df)",
    },
  };

  const currentTheme = pageThemes[selectedPageTheme] || pageThemes.classic_gold;

  const themeStyle = {
    "--sml-bg": currentTheme.bg,
    "--sml-card": currentTheme.card,
    "--sml-card-soft": currentTheme.cardSoft,
    "--sml-accent": currentTheme.accent,
    "--sml-text": currentTheme.text,
    "--sml-muted": currentTheme.muted,
    "--sml-border": currentTheme.border,
    "--sml-hero-overlay": currentTheme.heroOverlay,
  } as any;

  const pageTypeLabel = isLivingLegacy ? "Living Legacy" : "Memorial Tribute";
  const pageTypeFullLabel = isLivingLegacy
    ? "Living Legacy Page"
    : "Memorial Page";

  const pageTitlePrefix = isLivingLegacy
    ? "Living Legacy of"
    : "In Loving Memory";

  const enterButtonLabel = isLivingLegacy
    ? "Enter Legacy Page"
    : "Enter Memorial";

  const shareButtonLabel = isLivingLegacy
    ? "Share Legacy Page"
    : "Share Memorial";

  const pageLinkCopiedLabel = isLivingLegacy
    ? "Legacy page link copied to clipboard"
    : "Memorial link copied to clipboard";

  const slideshowTitle = isLivingLegacy
    ? "Legacy Slideshow"
    : "Memorial Slideshow";

  const slideshowDescription = isLivingLegacy
    ? "A beautiful collection of photos, milestones, family moments, and memories that tell the story of this living legacy."
    : "A beautiful collection of memories that gently plays through each photo like a tribute film.";

  const musicButtonText = isLivingLegacy ? "Legacy Music" : "Memorial Music";
  const lifeStoryTitle = isLivingLegacy ? "My Life Story" : "Life Story";
  const guestbookTitle = isLivingLegacy
    ? "Family & Guest Messages"
    : "Guestbook";

  const legacyVaultTitle = isLivingLegacy ? "Legacy Vault" : "Life Memories";

  const legacyVaultDescription = isLivingLegacy
    ? "Stories, advice, recipes, family history, special memories, photos, videos, and voice messages shared by the owner."
    : "Special stories, photos, videos, and voice messages shared by the page owner or family.";

  const legacyVaultEmptyText = isLivingLegacy
    ? "No Legacy Vault stories have been added yet."
    : "No Life Memories have been added yet.";

  const milestonesTitle = "Milestones";

  const milestonesDescription = isLivingLegacy
    ? "Important life moments, achievements, travels, birthdays, career highlights, family memories, and special events."
    : "A timeline of important life moments, achievements, and family memories.";

  const milestonesEmptyText = isLivingLegacy
    ? "No milestones have been added yet."
    : "No memorial milestones have been added yet.";

  const guestbookPlaceholder = isLivingLegacy
    ? "Write a message, memory, blessing, or words of love..."
    : "Write a message, memory, tribute, or words of comfort...";

  const noGuestbookText = isLivingLegacy
    ? "No family messages yet."
    : "No guestbook messages yet.";

  const candleActionLabel = isLivingLegacy
    ? "Leave a Blessing"
    : "Light a Candle";

  const candleRoomTitle = isLivingLegacy ? "Blessings" : "Candle Room";
  const candleCountText = isLivingLegacy ? "blessings left" : "candles lit";

  const candleEmptyText = isLivingLegacy
    ? "No blessings left yet."
    : "No candles lit yet.";

  const candleModalTitle = isLivingLegacy
    ? "Leave a Blessing"
    : "Light a Candle";

  const candleSubmitLabel = isLivingLegacy
    ? "Leave Blessing"
    : "Light Candle";

  const flowerActionLabel = isLivingLegacy ? "Send Flowers" : "Plant a Flower";

  const flowerCountText = isLivingLegacy
    ? "flowers sent"
    : "flowers planted";

  const flowerEmptyText = isLivingLegacy
    ? "No flowers sent yet."
    : "No flowers planted yet.";

  const flowerSubmitLabel = isLivingLegacy ? "Send Flowers" : "Plant Flower";
  const flowerByLabel = isLivingLegacy ? "Sent by" : "Planted by";

  const heroSubText = isLivingLegacy
    ? "A living tribute filled with stories, memories, blessings, family love, and legacy."
    : "A lasting tribute filled with memories, love, family history, and heartfelt messages.";

  const entryHeading = isLivingLegacy
    ? "You’re invited to visit this Living Legacy"
    : "You’re invited to visit this Memorial Tribute";

  const entryDescription = isLivingLegacy
    ? "Enter your name to view this private legacy page, explore the story, share blessings, send flowers, and connect with family."
    : "Enter your name to view this private memorial, explore memories, light a candle, plant a flower, and leave a tribute.";

  const storyEmptyText = isLivingLegacy
    ? "No life story added yet."
    : "No story added yet.";

  const supportFundEnabled =
    Number(memorial.support_fund_enabled) === 1 &&
    String(memorial.support_fund_url || "").trim().length > 0;

  const supportFundTitle =
    String(memorial.support_fund_title || "").trim() || "Family Support Fund";

  const supportFundPurpose =
    String(memorial.support_fund_purpose || "").trim() ||
    "Support funeral expenses, education, medical needs, or a special family cause connected to this legacy.";

  const supportFundButtonText =
    String(memorial.support_fund_button_text || "").trim() ||
    "Support The Family";

  const supportFundUrl = String(memorial.support_fund_url || "").trim();

  const validSupportFundUrl =
    supportFundUrl.startsWith("http://") ||
    supportFundUrl.startsWith("https://");

  const showSupportFund = supportFundEnabled && validSupportFundUrl;

  const trustedContactEnabled =
    Number(memorial.trusted_contact_enabled) === 1 &&
    String(memorial.trusted_contact_name || "").trim().length > 0;

  const showTrustedContactRequest = trustedContactEnabled;

  const flowerOptions: any = {
    rose: "🌹",
    tulip: "🌷",
    sunflower: "🌻",
    lily: "🌸",
    hibiscus: "🌺",
    orchid: "💮",
  };

  const currentGuestName = String(messageName || guestName || "")
    .trim()
    .toLowerCase();

  const candleReactions = reactions.filter(
    (reaction) => reaction.reaction_type === "candle"
  );

  const flowerReactions = reactions.filter(
    (reaction) => reaction.reaction_type === "flower"
  );

  const featureCards: {
    key: ActiveSection;
    icon: string;
    title: string;
    text: string;
  }[] = [
    {
      key: "story",
      icon: "📖",
      title: isLivingLegacy ? "My Story" : "Life Story",
      text: isLivingLegacy
        ? "Read the main personal life story."
        : "Read the life story and memories.",
    },
    {
      key: "legacy-vault",
      icon: "🔐",
      title: legacyVaultTitle,
      text: isLivingLegacy
        ? "Owner stories, advice, recipes, and media."
        : "Owner-added memories and media.",
    },
    {
      key: "private-messages",
      icon: "🔑",
      title: "Private Messages",
      text: "Unlock a personal message with your code.",
    },
    ...(showTrustedContactRequest
      ? [
          {
            key: "trusted-contact" as ActiveSection,
            icon: "🛡️",
            title: "Trusted Contact",
            text: "Submit a release or conversion request.",
          },
        ]
      : []),
    {
      key: "milestones",
      icon: "🏆",
      title: milestonesTitle,
      text: isLivingLegacy
        ? "Key life moments and achievements."
        : "Important dates and memories.",
    },
    {
      key: "blessings",
      icon: isLivingLegacy ? "❤️" : "🕯️",
      title: isLivingLegacy ? "Blessings" : "Candles",
      text: `${candles} ${candleCountText}`,
    },
    {
      key: "flowers",
      icon: "🌸",
      title: isLivingLegacy ? "Flowers" : "Flower Garden",
      text: `${flowers} ${flowerCountText}`,
    },
    {
      key: "family-tree",
      icon: "🌳",
      title: "Family Tree",
      text: "View family roots and branches.",
    },
    {
      key: "chat",
      icon: "💬",
      title: "Chatroom",
      text: "Share live messages with family.",
    },
    {
      key: "messages",
      icon: "✍️",
      title: isLivingLegacy ? "Family & Guest Messages" : "Guestbook",
      text: isLivingLegacy
        ? "Guest posts from family and friends."
        : "Leave tributes and words of comfort.",
    },
  ];

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

  const navItems: {
    label: string;
    href: string;
    section: ActiveSection;
  }[] = [
    { label: "Slideshow", href: "#slideshow", section: "story" },
    {
      label: isLivingLegacy ? "My Story" : "Life Story",
      href: "#legacy-sections",
      section: "story",
    },
    {
      label: legacyVaultTitle,
      href: "#legacy-sections",
      section: "legacy-vault",
    },
    {
      label: "Private Messages",
      href: "#legacy-sections",
      section: "private-messages",
    },
    ...(showTrustedContactRequest
      ? [
          {
            label: "Trusted Contact",
            href: "#legacy-sections",
            section: "trusted-contact" as ActiveSection,
          },
        ]
      : []),
    {
      label: milestonesTitle,
      href: "#legacy-sections",
      section: "milestones",
    },
    {
      label: isLivingLegacy ? "Blessings" : "Tributes",
      href: "#legacy-sections",
      section: "blessings",
    },
    {
      label: "Family Tree",
      href: "#legacy-sections",
      section: "family-tree",
    },
    { label: "Chat", href: "#legacy-sections", section: "chat" },
    {
      label: isLivingLegacy ? "Family & Guest Messages" : "Guestbook",
      href: "#legacy-sections",
      section: "messages",
    },
  ];

  const publicNavItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Packages", href: "/packages" },
    { label: "FAQ", href: "/faq" },
    { label: "Login", href: "/login" },
  ];

  const canGuestEditReaction = (reaction: any) => {
    const reactionGuestName = String(reaction.guest_name || "")
      .trim()
      .toLowerCase();

    return (
      reaction.guest_can_edit === true &&
      Number(reaction.guest_edit_seconds_left || 0) > 0 &&
      currentGuestName.length > 0 &&
      reactionGuestName === currentGuestName
    );
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const goToSection = (section: ActiveSection, href = "#legacy-sections") => {
    setActiveSection(section);
    setMenuOpen(false);

    setTimeout(() => {
      const targetId = href.replace("#", "");
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const galleryPhotos =
    memorial.gallery_photos && memorial.gallery_photos.length > 0
      ? memorial.gallery_photos.map((photo: any) => safeMediaPath(photo))
      : memorial.cover_photo
      ? [safeMediaPath(memorial.cover_photo)]
      : [];

  const loadGuestbook = async () => {
    const res = await fetch(`/api/guestbook?token=${token}`);
    const data = await res.json();
    setEntries(data.entries || []);
  };

  const loadLegacyVault = async () => {
    try {
      setLoadingLegacyVault(true);

      const res = await fetch(`/api/legacy-vault?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        setLegacyVaultEntries(data.entries || []);
      } else {
        setLegacyVaultEntries([]);
      }
    } catch {
      setLegacyVaultEntries([]);
    } finally {
      setLoadingLegacyVault(false);
    }
  };

  const unlockPrivateVault = async () => {
    if (!privateRecipientName.trim()) {
      alert("Please enter the recipient name.");
      return;
    }

    if (!privateAccessCode.trim()) {
      alert("Please enter the private access code.");
      return;
    }

    try {
      setUnlockingPrivateVault(true);
      setPrivateUnlockMessage("");
      setPrivateVaultEntries([]);

      const res = await fetch("/api/legacy-vault/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          recipient_name: privateRecipientName,
          recipient_contact: privateRecipientContact,
          access_code: privateAccessCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPrivateUnlockMessage(
          data.error || "No private message was found for those details."
        );
        return;
      }

      setPrivateVaultEntries(data.entries || []);
      setPrivateUnlockMessage(
        data.entries?.length
          ? "Private message unlocked."
          : "No private message was found for those details."
      );
    } catch {
      setPrivateUnlockMessage("Could not unlock private messages. Please try again.");
    } finally {
      setUnlockingPrivateVault(false);
    }
  };

  const submitTrustedContactRequest = async () => {
    if (!trustedContactName.trim()) {
      alert("Please enter the trusted contact name.");
      return;
    }

    if (!trustedContactEmail.trim() && !trustedContactPhone.trim()) {
      alert("Please enter the trusted contact email or phone.");
      return;
    }

    try {
      setSubmittingTrustedRequest(true);
      setTrustedRequestMessage("");

      const res = await fetch("/api/trusted-contact/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          request_type: trustedRequestType,
          trusted_contact_name: trustedContactName,
          trusted_contact_email: trustedContactEmail,
          trusted_contact_phone: trustedContactPhone,
          access_code: trustedAccessCode,
          request_note: trustedRequestNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTrustedRequestMessage(
          data.error || "Unable to submit trusted contact request."
        );
        return;
      }

      setTrustedRequestMessage(
        data.message ||
          "Request submitted. ScanMyLegacy admin will review it before anything is changed."
      );

      setTrustedRequestNote("");
    } catch {
      setTrustedRequestMessage("Unable to submit request. Please try again.");
    } finally {
      setSubmittingTrustedRequest(false);
    }
  };

  const loadMilestones = async () => {
    try {
      setLoadingMilestones(true);

      const res = await fetch(`/api/milestones?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        setMilestones(data.milestones || []);
      } else {
        setMilestones([]);
      }
    } catch {
      setMilestones([]);
    } finally {
      setLoadingMilestones(false);
    }
  };

  const loadReactions = async () => {
    const res = await fetch(`/api/reactions?token=${token}`);
    const data = await res.json();

    setCandles(data.candles || 0);
    setFlowers(data.flowers || 0);
    setReactions(data.reactions || []);
  };

  useEffect(() => {
    if (allowed) {
      loadGuestbook();
      loadLegacyVault();
      loadMilestones();
      loadReactions();
    }
  }, [allowed]);

  useEffect(() => {
    if (!allowed) return;

    const interval = setInterval(() => {
      loadReactions();
    }, 30000);

    return () => clearInterval(interval);
  }, [allowed]);

  useEffect(() => {
    if (!isSlideshowPlaying || galleryPhotos.length <= 1) return;

    const interval = setInterval(() => {
      setActivePhoto((current) =>
        current === galleryPhotos.length - 1 ? 0 : current + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [isSlideshowPlaying, galleryPhotos.length]);

  const enterMemorial = async () => {
    if (!guestName.trim()) {
      alert("Please enter your name to continue.");
      return;
    }

    const res = await fetch("/api/guest-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        guest_name: guestName,
        guest_email: guestEmail,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setMessageName(guestName);
    setTributeName(guestName);
    setVisitorCount(data.visitor_count || 0);
    setAllowed(true);
  };

  const shareMemorial = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: isLivingLegacy
          ? `${memorial.full_name} Living Legacy`
          : `${memorial.full_name} Memorial`,
        text: isLivingLegacy
          ? `Visit the living legacy page of ${memorial.full_name}`
          : `Visit the memorial of ${memorial.full_name}`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert(pageLinkCopiedLabel);
    }
  };

  const openCandleModal = () => {
    setTributeName(messageName || guestName);
    setTributeMessage("");
    setShowCandleModal(true);
  };

  const openFlowerModal = () => {
    setTributeName(messageName || guestName);
    setTributeMessage("");
    setFlowerType("rose");
    setShowFlowerModal(true);
  };

  const openEditReactionModal = (reaction: any) => {
    setEditingReaction(reaction);
    setEditReactionMessage(reaction.message || "");
    setEditReactionFlowerType(reaction.flower_type || "rose");
    setShowEditReactionModal(true);
  };

  const closeEditReactionModal = () => {
    setShowEditReactionModal(false);
    setEditingReaction(null);
    setEditReactionMessage("");
    setEditReactionFlowerType("rose");
    setSavingReactionEdit(false);
  };

  const submitReactionEdit = async () => {
    if (!editingReaction) return;

    try {
      setSavingReactionEdit(true);

      const res = await fetch("/api/reactions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          reaction_id: editingReaction.id,
          guest_name: messageName || guestName,
          message: editReactionMessage,
          flower_type:
            editingReaction.reaction_type === "flower"
              ? editReactionFlowerType
              : "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not update your post.");
        return;
      }

      alert(data.message || "Your post was updated.");
      closeEditReactionModal();
      await loadReactions();
    } catch {
      alert("Could not update your post.");
    } finally {
      setSavingReactionEdit(false);
    }
  };

  const submitReaction = async (type: "candle" | "flower") => {
    if (!tributeName.trim()) {
      alert("Please enter your name");
      return;
    }

    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        reaction_type: type,
        guest_name: tributeName,
        message: tributeMessage,
        flower_type: type === "flower" ? flowerType : "",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setMessageName(tributeName);
    await loadReactions();

    setShowCandleModal(false);
    setShowFlowerModal(false);
    setTributeMessage("");

    alert(
      data.message ||
        (type === "flower"
          ? "Flowers sent. You can edit it for 2 minutes."
          : "Blessing left. You can edit it for 2 minutes.")
    );
  };

  const toggleMusic = () => {
    const audio = document.getElementById("memorial-music") as HTMLAudioElement;

    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {
          alert(`Please tap Play ${musicButtonText} again to start the audio.`);
        });
    }
  };

  const submitGuestbook = async () => {
    const formData = new FormData();

    formData.append("token", token);
    formData.append("guest_name", messageName);
    formData.append("message", message);

    if (image) formData.append("image", image);
    if (video) formData.append("video", video);
    if (audio) formData.append("audio", audio);

    const res = await fetch("/api/guestbook", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert(isLivingLegacy ? "Message posted ❤️" : "Guestbook message posted ❤️");

    setMessage("");
    setImage(null);
    setVideo(null);
    setAudio(null);

    await loadGuestbook();
  };

  const MemorialHeader = ({ simple = false }: { simple?: boolean }) => (
    <header className="fixed left-0 right-0 top-0 z-[9999] border-b border-[var(--sml-accent)] bg-[var(--sml-bg)] shadow-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a
          href={simple ? "/" : "#top"}
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--sml-accent)] bg-[var(--sml-card)] text-lg">
            {isLivingLegacy ? "✍️" : "🕯️"}
          </div>

          <div>
            <div className="font-serif text-lg font-bold leading-tight text-[var(--sml-text)] sm:text-xl">
              Scan<span className="text-[var(--sml-accent)]">My</span>Legacy
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--sml-accent)]">
              {pageTypeLabel}
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {publicNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[var(--sml-muted)] transition hover:text-[var(--sml-accent)]"
            >
              {item.label}
            </a>
          ))}

          {!simple &&
            navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => goToSection(item.section, item.href)}
                className="text-[var(--sml-muted)] transition hover:text-[var(--sml-accent)]"
              >
                {item.label}
              </button>
            ))}

          <button
            type="button"
            onClick={shareMemorial}
            className="rounded-full bg-[var(--sml-accent)] px-5 py-2 font-semibold text-black transition hover:opacity-90"
          >
            {simple ? "Share" : shareButtonLabel}
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-[var(--sml-accent)] px-4 py-2 text-2xl leading-none text-[var(--sml-accent)] lg:hidden"
          aria-label="Open memorial menu"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[var(--sml-accent)] bg-[var(--sml-card-soft)] px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {publicNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] px-4 py-3 text-sm font-semibold text-[var(--sml-muted)] transition hover:border-[var(--sml-accent)] hover:text-[var(--sml-accent)]"
              >
                {item.label}
              </a>
            ))}

            {simple ? (
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  document
                    .getElementById("enter-memorial-box")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-xl border border-[var(--sml-accent)] bg-[var(--sml-card)] px-4 py-3 text-left text-sm font-semibold text-[var(--sml-accent)] transition hover:border-[var(--sml-accent)]"
              >
                {enterButtonLabel}
              </button>
            ) : (
              navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => goToSection(item.section, item.href)}
                  className="rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] px-4 py-3 text-left text-sm font-semibold text-[var(--sml-muted)] transition hover:border-[var(--sml-accent)] hover:text-[var(--sml-accent)]"
                >
                  {item.label}
                </button>
              ))
            )}

            <button
              type="button"
              onClick={() => {
                closeMenu();
                shareMemorial();
              }}
              className="mt-2 rounded-xl bg-[var(--sml-accent)] px-4 py-3 text-sm font-semibold text-black"
            >
              {shareButtonLabel}
            </button>
          </div>
        </div>
      )}
    </header>
  );

  const renderFeatureCards = () => (
    <section
      id="legacy-sections"
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      <div className="mb-5 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[var(--sml-accent)]">
          Explore This Legacy
        </p>

        <h2 className="font-serif text-3xl text-[var(--sml-text)]">
          Choose What You Want To View
        </h2>

        <p className="mx-auto mt-2 max-w-2xl text-sm text-[var(--sml-muted)]">
          Tap a card below to open that section without making the page too
          long.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
        {featureCards.map((card) => {
          const isActive = activeSection === card.key;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setActiveSection(card.key)}
              className={`rounded-2xl border p-4 text-center shadow-xl transition hover:-translate-y-1 ${
                isActive
                  ? "border-[var(--sml-accent)] bg-[var(--sml-accent)] text-black"
                  : "border-[var(--sml-accent)] bg-[var(--sml-card)] text-[var(--sml-text)] hover:border-[var(--sml-accent)]"
              }`}
            >
              <div className="mb-2 text-3xl">{card.icon}</div>

              <h3
                className={`font-serif text-lg ${
                  isActive ? "text-black" : "text-[var(--sml-accent)]"
                }`}
              >
                {card.title}
              </h3>

              <p
                className={`mt-2 text-xs leading-relaxed ${
                  isActive ? "text-black/75" : "text-[var(--sml-muted)]"
                }`}
              >
                {card.text}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );

  if (!allowed) {
    return (
      <main className="min-h-screen bg-[var(--sml-bg)] text-[var(--sml-text)]" style={themeStyle}>
        <MemorialHeader simple />

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 pt-28">
          {memorial.cover_photo && (
            <img
              src={safeMediaPath(memorial.cover_photo)}
              alt={memorial.full_name}
              className="absolute inset-0 h-full w-full object-cover object-[center_20%] opacity-35"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          <div className="absolute inset-0" style={{ background: "var(--sml-hero-overlay)" }} />

          <div
            id="enter-memorial-box"
            className="relative z-10 w-full max-w-xl rounded-3xl border border-[var(--sml-accent)] bg-[var(--sml-card)]/95 p-6 text-center shadow-2xl backdrop-blur sm:p-8"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--sml-accent)] bg-[var(--sml-bg)] text-3xl">
              {isLivingLegacy ? "✍️" : "🕯️"}
            </div>

            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[var(--sml-accent)]">
              {entryHeading}
            </p>

            <h1 className="mb-3 font-serif text-3xl text-[var(--sml-text)] sm:text-4xl">
              {memorial.full_name}
            </h1>

            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-[var(--sml-muted)]">
              {entryDescription}
            </p>

            <div className="mb-6 rounded-2xl border border-[var(--sml-border)] bg-[var(--sml-bg)] p-4 text-left">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                Your Name
              </label>

              <input
                className="mb-3 w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
                placeholder="Enter your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />

              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                Email Address Optional
              </label>

              <input
                className="w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
                placeholder="Email Address (optional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>

            <button
              onClick={enterMemorial}
              className="w-full rounded-xl bg-[var(--sml-accent)] py-4 font-semibold text-black transition hover:opacity-90"
            >
              {enterButtonLabel}
            </button>

            <p className="mt-4 text-xs text-[var(--sml-muted)]">
              Private {pageTypeFullLabel} powered by ScanMyLegacy.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--sml-bg)] text-[var(--sml-text)]" style={themeStyle}>
      <MemorialHeader />

      {showEditReactionModal && editingReaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-card)] p-6 shadow-2xl">
            <div className="mb-4 text-center text-5xl">
              {editingReaction.reaction_type === "flower"
                ? flowerOptions[editReactionFlowerType] || "🌸"
                : isLivingLegacy
                ? "❤️"
                : "🕯️"}
            </div>

            <h2 className="mb-2 text-center font-serif text-2xl text-[var(--sml-accent)]">
              Edit Your{" "}
              {editingReaction.reaction_type === "flower"
                ? isLivingLegacy
                  ? "Flower"
                  : "Flower"
                : isLivingLegacy
                ? "Blessing"
                : "Candle"}
            </h2>

            <p className="mb-4 text-center text-xs text-[var(--sml-muted)]">
              You can only edit this for a short time after posting.
            </p>

            {editingReaction.reaction_type === "flower" && (
              <select
                className="mb-3 w-full rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3"
                value={editReactionFlowerType}
                onChange={(e) => setEditReactionFlowerType(e.target.value)}
              >
                <option value="rose">Rose</option>
                <option value="tulip">Tulip</option>
                <option value="sunflower">Sunflower</option>
                <option value="lily">Lily</option>
                <option value="hibiscus">Hibiscus</option>
                <option value="orchid">Orchid</option>
              </select>
            )}

            <textarea
              className="mb-4 min-h-[120px] w-full rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3"
              placeholder="Edit your message..."
              value={editReactionMessage}
              onChange={(e) => setEditReactionMessage(e.target.value)}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={submitReactionEdit}
                disabled={savingReactionEdit}
                className="flex-1 rounded bg-[var(--sml-accent)] py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingReactionEdit ? "Saving..." : "Save Edit"}
              </button>

              <button
                onClick={closeEditReactionModal}
                className="flex-1 rounded border border-gray-500 py-3 text-[var(--sml-muted)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCandleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-card)] p-6 shadow-2xl">
            <div className="mb-4 text-center text-5xl">
              {isLivingLegacy ? "❤️" : "🕯️"}
            </div>

            <h2 className="mb-4 text-center font-serif text-2xl text-[var(--sml-accent)]">
              {candleModalTitle}
            </h2>

            <input
              className="mb-3 w-full rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3"
              placeholder="Your Name"
              value={tributeName}
              onChange={(e) => setTributeName(e.target.value)}
            />

            <textarea
              className="mb-4 min-h-[100px] w-full rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3"
              placeholder={
                isLivingLegacy
                  ? "Leave a blessing, words of love, or encouragement..."
                  : "Leave a short message..."
              }
              value={tributeMessage}
              onChange={(e) => setTributeMessage(e.target.value)}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => submitReaction("candle")}
                className="flex-1 rounded bg-[var(--sml-accent)] py-3 font-semibold text-black"
              >
                {candleSubmitLabel}
              </button>

              <button
                onClick={() => setShowCandleModal(false)}
                className="flex-1 rounded border border-gray-500 py-3 text-[var(--sml-muted)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlowerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-card)] p-6 shadow-2xl">
            <div className="mb-4 text-center text-5xl">
              {flowerOptions[flowerType]}
            </div>

            <h2 className="mb-4 text-center font-serif text-2xl text-[var(--sml-accent)]">
              {flowerActionLabel}
            </h2>

            <input
              className="mb-3 w-full rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3"
              placeholder="Your Name"
              value={tributeName}
              onChange={(e) => setTributeName(e.target.value)}
            />

            <select
              className="mb-3 w-full rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3"
              value={flowerType}
              onChange={(e) => setFlowerType(e.target.value)}
            >
              <option value="rose">Rose</option>
              <option value="tulip">Tulip</option>
              <option value="sunflower">Sunflower</option>
              <option value="lily">Lily</option>
              <option value="hibiscus">Hibiscus</option>
              <option value="orchid">Orchid</option>
            </select>

            <textarea
              className="mb-4 min-h-[100px] w-full rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3"
              placeholder={
                isLivingLegacy
                  ? "Send flowers with a short message..."
                  : "Leave a short message..."
              }
              value={tributeMessage}
              onChange={(e) => setTributeMessage(e.target.value)}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => submitReaction("flower")}
                className="flex-1 rounded bg-[var(--sml-accent)] py-3 font-semibold text-black"
              >
                {flowerSubmitLabel}
              </button>

              <button
                onClick={() => setShowFlowerModal(false)}
                className="flex-1 rounded border border-gray-500 py-3 text-[var(--sml-muted)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section
        id="top"
        className="relative flex min-h-[75vh] items-center justify-center overflow-hidden pt-20 text-center"
      >
        {memorial.cover_photo && (
          <img
            src={safeMediaPath(memorial.cover_photo)}
            alt={memorial.full_name}
            className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        <div className="absolute inset-0" style={{ background: "var(--sml-hero-overlay)" }} />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <div className="mx-auto mb-6 w-fit rounded-full border border-[var(--sml-accent)] bg-black/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--sml-accent)] backdrop-blur">
            {pageTypeFullLabel}
          </div>

          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[var(--sml-accent)]">
            {pageTitlePrefix}
          </p>

          <h1 className="mb-5 font-serif text-4xl sm:text-5xl md:text-7xl">
            {memorial.full_name}
          </h1>

          <p className="mx-auto mb-5 max-w-2xl text-base leading-relaxed text-[var(--sml-muted)] sm:text-lg">
            {heroSubText}
          </p>

          <p className="mb-8 text-lg text-[var(--sml-muted)]">
            {memorial.birth_date
              ? new Date(memorial.birth_date).toLocaleDateString()
              : ""}
            {isLivingLegacy
              ? memorial.death_date
                ? ` — ${new Date(memorial.death_date).toLocaleDateString()}`
                : " — Living Legacy"
              : ` — ${
                  memorial.death_date
                    ? new Date(memorial.death_date).toLocaleDateString()
                    : ""
                }`}
          </p>

          <div className="mx-auto mb-8 h-px max-w-md bg-[var(--sml-accent)]/40" />

          <button
            onClick={shareMemorial}
            className="rounded-xl border border-[var(--sml-accent)] bg-black/30 px-6 py-3 text-sm font-semibold text-[var(--sml-accent)] backdrop-blur transition hover:bg-[var(--sml-accent)] hover:text-black"
          >
            {shareButtonLabel}
          </button>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <div className="rounded-full border border-[var(--sml-accent)] bg-black/30 px-4 py-2 text-sm text-[var(--sml-muted)] backdrop-blur">
              👁 {visitorCount} Visitors
            </div>

            <div className="rounded-full border border-[var(--sml-accent)] bg-black/30 px-4 py-2 text-sm text-[var(--sml-muted)] backdrop-blur">
              💬 Family Chat Active
            </div>
          </div>
        </div>
      </section>

      {galleryPhotos.length > 0 && (
        <section
          id="slideshow"
          className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
        >
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[var(--sml-accent)]">
              Treasured Moments
            </p>

            <h2 className="font-serif text-3xl md:text-4xl">
              {slideshowTitle}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--sml-muted)]">
              {slideshowDescription}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[var(--sml-accent)] bg-[var(--sml-card)] shadow-2xl">
            <div className="relative aspect-[16/9] overflow-hidden bg-black">
              <img
                key={activePhoto}
                src={galleryPhotos[activePhoto]}
                alt={slideshowTitle}
                className="block h-full w-full object-contain memorial-cinematic"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

              {galleryPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhoto(
                        activePhoto === 0
                          ? galleryPhotos.length - 1
                          : activePhoto - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-[var(--sml-accent)] bg-black/50 px-4 py-3 text-2xl text-[var(--sml-text)] backdrop-blur transition hover:bg-[var(--sml-accent)] hover:text-black"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePhoto(
                        activePhoto === galleryPhotos.length - 1
                          ? 0
                          : activePhoto + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-[var(--sml-accent)] bg-black/50 px-4 py-3 text-2xl text-[var(--sml-text)] backdrop-blur transition hover:bg-[var(--sml-accent)] hover:text-black"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-[var(--sml-muted)]">
                    {activePhoto + 1} / {galleryPhotos.length}
                  </div>
                </>
              )}
            </div>

            <audio id="memorial-music" loop>
              <source
                src={
                  memorial.memorial_music
                    ? safeMediaPath(memorial.memorial_music)
                    : "/music/memorial.mp3"
                }
                type="audio/mpeg"
              />
            </audio>

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--sml-accent)] bg-[var(--sml-card-soft)]/90 px-4 py-5">
              <button
                type="button"
                onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                className="rounded-full border border-[var(--sml-accent)] px-5 py-2 text-sm text-[var(--sml-accent)] transition hover:bg-[var(--sml-accent)] hover:text-black"
              >
                {isSlideshowPlaying ? "Pause Slideshow" : "Play Slideshow"}
              </button>

              <button
                type="button"
                onClick={toggleMusic}
                className="rounded-full border border-[var(--sml-accent)] px-5 py-2 text-sm text-[var(--sml-accent)] transition hover:bg-[var(--sml-accent)] hover:text-black"
              >
                {isMusicPlaying ? "Pause Music" : `Play ${musicButtonText}`}
              </button>
            </div>

            {galleryPhotos.length > 1 && (
              <div className="grid grid-cols-3 gap-3 border-t border-[var(--sml-accent)] bg-[var(--sml-card-soft)]/80 p-4 sm:grid-cols-4 sm:gap-3 sm:p-5 md:grid-cols-6">
                {galleryPhotos.map((photo: string, index: number) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActivePhoto(index)}
                    className={`overflow-hidden rounded-xl border transition ${
                      activePhoto === index
                        ? "scale-105 border-[var(--sml-accent)]"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={safeMediaPath(photo)}
                      alt={`Slideshow thumbnail ${index + 1}`}
                      className="h-16 w-full object-cover sm:h-20 md:h-24"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {renderFeatureCards()}

      {showSupportFund && (
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-[var(--sml-accent)] bg-gradient-to-br from-[var(--sml-card)] via-[var(--sml-bg)] to-[var(--sml-card-soft)] shadow-2xl">
            <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="flex items-center justify-center bg-[var(--sml-accent)]/10 p-8 text-center">
                <div>
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--sml-accent)] bg-[var(--sml-bg)] text-4xl shadow-[0_0_30px_rgba(212,175,55,0.25)]">
                    💛
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--sml-accent)]">
                    Private Family Support
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h2 className="font-serif text-3xl text-[var(--sml-accent)]">
                  {supportFundTitle}
                </h2>

                <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-[var(--sml-muted)] sm:text-base">
                  {supportFundPurpose}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={supportFundUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[var(--sml-accent)] px-7 py-3 text-sm font-semibold text-black shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
                  >
                    {supportFundButtonText}
                  </a>
                </div>

                <div className="mt-5 rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-bg)] p-4">
                  <p className="text-xs leading-relaxed text-[var(--sml-muted)]">
                    ScanMyLegacy does not collect, hold, manage, verify, or
                    distribute these funds. This support link is provided by the
                    page owner or family and opens an external donation platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === "story" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[var(--sml-accent)]">
              {isLivingLegacy ? "Personal Story" : "Legacy Story"}
            </p>

            <h2 className="mb-4 font-serif text-2xl text-[var(--sml-accent)]">
              {lifeStoryTitle}
            </h2>

            <p className="leading-relaxed text-[var(--sml-muted)]">
              {memorial.biography || storyEmptyText}
            </p>
          </div>
        </section>
      )}

      {activeSection === "legacy-vault" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-6">
            <div className="mb-6 text-center">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[var(--sml-accent)]">
                Owner Stories
              </p>

              <h2 className="font-serif text-3xl text-[var(--sml-accent)]">
                {legacyVaultTitle}
              </h2>

              <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-[var(--sml-muted)]">
                {legacyVaultDescription}
              </p>
            </div>

            {loadingLegacyVault ? (
              <p className="rounded-xl border border-dashed border-[var(--sml-accent)] bg-[var(--sml-bg)] p-6 text-center text-[var(--sml-muted)]">
                Loading {legacyVaultTitle}...
              </p>
            ) : legacyVaultEntries.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--sml-accent)] bg-[var(--sml-bg)] p-6 text-center text-[var(--sml-muted)]">
                {legacyVaultEmptyText}
              </p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {legacyVaultEntries.map((entry: any) => (
                  <article
                    key={entry.id}
                    className="overflow-hidden rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-bg)] shadow-xl"
                  >
                    {entry.image_url && (
                      <img
                        src={safeMediaPath(entry.image_url)}
                        alt={entry.title}
                        className="max-h-[360px] w-full bg-black object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    <div className="p-5">
                      {entry.category && (
                        <div className="mb-3 w-fit rounded-full border border-[var(--sml-accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                          {entry.category}
                        </div>
                      )}

                      <h3 className="font-serif text-2xl text-[var(--sml-text)]">
                        {entry.title}
                      </h3>

                      {entry.story && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--sml-muted)]">
                          {entry.story}
                        </p>
                      )}

                      {entry.video_url && (
                        <video controls className="mt-4 w-full rounded-xl">
                          <source src={safeMediaPath(entry.video_url)} />
                        </video>
                      )}

                      {entry.audio_url && (
                        <div className="mt-4 rounded-xl border border-[var(--sml-accent)] bg-[var(--sml-card)] p-3">
                          <p className="mb-2 text-xs font-semibold text-[var(--sml-accent)]">
                            🎙️ Voice Message / Audio
                          </p>

                          <audio controls className="w-full">
                            <source src={safeMediaPath(entry.audio_url)} />
                          </audio>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === "private-messages" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-card)] p-6 shadow-2xl">
            <div className="mb-6 text-center">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[var(--sml-accent)]">
                Private Recipient Access
              </p>

              <h2 className="font-serif text-3xl text-[var(--sml-accent)]">
                Private Messages
              </h2>

              <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-[var(--sml-muted)]">
                Some messages are personal and can only be opened by the person
                they were created for. Enter the recipient details and private
                access code provided by the page owner or family.
              </p>
            </div>

            <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-bg)] p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                    Recipient Name
                  </label>

                  <input
                    className="w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
                    placeholder="Example: Joshua Balfour"
                    value={privateRecipientName}
                    onChange={(e) => setPrivateRecipientName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                    Email or Phone Optional
                  </label>

                  <input
                    className="w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
                    placeholder="Email or phone used by the owner"
                    value={privateRecipientContact}
                    onChange={(e) => setPrivateRecipientContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                  Private Access Code
                </label>

                <input
                  className="w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
                  placeholder="Enter private access code"
                  value={privateAccessCode}
                  onChange={(e) => setPrivateAccessCode(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={unlockPrivateVault}
                disabled={unlockingPrivateVault}
                className="mt-5 w-full rounded-xl bg-[var(--sml-accent)] py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {unlockingPrivateVault ? "Checking..." : "Unlock Private Message"}
              </button>

              {privateUnlockMessage && (
                <p className="mt-4 rounded-xl border border-[var(--sml-accent)] bg-[var(--sml-card)] p-3 text-center text-sm text-[var(--sml-muted)]">
                  {privateUnlockMessage}
                </p>
              )}
            </div>

            {privateVaultEntries.length > 0 && (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {privateVaultEntries.map((entry: any) => (
                  <article
                    key={entry.id}
                    className="overflow-hidden rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-bg)] shadow-xl"
                  >
                    {entry.image_url && (
                      <img
                        src={safeMediaPath(entry.image_url)}
                        alt={entry.title}
                        className="max-h-[360px] w-full bg-black object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    <div className="p-5">
                      {entry.category && (
                        <div className="mb-3 w-fit rounded-full border border-[var(--sml-accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                          {entry.category}
                        </div>
                      )}

                      <h3 className="font-serif text-2xl text-[var(--sml-text)]">
                        {entry.title}
                      </h3>

                      {entry.story && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--sml-muted)]">
                          {entry.story}
                        </p>
                      )}

                      {entry.video_url && (
                        <video controls className="mt-4 w-full rounded-xl">
                          <source src={safeMediaPath(entry.video_url)} />
                        </video>
                      )}

                      {entry.audio_url && (
                        <div className="mt-4 rounded-xl border border-[var(--sml-accent)] bg-[var(--sml-card)] p-3">
                          <p className="mb-2 text-xs font-semibold text-[var(--sml-accent)]">
                            🎙️ Private Voice Message / Audio
                          </p>

                          <audio controls className="w-full">
                            <source src={safeMediaPath(entry.audio_url)} />
                          </audio>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-bg)] p-4">
              <p className="text-xs leading-relaxed text-[var(--sml-muted)]">
                Private messages are controlled by the page owner or family.
                ScanMyLegacy does not verify family relationships or legal
                instructions. This area is for personal legacy messages,
                memories, guidance, and emotional keepsakes.
              </p>
            </div>
          </div>
        </section>
      )}

      {activeSection === "trusted-contact" && showTrustedContactRequest && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-card)] p-6 shadow-2xl">
            <div className="mb-6 text-center">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[var(--sml-accent)]">
                Release Manager
              </p>

              <h2 className="font-serif text-3xl text-[var(--sml-accent)]">
                Trusted Contact Request
              </h2>

              <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-[var(--sml-muted)]">
                This area is for the trusted contact chosen by the page owner.
                A request can be submitted for admin review, but nothing is
                converted, released, or transferred automatically.
              </p>
            </div>

            <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-bg)] p-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                Request Type
              </label>

              <select
                value={trustedRequestType}
                onChange={(e) => setTrustedRequestType(e.target.value)}
                className="mb-4 w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
              >
                <option value="convert_to_memorial">
                  Convert Living Legacy To Memorial
                </option>
                <option value="release_after_passing">
                  Release After Passing Messages
                </option>
                <option value="ownership_transfer">
                  Request Ownership Transfer
                </option>
                <option value="general_release_request">
                  General Family Release Request
                </option>
              </select>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                    Trusted Contact Name
                  </label>

                  <input
                    className="w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
                    placeholder="Enter your name"
                    value={trustedContactName}
                    onChange={(e) => setTrustedContactName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                    Access Code Optional
                  </label>

                  <input
                    className="w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
                    placeholder="Access code if provided"
                    value={trustedAccessCode}
                    onChange={(e) => setTrustedAccessCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                    Email Address
                  </label>

                  <input
                    className="w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
                    placeholder="Email saved by the owner"
                    value={trustedContactEmail}
                    onChange={(e) => setTrustedContactEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                    Phone Number
                  </label>

                  <input
                    className="w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
                    placeholder="Phone saved by the owner"
                    value={trustedContactPhone}
                    onChange={(e) => setTrustedContactPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sml-accent)]">
                  Request Note
                </label>

                <textarea
                  rows={5}
                  className="w-full rounded-xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-3 text-[var(--sml-text)] outline-none transition focus:border-[var(--sml-accent)]"
                  placeholder="Explain the reason for this request..."
                  value={trustedRequestNote}
                  onChange={(e) => setTrustedRequestNote(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={submitTrustedContactRequest}
                disabled={submittingTrustedRequest}
                className="mt-5 w-full rounded-xl bg-[var(--sml-accent)] py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingTrustedRequest
                  ? "Submitting Request..."
                  : "Submit Trusted Contact Request"}
              </button>

              {trustedRequestMessage && (
                <p className="mt-4 rounded-xl border border-[var(--sml-accent)] bg-[var(--sml-card)] p-3 text-center text-sm text-[var(--sml-muted)]">
                  {trustedRequestMessage}
                </p>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
              <p className="text-xs leading-relaxed text-yellow-100">
                ScanMyLegacy does not automatically release private messages,
                transfer ownership, or convert a page based only on this form.
                Every trusted contact request must be reviewed by admin first.
              </p>
            </div>
          </div>
        </section>
      )}

      {activeSection === "milestones" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-6">
            <div className="mb-8 text-center">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[var(--sml-accent)]">
                Life Timeline
              </p>

              <h2 className="font-serif text-3xl text-[var(--sml-accent)]">
                {milestonesTitle}
              </h2>

              <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-[var(--sml-muted)]">
                {milestonesDescription}
              </p>
            </div>

            {loadingMilestones ? (
              <p className="rounded-xl border border-dashed border-[var(--sml-accent)] bg-[var(--sml-bg)] p-6 text-center text-[var(--sml-muted)]">
                Loading milestones...
              </p>
            ) : milestones.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--sml-accent)] bg-[var(--sml-bg)] p-6 text-center text-[var(--sml-muted)]">
                {milestonesEmptyText}
              </p>
            ) : (
              <div className="relative mx-auto max-w-4xl">
                <div className="absolute bottom-0 left-4 top-0 hidden w-px bg-[var(--sml-accent)]/25 sm:block" />

                <div className="space-y-5">
                  {milestones.map((milestone: any) => (
                    <article
                      key={milestone.id}
                      className="relative rounded-2xl border border-[var(--sml-accent)] bg-[var(--sml-bg)] p-5 shadow-xl sm:ml-10"
                    >
                      <div className="absolute -left-[47px] top-6 hidden h-4 w-4 rounded-full border border-[var(--sml-accent)] bg-[var(--sml-accent)] shadow-[0_0_18px_rgba(212,175,55,0.45)] sm:block" />

                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {milestone.milestone_date && (
                          <span className="rounded-full border border-[var(--sml-accent)] px-3 py-1 text-xs font-semibold text-[var(--sml-accent)]">
                            {new Date(milestone.milestone_date).toLocaleDateString()}
                          </span>
                        )}

                        {milestone.category && (
                          <span className="rounded-full bg-[var(--sml-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--sml-accent)]">
                            {milestone.category}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-2xl text-[var(--sml-text)]">
                        {milestone.title}
                      </h3>

                      {milestone.description && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--sml-muted)]">
                          {milestone.description}
                        </p>
                      )}

                      {milestone.image_url && (
                        <img
                          src={safeMediaPath(milestone.image_url)}
                          alt={milestone.title}
                          className="mt-4 max-h-[420px] w-full rounded-xl bg-black object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === "blessings" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[var(--sml-accent)]">
                  {isLivingLegacy ? "Words of Love" : "Tributes"}
                </p>

                <h2 className="font-serif text-2xl text-[var(--sml-accent)]">
                  {candleRoomTitle}
                </h2>

                <p className="mt-2 text-sm text-[var(--sml-muted)]">
                  {candles} {candleCountText}
                </p>
              </div>

              <button
                onClick={openCandleModal}
                className="rounded-xl bg-[var(--sml-accent)] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f0c94a]"
              >
                {candleActionLabel}
              </button>
            </div>

            {candleReactions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--sml-accent)] bg-[var(--sml-bg)] p-6 text-center text-[var(--sml-muted)]">
                {candleEmptyText}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {candleReactions.map((reaction: any) => (
                  <div
                    key={reaction.id}
                    className="rounded-xl border border-[var(--sml-accent)] bg-[var(--sml-bg)] p-4 text-center"
                  >
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--sml-accent)]/10 shadow-[0_0_30px_rgba(212,175,55,0.35)]">
                      <span className="animate-pulse text-5xl">
                        {isLivingLegacy ? "❤️" : "🕯️"}
                      </span>
                    </div>

                    <p className="font-semibold text-[var(--sml-text)]">
                      {reaction.guest_name}
                    </p>

                    {reaction.message && (
                      <p className="mt-3 text-sm italic text-[var(--sml-muted)]">
                        “{reaction.message}”
                      </p>
                    )}

                    {canGuestEditReaction(reaction) && (
                      <button
                        type="button"
                        onClick={() => openEditReactionModal(reaction)}
                        className="mt-4 rounded-full border border-[var(--sml-accent)] px-4 py-2 text-xs font-semibold text-[var(--sml-accent)] transition hover:bg-[var(--sml-accent)] hover:text-black"
                      >
                        Edit{" "}
                        {reaction.guest_edit_seconds_left
                          ? `(${reaction.guest_edit_seconds_left}s left)`
                          : ""}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === "flowers" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[var(--sml-accent)]">
                  Flower Garden
                </p>

                <h2 className="font-serif text-2xl text-[var(--sml-accent)]">
                  {isLivingLegacy ? "Flowers Sent With Love" : "Flower Garden"}
                </h2>

                <p className="mt-2 text-sm text-[var(--sml-muted)]">
                  {flowers} {flowerCountText}
                </p>
              </div>

              <button
                onClick={openFlowerModal}
                className="rounded-xl bg-[var(--sml-accent)] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f0c94a]"
              >
                {flowerActionLabel}
              </button>
            </div>

            {flowerReactions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--sml-accent)] bg-[var(--sml-bg)] p-6 text-center text-[var(--sml-muted)]">
                {flowerEmptyText}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {flowerReactions.map((reaction: any) => {
                  const selectedFlower =
                    flowerOptions[reaction.flower_type] || "🌸";

                  return (
                    <div
                      key={reaction.id}
                      className="rounded-xl border border-[var(--sml-accent)] bg-[var(--sml-bg)] p-4 text-center"
                    >
                      <div className="mb-3 text-6xl">{selectedFlower}</div>

                      <div className="mx-auto mb-2 w-fit rounded-full border border-[var(--sml-accent)] px-3 py-1 text-xs text-[var(--sml-accent)]">
                        {flowerByLabel} {reaction.guest_name}
                      </div>

                      {reaction.message && (
                        <p className="mt-3 text-sm italic text-[var(--sml-muted)]">
                          “{reaction.message}”
                        </p>
                      )}

                      {canGuestEditReaction(reaction) && (
                        <button
                          type="button"
                          onClick={() => openEditReactionModal(reaction)}
                          className="mt-4 rounded-full border border-[var(--sml-accent)] px-4 py-2 text-xs font-semibold text-[var(--sml-accent)] transition hover:bg-[var(--sml-accent)] hover:text-black"
                        >
                          Edit{" "}
                          {reaction.guest_edit_seconds_left
                            ? `(${reaction.guest_edit_seconds_left}s left)`
                            : ""}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === "family-tree" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <FamilyTreeView token={token} />
        </section>
      )}

      {activeSection === "chat" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <ChatBox
            memorialId={memorial.id}
            guestName={messageName || guestName}
          />
        </section>
      )}

      {activeSection === "messages" && (
        <section className="mx-auto max-w-5xl px-4 py-8 pb-16 sm:px-6">
          <div className="mb-6 rounded-2xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-6">
            <h2 className="mb-4 font-serif text-2xl text-[var(--sml-accent)]">
              {guestbookTitle}
            </h2>

            <input
              className="mb-3 w-full rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3"
              placeholder="Your Name"
              value={messageName}
              onChange={(e) => setMessageName(e.target.value)}
            />

            <textarea
              className="mb-3 min-h-[100px] w-full rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3"
              placeholder={guestbookPlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <label className="rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3 text-sm text-[var(--sml-muted)]">
                Photo
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full text-xs"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>

              <label className="rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3 text-sm text-[var(--sml-muted)]">
                Video
                <input
                  type="file"
                  accept="video/*"
                  className="mt-2 w-full text-xs"
                  onChange={(e) => setVideo(e.target.files?.[0] || null)}
                />
              </label>

              <label className="rounded border border-[var(--sml-border)] bg-[var(--sml-bg)] p-3 text-sm text-[var(--sml-muted)]">
                Audio
                <input
                  type="file"
                  accept="audio/*"
                  className="mt-2 w-full text-xs"
                  onChange={(e) => setAudio(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button
              onClick={submitGuestbook}
              className="w-full rounded bg-[var(--sml-accent)] py-3 font-semibold text-black"
            >
              {isLivingLegacy ? "Post Family / Guest Message" : "Post to Guestbook"}
            </button>
          </div>

          <div className="space-y-4">
            {entries.length === 0 ? (
              <p className="text-center text-[var(--sml-muted)]">{noGuestbookText}</p>
            ) : (
              entries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-[var(--sml-border)] bg-[var(--sml-card)] p-5"
                >
                  <h3 className="font-semibold text-[var(--sml-text)]">
                    {entry.guest_name}
                  </h3>

                  <p className="mt-2 text-[var(--sml-muted)]">{entry.message}</p>

                  {entry.image_url && (
                    <img
                      src={safeMediaPath(entry.image_url)}
                      alt="Guestbook image"
                      className="mt-4 max-h-[520px] w-full rounded-xl bg-white object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  {entry.video_url && (
                    <video controls className="mt-4 w-full rounded-xl">
                      <source src={safeMediaPath(entry.video_url)} />
                    </video>
                  )}

                  {entry.audio_url && (
                    <audio controls className="mt-4 w-full">
                      <source src={safeMediaPath(entry.audio_url)} />
                    </audio>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}