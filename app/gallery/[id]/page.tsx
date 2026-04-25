"use client";

import { useEffect, useState } from "react";

export default function GalleryManager({ params }: any) {
  const [files, setFiles] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const loadGallery = async () => {
    const res = await fetch(`/api/gallery?memorial_id=${params.id}`);
    const data = await res.json();
    setFiles(data.files || []);
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const uploadGalleryFile = async () => {
    if (!uploadFile) {
      alert("Please choose a file");
      return;
    }

    const formData = new FormData();
    formData.append("memorial_id", params.id);
    formData.append("file", uploadFile);

    const res = await fetch("/api/gallery", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("File uploaded");
    setUploadFile(null);
    await loadGallery();
  };

  return (
    <main className="min-h-screen bg-[#0b1320] p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 font-serif text-4xl text-[#d4af37]">
          Manage Gallery
        </h1>

        <div className="mb-8 rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            className="mb-4 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          />

          <button
            onClick={uploadGalleryFile}
            className="rounded bg-[#d4af37] px-6 py-3 font-semibold text-black"
          >
            Upload File
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-4"
            >
              {file.file_type === "image" && (
                <img
                  src={file.file_url}
                  alt="Gallery file"
                  className="h-56 w-full rounded-lg object-cover"
                />
              )}

              {file.file_type === "video" && (
                <video controls className="w-full rounded-lg">
                  <source src={file.file_url} />
                </video>
              )}

              {file.file_type === "audio" && (
                <audio controls className="w-full">
                  <source src={file.file_url} />
                </audio>
              )}

              <a
                href={`/api/gallery/delete?id=${file.id}&memorial_id=${params.id}`}
                className="mt-4 inline-block rounded bg-red-600 px-4 py-2"
              >
                Delete
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}