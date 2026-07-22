"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ManageMemorialPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [memorial, setMemorial] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [reactions, setReactions] = useState<any[]>([]);
  const [familyMessages, setFamilyMessages] = useState<any[]>([]);
  const [loadingFamilyMessages, setLoadingFamilyMessages] = useState(false);
  const [legacyVaultEntries, setLegacyVaultEntries] = useState<any[]>([]);
  const [loadingLegacyVault, setLoadingLegacyVault] = useState(false);
  const [savingLegacyVault, setSavingLegacyVault] = useState(false);
  const [editingVaultEntry, setEditingVaultEntry] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);

  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDate, setMilestoneDate] = useState("");
  const [milestoneCategory, setMilestoneCategory] = useState("Life Event");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [milestoneSortOrder, setMilestoneSortOrder] = useState("0");
  const [milestoneIsVisible, setMilestoneIsVisible] = useState(true);
  const [milestoneImage, setMilestoneImage] = useState<File | null>(null);

  const [vaultTitle, setVaultTitle] = useState("");
  const [vaultCategory, setVaultCategory] = useState("Special Memories");
  const [vaultStory, setVaultStory] = useState("");
  const [vaultSortOrder, setVaultSortOrder] = useState("0");
  const [vaultIsVisible, setVaultIsVisible] = useState(true);
  const [vaultVisibilityType, setVaultVisibilityType] = useState("public");
  const [vaultReleaseDate, setVaultReleaseDate] = useState("");
  const [vaultRecipientName, setVaultRecipientName] = useState("");
  const [vaultRecipientContact, setVaultRecipientContact] = useState("");
  const [vaultRecipientAccessCode, setVaultRecipientAccessCode] = useState("");
  const [vaultImage, setVaultImage] = useState<File | null>(null);
  const [vaultVideo, setVaultVideo] = useState<File | null>(null);
  const [vaultAudio, setVaultAudio] = useState<File | null>(null);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");

  const [supportFundEnabled, setSupportFundEnabled] = useState(false);
  const [supportFundTitle, setSupportFundTitle] = useState("");
  const [supportFundPurpose, setSupportFundPurpose] = useState("");
  const [supportFundButtonText, setSupportFundButtonText] = useState("Support The Family");
  const [supportFundUrl, setSupportFundUrl] = useState("");

  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [memorialMusic, setMemorialMusic] = useState<File | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);

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

  const loadChatMessages = async (memorialIdToLoad: string) => {
    try {
      setLoadingChat(true);

      const res = await fetch(
        `/api/memorial-chat?memorial_id=${memorialIdToLoad}`
      );

      const data = await res.json();

      if (res.ok) {
        setChatMessages(data.messages || []);
      }
    } catch {
      setChatMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const loadFamilyMessages = async (inviteTokenToLoad: string) => {
    if (!inviteTokenToLoad) {
      setFamilyMessages([]);
      return;
    }

    try {
      setLoadingFamilyMessages(true);

      const res = await fetch(`/api/guestbook?token=${inviteTokenToLoad}`);
      const data = await res.json();

      if (res.ok) {
        setFamilyMessages(data.entries || []);
      } else {
        setFamilyMessages([]);
      }
    } catch {
      setFamilyMessages([]);
    } finally {
      setLoadingFamilyMessages(false);
    }
  };

  const loadLegacyVault = async (memorialIdToLoad: string) => {
    if (!memorialIdToLoad) {
      setLegacyVaultEntries([]);
      return;
    }

    try {
      setLoadingLegacyVault(true);

      const res = await fetch(
        `/api/legacy-vault?owner=1&memorial_id=${memorialIdToLoad}`
      );

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

  const loadMilestones = async (memorialIdToLoad: string) => {
    if (!memorialIdToLoad) {
      setMilestones([]);
      return;
    }

    try {
      setLoadingMilestones(true);

      const res = await fetch(
        `/api/milestones?owner=1&memorial_id=${memorialIdToLoad}`
      );

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

  const loadMemorial = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/dashboard/memorial/${id}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Unable to load page.");
        window.location.href = "/dashboard";
        return;
      }

      setMemorial(data.memorial);
      setGallery(data.gallery || []);
      setReactions(data.reactions || []);

      setFullName(data.memorial.full_name || "");
      setBirthDate(
        data.memorial.birth_date ? data.memorial.birth_date.slice(0, 10) : ""
      );
      setDeathDate(
        data.memorial.death_date ? data.memorial.death_date.slice(0, 10) : ""
      );
      setBiography(data.memorial.biography || "");
      setSupportFundEnabled(Number(data.memorial.support_fund_enabled) === 1);
      setSupportFundTitle(data.memorial.support_fund_title || "");
      setSupportFundPurpose(data.memorial.support_fund_purpose || "");
      setSupportFundButtonText(
        data.memorial.support_fund_button_text || "Support The Family"
      );
      setSupportFundUrl(data.memorial.support_fund_url || "");

      await loadChatMessages(String(data.memorial.id));
      await loadFamilyMessages(String(data.memorial.invite_token || ""));
      await loadLegacyVault(String(data.memorial.id));
      await loadMilestones(String(data.memorial.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadMemorial();
  }, [id]);

  const pageType = memorial?.page_type === "living" ? "living" : "memorial";
  const isLivingLegacy = pageType === "living";

  const pageName = isLivingLegacy ? "Living Legacy" : "Memorial";
  const pageNameLower = isLivingLegacy ? "living legacy page" : "memorial";
  const manageTitle = isLivingLegacy
    ? "Manage Living Legacy"
    : "Manage Memorial";
  const loadingText = isLivingLegacy
    ? "Loading legacy editor..."
    : "Loading memorial editor...";
  const notFoundText = isLivingLegacy
    ? "Living Legacy page not found."
    : "Memorial not found.";
  const detailsTitle = isLivingLegacy ? "Legacy Details" : "Memorial Details";
  const namePlaceholder = isLivingLegacy
    ? "Full Name"
    : "Loved One’s Full Name";
  const biographyPlaceholder = isLivingLegacy
    ? "My Story / Life Journey"
    : "Biography / Life Story";
  const coverPhotoLabel = isLivingLegacy
    ? "Change Legacy Cover Photo"
    : "Change Cover Photo";
  const musicLabel = isLivingLegacy
    ? "Change Legacy Song / Voice Note"
    : "Change Memorial Song";
  const saveButtonLabel = isLivingLegacy
    ? "Save Legacy Updates"
    : "Save Memorial Updates";
  const successMessage = isLivingLegacy
    ? "Living Legacy updated successfully."
    : "Memorial updated successfully.";
  const viewButtonLabel = isLivingLegacy
    ? "View Legacy Page"
    : "View Memorial";
  const linkLabel = isLivingLegacy ? "Legacy Link" : "Memorial Link";
  const galleryTitle = isLivingLegacy
    ? "Legacy Gallery Manager"
    : "Gallery Manager";
  const noGalleryText = isLivingLegacy
    ? "No legacy photos uploaded yet."
    : "No gallery photos uploaded yet.";
  const paymentExpiredText = isLivingLegacy
    ? "This living legacy page was temporarily active while bank transfer payment was being reviewed. Payment was not verified within 48 hours, so editing is now temporarily disabled until payment is confirmed by admin."
    : "This memorial was temporarily active while bank transfer payment was being reviewed. Payment was not verified within 48 hours, so editing is now temporarily disabled until payment is confirmed by admin.";
  const bankReviewText = isLivingLegacy
    ? "Your living legacy page is temporarily active while your bank transfer is being reviewed. You can view and manage this page during this review period."
    : "Your memorial is temporarily active while your bank transfer is being reviewed. You can view and manage this memorial during this review period.";

  const reactionsTitle = isLivingLegacy
    ? "Blessings & Flowers Manager"
    : "Candles & Flowers Manager";

  const noReactionsText = isLivingLegacy
    ? "No blessings or flowers have been posted yet."
    : "No candles or flowers have been posted yet.";

  const familyMessagesTitle = isLivingLegacy
    ? "Family Messages Manager"
    : "Guestbook Manager";

  const noFamilyMessagesText = isLivingLegacy
    ? "No family messages have been posted yet."
    : "No guestbook messages have been posted yet.";

  const flowerOptions: any = {
    rose: "🌹",
    tulip: "🌷",
    sunflower: "🌻",
    lily: "🌸",
    hibiscus: "🌺",
    orchid: "💮",
  };

  const legacyVaultCategories = [
    "Childhood",
    "Family History",
    "Life Lessons",
    "Recipes",
    "Advice",
    "Special Memories",
    "Family Secrets",
    "Future Messages",
    "Final Wishes",
    "Other",
  ];

  const legacyVaultVisibilityOptions = [
    {
      value: "public",
      label: "Public Now",
      description: "Visible to everyone who enters this private legacy page.",
    },
    {
      value: "hidden",
      label: "Hidden From Public",
      description: "Only the page owner can see it in the dashboard.",
    },
    {
      value: "after_passing",
      label: "Release After Passing",
      description: "Shown after this Living Legacy is converted to a Memorial.",
    },
    {
      value: "release_date",
      label: "Release On A Special Date",
      description: "Shown on or after the selected release date.",
    },
    {
      value: "recipient_only",
      label: "Private Recipient Only",
      description: "Hidden from everyone except the selected recipient after unlock.",
    },
  ];

  const getVaultVisibilityLabel = (value: string) => {
    return (
      legacyVaultVisibilityOptions.find((option) => option.value === value)
        ?.label || "Public Now"
    );
  };

  const milestoneCategories = [
    "Life Event",
    "Childhood",
    "Education",
    "Graduation",
    "Career",
    "Marriage",
    "Children",
    "Travel",
    "Achievement",
    "Community Work",
    "Special Birthday",
    "Family Memory",
    "Other",
  ];

  const now = new Date();

  const paymentDueAt = memorial?.payment_due_at
    ? new Date(memorial.payment_due_at)
    : null;

  const isPendingBankTransfer =
    memorial?.payment_status === "pending_bank_transfer";

  const isExpiredBankTransfer =
    memorial?.payment_status === "expired_bank_transfer" ||
    (isPendingBankTransfer &&
      paymentDueAt &&
      now.getTime() > paymentDueAt.getTime());

  const bankTransferStillActive =
    isPendingBankTransfer &&
    paymentDueAt &&
    now.getTime() <= paymentDueAt.getTime();

  const hoursLeft =
    bankTransferStillActive && paymentDueAt
      ? Math.max(
          0,
          Math.ceil(
            (paymentDueAt.getTime() - now.getTime()) / (1000 * 60 * 60)
          )
        )
      : 0;

  const canManage = !isExpiredBankTransfer;

  const saveMemorial = async () => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    if (!fullName.trim()) {
      alert("Full name is required.");
      return;
    }

    if (supportFundEnabled) {
      if (!supportFundTitle.trim()) {
        alert("Please enter a title for the Family Support Fund.");
        return;
      }

      if (!supportFundUrl.trim()) {
        alert("Please enter the outside donation link for the Family Support Fund.");
        return;
      }

      if (
        !supportFundUrl.trim().startsWith("http://") &&
        !supportFundUrl.trim().startsWith("https://")
      ) {
        alert("The Family Support Fund link must start with http:// or https://");
        return;
      }
    }

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("birth_date", birthDate);
    formData.append("death_date", deathDate);
    formData.append("biography", biography);
    formData.append("support_fund_enabled", supportFundEnabled ? "1" : "0");
    formData.append("support_fund_title", supportFundTitle);
    formData.append("support_fund_purpose", supportFundPurpose);
    formData.append("support_fund_button_text", supportFundButtonText);
    formData.append("support_fund_url", supportFundUrl);

    if (coverPhoto) formData.append("cover_photo", coverPhoto);
    if (memorialMusic) formData.append("memorial_music", memorialMusic);

    galleryPhotos.forEach((photo) => {
      formData.append("gallery_photos", photo);
    });

    try {
      setSaving(true);

      const res = await fetch(`/api/dashboard/memorial/${id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || `Failed to update ${pageNameLower}.`);
        return;
      }

      alert(successMessage);
      setCoverPhoto(null);
      setMemorialMusic(null);
      setGalleryPhotos([]);
      await loadMemorial();
    } finally {
      setSaving(false);
    }
  };

  const deleteGalleryPhoto = async (galleryId: number) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const confirmed = confirm(`Remove this photo from the ${pageNameLower}?`);
    if (!confirmed) return;

    const res = await fetch(`/api/dashboard/memorial/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gallery_id: galleryId }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to remove photo.");
      return;
    }

    await loadMemorial();
  };

  const deleteChatMessage = async (messageId: number) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const confirmed = confirm(
      "Delete this chat message? This will remove it from the public family chat."
    );

    if (!confirmed) return;

    const res = await fetch("/api/memorial-chat", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_id: messageId,
        memorial_id: memorial.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete chat message.");
      return;
    }

    await loadChatMessages(String(memorial.id));
  };

  const editReaction = async (reaction: any) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const newMessage = prompt(
      "Edit the blessing / flower message:",
      reaction.message || ""
    );

    if (newMessage === null) return;

    let newFlowerType = reaction.flower_type || "rose";

    if (reaction.reaction_type === "flower") {
      const flowerPrompt = prompt(
        "Flower type: rose, tulip, sunflower, lily, hibiscus, or orchid",
        newFlowerType
      );

      if (flowerPrompt === null) return;

      newFlowerType = flowerPrompt.trim().toLowerCase() || "rose";
    }

    const res = await fetch(`/api/dashboard/memorial/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "edit_reaction",
        reaction_id: reaction.id,
        message: newMessage,
        flower_type: newFlowerType,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update blessing or flower.");
      return;
    }

    alert(data.message || "Blessing or flower updated.");
    await loadMemorial();
  };

  const deleteReaction = async (reaction: any) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const label =
      reaction.reaction_type === "flower"
        ? "flower"
        : isLivingLegacy
        ? "blessing"
        : "candle";

    const confirmed = confirm(
      `Delete this ${label}? This will remove it from the public page.`
    );

    if (!confirmed) return;

    const res = await fetch(`/api/dashboard/memorial/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reaction_id: reaction.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete blessing or flower.");
      return;
    }

    await loadMemorial();
  };

  const editFamilyMessage = async (entry: any) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const newMessage = prompt("Edit this family message:", entry.message || "");

    if (newMessage === null) return;

    if (!newMessage.trim()) {
      alert("Family message cannot be empty.");
      return;
    }

    const res = await fetch("/api/guestbook", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entry_id: entry.id,
        message: newMessage,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update family message.");
      return;
    }

    alert(data.message || "Family message updated.");
    await loadFamilyMessages(String(memorial.invite_token || ""));
  };

  const deleteFamilyMessage = async (entry: any) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const confirmed = confirm(
      "Delete this family message? This will remove the message and any attached photo, video, or audio from the public page."
    );

    if (!confirmed) return;

    const res = await fetch("/api/guestbook", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entry_id: entry.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete family message.");
      return;
    }

    await loadFamilyMessages(String(memorial.invite_token || ""));
  };

  const resetVaultForm = () => {
    setEditingVaultEntry(null);
    setVaultTitle("");
    setVaultCategory("Special Memories");
    setVaultStory("");
    setVaultSortOrder("0");
    setVaultIsVisible(true);
    setVaultVisibilityType("public");
    setVaultReleaseDate("");
    setVaultRecipientName("");
    setVaultRecipientContact("");
    setVaultRecipientAccessCode("");
    setVaultImage(null);
    setVaultVideo(null);
    setVaultAudio(null);
  };

  const startEditVaultEntry = (entry: any) => {
    setEditingVaultEntry(entry);
    setVaultTitle(entry.title || "");
    setVaultCategory(entry.category || "Special Memories");
    setVaultStory(entry.story || "");
    setVaultSortOrder(String(entry.sort_order || 0));
    setVaultIsVisible(Number(entry.is_visible) === 1);
    setVaultVisibilityType(entry.visibility_type || "public");
    setVaultReleaseDate(
      entry.release_date ? String(entry.release_date).slice(0, 10) : ""
    );
    setVaultRecipientName(entry.recipient_name || "");
    setVaultRecipientContact(entry.recipient_contact || "");
    setVaultRecipientAccessCode(entry.recipient_access_code || "");
    setVaultImage(null);
    setVaultVideo(null);
    setVaultAudio(null);

    setTimeout(() => {
      document
        .getElementById("legacy-vault-manager")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const saveLegacyVaultEntry = async () => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    if (!vaultTitle.trim()) {
      alert("Please enter a title for this Legacy Vault story.");
      return;
    }

    if (vaultVisibilityType === "release_date" && !vaultReleaseDate) {
      alert("Please choose the date this Legacy Vault story should be released.");
      return;
    }

    if (vaultVisibilityType === "recipient_only") {
      if (!vaultRecipientName.trim()) {
        alert("Please enter the private recipient's name.");
        return;
      }

      if (!vaultRecipientAccessCode.trim()) {
        alert("Please enter a private access code for this recipient.");
        return;
      }
    }

    const formData = new FormData();

    formData.append("memorial_id", String(memorial.id));
    formData.append("title", vaultTitle);
    formData.append("category", vaultCategory);
    formData.append("story", vaultStory);
    formData.append("sort_order", vaultSortOrder || "0");
    formData.append("is_visible", vaultIsVisible ? "1" : "0");
    formData.append("visibility_type", vaultVisibilityType);
    formData.append("release_date", vaultReleaseDate);
    formData.append("recipient_name", vaultRecipientName);
    formData.append("recipient_contact", vaultRecipientContact);
    formData.append("recipient_access_code", vaultRecipientAccessCode);

    if (editingVaultEntry?.id) {
      formData.append("entry_id", String(editingVaultEntry.id));
    }

    if (vaultImage) formData.append("image", vaultImage);
    if (vaultVideo) formData.append("video", vaultVideo);
    if (vaultAudio) formData.append("audio", vaultAudio);

    try {
      setSavingLegacyVault(true);

      const res = await fetch("/api/legacy-vault", {
        method: editingVaultEntry?.id ? "PATCH" : "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save Legacy Vault story.");
        return;
      }

      alert(data.message || "Legacy Vault story saved.");
      resetVaultForm();
      await loadLegacyVault(String(memorial.id));
    } finally {
      setSavingLegacyVault(false);
    }
  };

  const deleteVaultEntry = async (entry: any) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const confirmed = confirm(
      `Delete this Legacy Vault story: "${entry.title}"? This will remove it from the public page.`
    );

    if (!confirmed) return;

    const res = await fetch("/api/legacy-vault", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entry_id: entry.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete Legacy Vault story.");
      return;
    }

    await loadLegacyVault(String(memorial.id));
  };

  const resetMilestoneForm = () => {
    setEditingMilestone(null);
    setMilestoneTitle("");
    setMilestoneDate("");
    setMilestoneCategory("Life Event");
    setMilestoneDescription("");
    setMilestoneSortOrder("0");
    setMilestoneIsVisible(true);
    setMilestoneImage(null);
  };

  const startEditMilestone = (milestone: any) => {
    setEditingMilestone(milestone);
    setMilestoneTitle(milestone.title || "");
    setMilestoneDate(
      milestone.milestone_date ? String(milestone.milestone_date).slice(0, 10) : ""
    );
    setMilestoneCategory(milestone.category || "Life Event");
    setMilestoneDescription(milestone.description || "");
    setMilestoneSortOrder(String(milestone.sort_order || 0));
    setMilestoneIsVisible(Number(milestone.is_visible) === 1);
    setMilestoneImage(null);

    setTimeout(() => {
      document
        .getElementById("milestones-manager")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const saveMilestone = async () => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    if (!milestoneTitle.trim()) {
      alert("Please enter a title for this milestone.");
      return;
    }

    const formData = new FormData();

    formData.append("memorial_id", String(memorial.id));
    formData.append("title", milestoneTitle);
    formData.append("milestone_date", milestoneDate);
    formData.append("category", milestoneCategory);
    formData.append("description", milestoneDescription);
    formData.append("sort_order", milestoneSortOrder || "0");
    formData.append("is_visible", milestoneIsVisible ? "1" : "0");

    if (editingMilestone?.id) {
      formData.append("milestone_id", String(editingMilestone.id));
    }

    if (milestoneImage) formData.append("image", milestoneImage);

    try {
      setSavingMilestone(true);

      const res = await fetch("/api/milestones", {
        method: editingMilestone?.id ? "PATCH" : "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save milestone.");
        return;
      }

      alert(data.message || "Milestone saved.");
      resetMilestoneForm();
      await loadMilestones(String(memorial.id));
    } finally {
      setSavingMilestone(false);
    }
  };

  const deleteMilestone = async (milestone: any) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const confirmed = confirm(
      `Delete this milestone: "${milestone.title}"? This will remove it from the public page.`
    );

    if (!confirmed) return;

    const res = await fetch("/api/milestones", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        milestone_id: milestone.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete milestone.");
      return;
    }

    await loadMilestones(String(memorial.id));
  };

  const formatDateOnly = (dateValue: string) => {
    if (!dateValue) return "Date not set";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Date not set";

    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderMilestoneMedia = (milestone: any) => {
    if (!milestone.image_url) return null;

    return (
      <img
        src={safeMediaPath(milestone.image_url)}
        alt={milestone.title || "Milestone image"}
        className="mt-3 max-h-[320px] w-full rounded-xl bg-white object-contain"
      />
    );
  };

  const renderVaultMedia = (entry: any) => {
    if (entry.image_url) {
      return (
        <img
          src={safeMediaPath(entry.image_url)}
          alt={entry.title || "Legacy Vault image"}
          className="mt-3 max-h-[320px] w-full rounded-xl bg-white object-contain"
        />
      );
    }

    if (entry.video_url) {
      return (
        <video controls className="mt-3 w-full rounded-xl">
          <source src={safeMediaPath(entry.video_url)} />
        </video>
      );
    }

    if (entry.audio_url) {
      return (
        <div className="mt-3 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-3">
          <p className="mb-2 text-xs font-semibold text-[#d4af37]">
            🎙️ Voice Note / Audio
          </p>

          <audio controls className="w-full">
            <source src={safeMediaPath(entry.audio_url)} />
          </audio>
        </div>
      );
    }

    return null;
  };

  const formatDateTime = (dateValue: string) => {
    if (!dateValue) return "";

    return new Date(dateValue).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderChatMedia = (msg: any) => {
    if (msg.image_url) {
      return (
        <img
          src={safeMediaPath(msg.image_url)}
          alt="Chat image"
          className="mt-3 max-h-[260px] w-full rounded-xl object-cover"
        />
      );
    }

    if (msg.video_url) {
      return (
        <video controls className="mt-3 w-full rounded-xl">
          <source src={safeMediaPath(msg.video_url)} />
        </video>
      );
    }

    if (msg.audio_url) {
      return (
        <div className="mt-3 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-3">
          <p className="mb-2 text-xs font-semibold text-[#d4af37]">
            🎙️ Voice Note / Audio
          </p>

          <audio controls className="w-full">
            <source src={safeMediaPath(msg.audio_url)} />
          </audio>
        </div>
      );
    }

    return null;
  };

  const renderFamilyMessageMedia = (entry: any) => {
    if (entry.image_url) {
      return (
        <img
          src={safeMediaPath(entry.image_url)}
          alt="Family message image"
          className="mt-3 max-h-[320px] w-full rounded-xl bg-white object-contain"
        />
      );
    }

    if (entry.video_url) {
      return (
        <video controls className="mt-3 w-full rounded-xl">
          <source src={safeMediaPath(entry.video_url)} />
        </video>
      );
    }

    if (entry.audio_url) {
      return (
        <div className="mt-3 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-3">
          <p className="mb-2 text-xs font-semibold text-[#d4af37]">
            🎙️ Voice Note / Audio
          </p>

          <audio controls className="w-full">
            <source src={safeMediaPath(entry.audio_url)} />
          </audio>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
        {loadingText}
      </main>
    );
  }

  if (!memorial) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
        {notFoundText}
      </main>
    );
  }

  const memorialLink = `/memorial/${memorial.invite_token}`;

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            Owner Control
          </p>

          <h1 className="font-serif text-4xl font-bold">{manageTitle}</h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            {isLivingLegacy
              ? "Update your story, media, gallery, and manage visitor chat messages."
              : "Update your loved one’s story, media, gallery, and manage visitor chat messages."}
          </p>
        </div>

        {bankTransferStillActive && (
          <div className="mb-8 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-5 text-yellow-100 shadow-xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em]">
              Bank Transfer Under Review
            </p>

            <p className="leading-relaxed">
              {bankReviewText} About {hoursLeft} hour
              {hoursLeft === 1 ? "" : "s"} left before automatic deactivation
              if payment is not verified.
            </p>
          </div>
        )}

        {isExpiredBankTransfer && (
          <div className="mb-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-100 shadow-xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em]">
              Payment Review Expired
            </p>

            <p className="leading-relaxed">{paymentExpiredText}</p>
          </div>
        )}

        <div className="mb-8 flex flex-wrap gap-3">
          <a
            href="/dashboard"
            className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37]"
          >
            Back to Dashboard
          </a>

          {!isExpiredBankTransfer ? (
            <a
              href={memorialLink}
              target="_blank"
              className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
            >
              {viewButtonLabel}
            </a>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-lg bg-gray-700 px-5 py-3 text-sm font-semibold text-gray-300"
            >
              Awaiting Payment Verification
            </button>
          )}

          {Number(memorial.enable_family_tree) === 1 && (
            <a
              href={`/family-tree/${memorial.id}`}
              className="rounded-lg border border-[#d4af37]/50 bg-[#111a2e] px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
            >
              Manage Family Tree
            </a>
          )}
        </div>

        <div
          className={`grid gap-8 lg:grid-cols-[1.2fr_0.8fr] ${
            !canManage ? "opacity-70" : ""
          }`}
        >
          <section className="space-y-6">
            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <h2 className="mb-5 font-serif text-2xl text-[#d4af37]">
                {detailsTitle}
              </h2>

              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={namePlaceholder}
                disabled={!canManage}
                className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={!canManage}
                  className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  disabled={!canManage}
                  className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <textarea
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                rows={8}
                placeholder={biographyPlaceholder}
                disabled={!canManage}
                className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <h2 className="mb-5 font-serif text-2xl text-[#d4af37]">
                Media Updates
              </h2>

              <div className="mb-5 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                  {coverPhotoLabel}
                </label>

                <input
                  type="file"
                  accept="image/*"
                  disabled={!canManage}
                  onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
                  className="w-full rounded border border-[#2a3550] bg-[#111a2e] p-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                {coverPhoto && (
                  <p className="mt-2 text-xs text-[#d4af37]">
                    Selected: {coverPhoto.name}
                  </p>
                )}
              </div>

              <div className="mb-5 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                  {musicLabel}
                </label>

                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
                  disabled={!canManage}
                  onChange={(e) =>
                    setMemorialMusic(e.target.files?.[0] || null)
                  }
                  className="w-full rounded border border-[#2a3550] bg-[#111a2e] p-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                {memorialMusic && (
                  <p className="mt-2 text-xs text-[#d4af37]">
                    Selected: {memorialMusic.name}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                  Add More Gallery Photos
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={!canManage}
                  onChange={(e) =>
                    setGalleryPhotos(Array.from(e.target.files || []))
                  }
                  className="w-full rounded border border-[#2a3550] bg-[#111a2e] p-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                {galleryPhotos.length > 0 && (
                  <p className="mt-2 text-xs text-[#d4af37]">
                    {galleryPhotos.length} new photo
                    {galleryPhotos.length === 1 ? "" : "s"} selected.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#d4af37]">
                    Family Support Fund
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    Optional. Display an outside donation or fundraising link inside
                    the private page for family and friends. ScanMyLegacy does not
                    collect or manage these funds.
                  </p>
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-[#d4af37]/25 bg-[#0b1320] px-4 py-3 text-sm font-semibold text-gray-200">
                  <input
                    type="checkbox"
                    checked={supportFundEnabled}
                    onChange={(e) => setSupportFundEnabled(e.target.checked)}
                    disabled={!canManage}
                  />
                  Show on public page
                </label>
              </div>

              <div className="rounded-2xl border border-[#d4af37]/20 bg-[#0b1320] p-5">
                <div className="mb-4 rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm leading-relaxed text-yellow-100">
                  <strong>Important:</strong> The family must provide their own
                  GoFundMe, PayPal, WiPay, bank instruction page, or other outside
                  link. ScanMyLegacy only displays the link and does not collect,
                  hold, manage, verify, or refund any donations.
                </div>

                <input
                  value={supportFundTitle}
                  onChange={(e) => setSupportFundTitle(e.target.value)}
                  placeholder="Fund Title — example: Help Support Joshua’s University Journey"
                  disabled={!canManage || !supportFundEnabled}
                  className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <textarea
                  value={supportFundPurpose}
                  onChange={(e) => setSupportFundPurpose(e.target.value)}
                  rows={5}
                  placeholder="Explain the purpose — example: Family and friends who wish to support funeral expenses, education, medical needs, or a special family cause may contribute through the link below."
                  disabled={!canManage || !supportFundEnabled}
                  className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={supportFundButtonText}
                    onChange={(e) => setSupportFundButtonText(e.target.value)}
                    placeholder="Button Text — example: Support The Family"
                    disabled={!canManage || !supportFundEnabled}
                    className="w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <input
                    value={supportFundUrl}
                    onChange={(e) => setSupportFundUrl(e.target.value)}
                    placeholder="External link — must start with https://"
                    disabled={!canManage || !supportFundEnabled}
                    className="w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {supportFundEnabled && supportFundUrl && (
                  <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#111a2e] p-4">
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                      Preview
                    </p>

                    <h3 className="font-serif text-xl text-white">
                      {supportFundTitle || "Family Support Fund"}
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">
                      {supportFundPurpose ||
                        "Family and friends may contribute through the link below."}
                    </p>

                    <a
                      href={supportFundUrl}
                      target="_blank"
                      className="mt-4 inline-block rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
                    >
                      {supportFundButtonText || "Support The Family"}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={saveMemorial}
              disabled={saving || !canManage}
              className="w-full rounded-xl bg-[#d4af37] py-4 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
            >
              {isExpiredBankTransfer
                ? "Awaiting Payment Verification"
                : saving
                ? "Saving Updates..."
                : saveButtonLabel}
            </button>

            {isLivingLegacy && (
              <div
                id="legacy-vault-manager"
                className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl text-[#d4af37]">
                      Legacy Vault Manager
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                      Add your own personal stories, recipes, advice, life lessons,
                      photos, videos, and voice notes. These stay separate from
                      Family & Guest Messages.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadLegacyVault(String(memorial.id))}
                    className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-semibold text-[#d4af37]"
                  >
                    Refresh
                  </button>
                </div>

                <div className="mb-6 rounded-2xl border border-[#d4af37]/20 bg-[#0b1320] p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-serif text-xl text-white">
                      {editingVaultEntry ? "Edit Vault Story" : "Add New Vault Story"}
                    </h3>

                    {editingVaultEntry && (
                      <button
                        type="button"
                        onClick={resetVaultForm}
                        className="rounded-lg border border-gray-500/40 px-4 py-2 text-xs font-semibold text-gray-300"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <input
                    value={vaultTitle}
                    onChange={(e) => setVaultTitle(e.target.value)}
                    placeholder="Story Title"
                    disabled={!canManage}
                    className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                    <select
                      value={vaultCategory}
                      onChange={(e) => setVaultCategory(e.target.value)}
                      disabled={!canManage}
                      className="w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {legacyVaultCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={vaultSortOrder}
                      onChange={(e) => setVaultSortOrder(e.target.value)}
                      placeholder="Sort order"
                      disabled={!canManage}
                      className="w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div className="mb-4 rounded-2xl border border-[#d4af37]/20 bg-[#111a2e] p-4">
                    <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                      Release / Visibility Type
                    </label>

                    <select
                      value={vaultVisibilityType}
                      onChange={(e) => {
                        setVaultVisibilityType(e.target.value);
                        setVaultIsVisible(e.target.value === "public");
                      }}
                      disabled={!canManage}
                      className="mb-3 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {legacyVaultVisibilityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <p className="text-xs leading-relaxed text-gray-400">
                      {
                        legacyVaultVisibilityOptions.find(
                          (option) => option.value === vaultVisibilityType
                        )?.description
                      }
                    </p>

                    {vaultVisibilityType === "release_date" && (
                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                          Release Date
                        </label>

                        <input
                          type="date"
                          value={vaultReleaseDate}
                          onChange={(e) => setVaultReleaseDate(e.target.value)}
                          disabled={!canManage}
                          className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    )}

                    {vaultVisibilityType === "recipient_only" && (
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <input
                          value={vaultRecipientName}
                          onChange={(e) => setVaultRecipientName(e.target.value)}
                          placeholder="Recipient Name"
                          disabled={!canManage}
                          className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <input
                          value={vaultRecipientContact}
                          onChange={(e) =>
                            setVaultRecipientContact(e.target.value)
                          }
                          placeholder="Recipient Email or Phone"
                          disabled={!canManage}
                          className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <input
                          value={vaultRecipientAccessCode}
                          onChange={(e) =>
                            setVaultRecipientAccessCode(e.target.value)
                          }
                          placeholder="Private Access Code"
                          disabled={!canManage}
                          className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    )}

                    <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-3 text-xs leading-relaxed text-yellow-100">
                      Private recipient messages are hidden from the public page.
                      The unlock screen will be added next so each recipient can
                      only open their own message with their private access code.
                    </div>
                  </div>

                  <textarea
                    value={vaultStory}
                    onChange={(e) => setVaultStory(e.target.value)}
                    rows={7}
                    placeholder="Write your story, advice, recipe, memory, family history, or message here..."
                    disabled={!canManage}
                    className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="mb-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-[#d4af37]/20 bg-[#111a2e] p-4">
                      <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                        Add Photo
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        disabled={!canManage}
                        onChange={(e) => setVaultImage(e.target.files?.[0] || null)}
                        className="w-full text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      {vaultImage && (
                        <p className="mt-2 text-xs text-[#d4af37]">
                          {vaultImage.name}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-[#d4af37]/20 bg-[#111a2e] p-4">
                      <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                        Add Video
                      </label>

                      <input
                        type="file"
                        accept="video/*"
                        disabled={!canManage}
                        onChange={(e) => setVaultVideo(e.target.files?.[0] || null)}
                        className="w-full text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      {vaultVideo && (
                        <p className="mt-2 text-xs text-[#d4af37]">
                          {vaultVideo.name}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-[#d4af37]/20 bg-[#111a2e] p-4">
                      <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                        Add Voice Note
                      </label>

                      <input
                        type="file"
                        accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
                        disabled={!canManage}
                        onChange={(e) => setVaultAudio(e.target.files?.[0] || null)}
                        className="w-full text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      {vaultAudio && (
                        <p className="mt-2 text-xs text-[#d4af37]">
                          {vaultAudio.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={saveLegacyVaultEntry}
                    disabled={savingLegacyVault || !canManage}
                    className="w-full rounded-xl bg-[#d4af37] py-4 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
                  >
                    {savingLegacyVault
                      ? "Saving Vault Story..."
                      : editingVaultEntry
                      ? "Save Vault Story Changes"
                      : "Add To Legacy Vault"}
                  </button>
                </div>

                {loadingLegacyVault ? (
                  <p className="text-gray-400">Loading Legacy Vault...</p>
                ) : legacyVaultEntries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d4af37]/25 bg-[#0b1320] p-5 text-center text-sm text-gray-400">
                    No Legacy Vault stories added yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {legacyVaultEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-[#d4af37]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
                                {entry.category || "Legacy Vault"}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  entry.visibility_type === "public" || Number(entry.is_visible) === 1
                                    ? "bg-green-500/10 text-green-200"
                                    : "bg-gray-500/10 text-gray-300"
                                }`}
                              >
                                {entry.visibility_type === "public" || Number(entry.is_visible) === 1
                                  ? "Visible"
                                  : "Protected"}
                              </span>

                              <span className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                                {getVaultVisibilityLabel(entry.visibility_type || "public")}
                              </span>
                            </div>

                            <h3 className="font-serif text-xl text-white">
                              {entry.title}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatDateTime(entry.created_at)}
                            </p>

                            {entry.visibility_type === "release_date" && entry.release_date && (
                              <p className="mt-1 text-xs text-[#d4af37]">
                                Releases on {formatDateOnly(entry.release_date)}
                              </p>
                            )}

                            {entry.visibility_type === "recipient_only" && entry.recipient_name && (
                              <p className="mt-1 text-xs text-[#d4af37]">
                                Private recipient: {entry.recipient_name}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditVaultEntry(entry)}
                              disabled={!canManage}
                              className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteVaultEntry(entry)}
                              disabled={!canManage}
                              className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {entry.story ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                            {entry.story}
                          </p>
                        ) : (
                          <p className="text-sm italic text-gray-500">
                            No story text entered.
                          </p>
                        )}

                        {renderVaultMedia(entry)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div
              id="milestones-manager"
              className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#d4af37]">
                    Milestones Manager
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Add important life moments, achievements, birthdays, family
                    events, career highlights, travels, and special memories.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadMilestones(String(memorial.id))}
                  className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-semibold text-[#d4af37]"
                >
                  Refresh
                </button>
              </div>

              <div className="mb-6 rounded-2xl border border-[#d4af37]/20 bg-[#0b1320] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-serif text-xl text-white">
                    {editingMilestone ? "Edit Milestone" : "Add New Milestone"}
                  </h3>

                  {editingMilestone && (
                    <button
                      type="button"
                      onClick={resetMilestoneForm}
                      className="rounded-lg border border-gray-500/40 px-4 py-2 text-xs font-semibold text-gray-300"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <input
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Milestone Title"
                  disabled={!canManage}
                  className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mb-4 grid gap-4 md:grid-cols-4">
                  <input
                    type="date"
                    value={milestoneDate}
                    onChange={(e) => setMilestoneDate(e.target.value)}
                    disabled={!canManage}
                    className="w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <select
                    value={milestoneCategory}
                    onChange={(e) => setMilestoneCategory(e.target.value)}
                    disabled={!canManage}
                    className="w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {milestoneCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={milestoneSortOrder}
                    onChange={(e) => setMilestoneSortOrder(e.target.value)}
                    placeholder="Sort order"
                    disabled={!canManage}
                    className="w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <label className="flex items-center gap-3 rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={milestoneIsVisible}
                      onChange={(e) => setMilestoneIsVisible(e.target.checked)}
                      disabled={!canManage}
                    />
                    Show on public page
                  </label>
                </div>

                <textarea
                  value={milestoneDescription}
                  onChange={(e) => setMilestoneDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe this milestone, achievement, event, or memory..."
                  disabled={!canManage}
                  className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mb-4 rounded-xl border border-[#d4af37]/20 bg-[#111a2e] p-4">
                  <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                    Add Milestone Photo
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    disabled={!canManage}
                    onChange={(e) => setMilestoneImage(e.target.files?.[0] || null)}
                    className="w-full text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {milestoneImage && (
                    <p className="mt-2 text-xs text-[#d4af37]">
                      {milestoneImage.name}
                    </p>
                  )}

                  {editingMilestone?.image_url && !milestoneImage && (
                    <p className="mt-2 text-xs text-gray-400">
                      Existing image will remain unless you choose a new one.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={saveMilestone}
                  disabled={savingMilestone || !canManage}
                  className="w-full rounded-xl bg-[#d4af37] py-4 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
                >
                  {savingMilestone
                    ? "Saving Milestone..."
                    : editingMilestone
                    ? "Save Milestone Changes"
                    : "Add Milestone"}
                </button>
              </div>

              {loadingMilestones ? (
                <p className="text-gray-400">Loading milestones...</p>
              ) : milestones.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d4af37]/25 bg-[#0b1320] p-5 text-center text-sm text-gray-400">
                  No milestones added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-[#d4af37]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
                              {milestone.category || "Milestone"}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                Number(milestone.is_visible) === 1
                                  ? "bg-green-500/10 text-green-200"
                                  : "bg-gray-500/10 text-gray-300"
                              }`}
                            >
                              {Number(milestone.is_visible) === 1
                                ? "Visible"
                                : "Hidden"}
                            </span>
                          </div>

                          <h3 className="font-serif text-xl text-white">
                            {milestone.title}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatDateOnly(milestone.milestone_date)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditMilestone(milestone)}
                            disabled={!canManage}
                            className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteMilestone(milestone)}
                            disabled={!canManage}
                            className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {milestone.description ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                          {milestone.description}
                        </p>
                      ) : (
                        <p className="text-sm italic text-gray-500">
                          No description entered.
                        </p>
                      )}

                      {renderMilestoneMedia(milestone)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#d4af37]">
                    Chat Message Manager
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Review and remove messages from the public family chat.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadChatMessages(String(memorial.id))}
                  className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-semibold text-[#d4af37]"
                >
                  Refresh
                </button>
              </div>

              {loadingChat ? (
                <p className="text-gray-400">Loading chat messages...</p>
              ) : chatMessages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d4af37]/25 bg-[#0b1320] p-5 text-center text-sm text-gray-400">
                  No chat messages yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {msg.guest_name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formatDateTime(msg.created_at)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteChatMessage(msg.id)}
                          disabled={!canManage}
                          className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>

                      {msg.body && (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                          {msg.body}
                        </p>
                      )}

                      {renderChatMedia(msg)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#d4af37]">
                    {reactionsTitle}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Correct spelling, change flower type, or remove unwanted
                    blessings and flowers from the public page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadMemorial}
                  className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-semibold text-[#d4af37]"
                >
                  Refresh
                </button>
              </div>

              {reactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d4af37]/25 bg-[#0b1320] p-5 text-center text-sm text-gray-400">
                  {noReactionsText}
                </div>
              ) : (
                <div className="space-y-4">
                  {reactions.map((reaction) => {
                    const isFlower = reaction.reaction_type === "flower";
                    const reactionLabel = isFlower
                      ? "Flower"
                      : isLivingLegacy
                      ? "Blessing"
                      : "Candle";
                    const selectedFlower =
                      flowerOptions[reaction.flower_type] || "🌸";

                    return (
                      <div
                        key={reaction.id}
                        className="rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-2xl">
                                {isFlower
                                  ? selectedFlower
                                  : isLivingLegacy
                                  ? "❤️"
                                  : "🕯️"}
                              </span>

                              <span className="rounded-full border border-[#d4af37]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
                                {reactionLabel}
                              </span>
                            </div>

                            <p className="font-semibold text-white">
                              {reaction.guest_name || "Someone"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {formatDateTime(reaction.created_at)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => editReaction(reaction)}
                              disabled={!canManage}
                              className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteReaction(reaction)}
                              disabled={!canManage}
                              className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {isFlower && reaction.flower_type && (
                          <p className="mb-2 text-xs text-gray-500">
                            Flower type: {reaction.flower_type}
                          </p>
                        )}

                        {reaction.message ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                            {reaction.message}
                          </p>
                        ) : (
                          <p className="text-sm italic text-gray-500">
                            No message entered.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#d4af37]">
                    {familyMessagesTitle}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Review, correct spelling, or delete family messages posted
                    on the public page. Attachments stay with the message unless
                    the whole message is deleted.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadFamilyMessages(String(memorial.invite_token || ""))
                  }
                  className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-semibold text-[#d4af37]"
                >
                  Refresh
                </button>
              </div>

              {loadingFamilyMessages ? (
                <p className="text-gray-400">Loading family messages...</p>
              ) : familyMessages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d4af37]/25 bg-[#0b1320] p-5 text-center text-sm text-gray-400">
                  {noFamilyMessagesText}
                </div>
              ) : (
                <div className="space-y-4">
                  {familyMessages.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {entry.guest_name || "Someone"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formatDateTime(entry.created_at)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => editFamilyMessage(entry)}
                            disabled={!canManage}
                            className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteFamilyMessage(entry)}
                            disabled={!canManage}
                            className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {entry.message ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                          {entry.message}
                        </p>
                      ) : (
                        <p className="text-sm italic text-gray-500">
                          No message entered.
                        </p>
                      )}

                      {renderFamilyMessageMedia(entry)}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-[#1f2a44] bg-[#111a2e]">
              <div className="relative min-h-[260px] bg-[#081827]">
                {memorial.cover_photo ? (
                  <img
                    src={safeMediaPath(memorial.cover_photo)}
                    alt={memorial.full_name}
                    className="h-full min-h-[260px] w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center text-6xl">
                    {isLivingLegacy ? "✍️" : "🕯️"}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">
                    Preview
                  </p>

                  <h2 className="mt-2 font-serif text-3xl">{fullName}</h2>
                </div>
              </div>

              <div className="p-5">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                  {linkLabel}
                </p>

                <div className="break-all rounded-lg bg-[#0b1320] p-3 text-sm text-gray-300">
                  {memorialLink}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">
                {galleryTitle}
              </h2>

              {gallery.length === 0 ? (
                <p className="text-gray-400">{noGalleryText}</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {gallery.map((photo) => (
                    <div
                      key={photo.id}
                      className="overflow-hidden rounded-xl border border-[#1f2a44] bg-[#0b1320]"
                    >
                      <img
                        src={safeMediaPath(photo.file_url)}
                        alt="Gallery photo"
                        className="h-32 w-full object-cover"
                      />

                      <button
                        onClick={() => deleteGalleryPhoto(photo.id)}
                        disabled={!canManage}
                        className="w-full bg-red-900/70 px-3 py-2 text-xs text-red-100 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}