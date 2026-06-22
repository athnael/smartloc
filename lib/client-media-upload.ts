"use client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "smartloc-media";

export function canUploadToSupabaseStorage() {
  return Boolean(supabaseUrl && supabaseAnonKey && storageBucket);
}

function publicStorageUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function extensionFromFile(file: File) {
  const byName = file.name.split(".").pop()?.toLowerCase();
  if (byName && /^[a-z0-9]+$/.test(byName)) return byName;
  if (file.type.includes("png")) return "png";
  if (file.type.includes("webp")) return "webp";
  if (file.type.includes("mp4")) return "mp4";
  if (file.type.includes("webm")) return "webm";
  return file.type.startsWith("video/") ? "mp4" : "jpg";
}

export async function uploadMediaFile(file: File, folder: string) {
  if (!canUploadToSupabaseStorage()) return null;
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
  const path = `${folder}/${crypto.randomUUID()}-${safeName || `media.${extensionFromFile(file)}`}`;
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${storageBucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true"
    },
    body: file
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Upload ke Supabase Storage gagal.");
  }
  return publicStorageUrl(path);
}
