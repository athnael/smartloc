import type { Alternative, Criteria, ExpertDataset, LandingMedia, User } from "./types";

export interface SupabaseSmartlocDatabase {
  users: User[];
  criteria: Criteria[];
  alternatives: Alternative[];
  expertDatasets: ExpertDataset[];
  landingMedia: LandingMedia[];
  updatedAt: string;
}

type SupabaseUserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  created_at: string;
};

type SupabaseCriteriaRow = {
  id: string;
  name: string;
  weight: number;
  kind: "benefit" | "cost";
  attribute: string | null;
  unit: string | null;
};

type SupabaseAlternativeRow = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  values: Record<string, number>;
};

type SupabaseExpertDatasetRow = {
  id: string;
  expert_name: string;
  expertise: string;
  source: string;
  imported_at: string;
  notes: string;
  criteria: Criteria[];
  alternatives: Alternative[];
  smart_ranking: ExpertDataset["smartRanking"];
  saw_ranking: ExpertDataset["sawRanking"];
};

type SupabaseLandingMediaRow = {
  id: string;
  title: string;
  location_name: string;
  type: "image" | "video";
  url: string;
  poster_url: string | null;
  caption: string;
  created_at: string;
};

function normalizeSupabaseUrl(value?: string) {
  return (value ?? "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/i, "")
    .replace(/\/storage\/v1$/i, "")
    .replace(/\/auth\/v1$/i, "");
}

const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const storageBucket = process.env.SMARTLOC_SUPABASE_BUCKET ?? "smartloc-media";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isSupabaseConfigured()) throw new Error("Supabase belum dikonfigurasi.");
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Supabase gagal (${response.status}): ${message}`);
  }
  if (response.status === 204) return null as T;
  return response.json().catch(() => null) as Promise<T>;
}

async function readTable<T>(table: string, order?: string) {
  const query = order ? `?select=*&order=${order}.asc` : "?select=*";
  return supabaseRequest<T[]>(`${table}${query}`);
}

async function replaceTable<T extends { id: string }>(table: string, rows: T[]) {
  await supabaseRequest(`${table}?id=neq.__smartloc_keep_none__`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
  if (!rows.length) return;
  await supabaseRequest(`${table}?on_conflict=id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows)
  });
}

function publicStorageUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function parseDataUrl(value: string) {
  const match = value.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const ext = mime.includes("png") ? "png"
    : mime.includes("webp") ? "webp"
      : mime.includes("mp4") ? "mp4"
        : mime.includes("webm") ? "webm"
          : mime.includes("quicktime") ? "mov"
            : "jpg";
  return { mime, ext, buffer: Buffer.from(match[2], "base64") };
}

async function uploadDataUrl(value: string, folder: string, id: string) {
  const parsed = parseDataUrl(value);
  if (!parsed) return value;
  const path = `${folder}/${id}-${Date.now()}.${parsed.ext}`;
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${storageBucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": parsed.mime,
      "x-upsert": "true"
    },
    body: parsed.buffer
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Upload media Supabase gagal (${response.status}): ${message}`);
  }
  return publicStorageUrl(path);
}

async function persistMediaUrls(database: SupabaseSmartlocDatabase): Promise<SupabaseSmartlocDatabase> {
  const alternatives = await Promise.all(database.alternatives.map(async (item) => ({
    ...item,
    photoUrl: await uploadDataUrl(item.photoUrl, "alternatives", item.id)
  })));
  const expertDatasets = await Promise.all(database.expertDatasets.map(async (dataset) => ({
    ...dataset,
    alternatives: await Promise.all(dataset.alternatives.map(async (item) => ({
      ...item,
      photoUrl: await uploadDataUrl(item.photoUrl, "expert-alternatives", item.id)
    })))
  })));
  const landingMedia = await Promise.all(database.landingMedia.map(async (item) => ({
    ...item,
    url: await uploadDataUrl(item.url, "landing", item.id),
    posterUrl: item.posterUrl ? await uploadDataUrl(item.posterUrl, "landing-posters", item.id) : item.posterUrl
  })));
  return { ...database, alternatives, expertDatasets, landingMedia };
}

export async function readSupabaseDatabase(): Promise<SupabaseSmartlocDatabase> {
  const [users, criteria, alternatives, expertDatasets, landingMedia] = await Promise.all([
    readTable<SupabaseUserRow>("smartloc_users", "created_at"),
    readTable<SupabaseCriteriaRow>("smartloc_criteria"),
    readTable<SupabaseAlternativeRow>("smartloc_alternatives"),
    readTable<SupabaseExpertDatasetRow>("smartloc_expert_datasets", "imported_at"),
    readTable<SupabaseLandingMediaRow>("smartloc_landing_media", "created_at")
  ]);

  return {
    users: users.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      password: item.password,
      role: item.role,
      createdAt: item.created_at
    })),
    criteria: criteria.map((item) => ({
      id: item.id,
      name: item.name,
      weight: Number(item.weight),
      kind: item.kind,
      attribute: item.attribute ?? "",
      unit: item.unit ?? ""
    })),
    alternatives: alternatives.map((item) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      photoUrl: item.photo_url,
      values: item.values ?? {}
    })),
    expertDatasets: expertDatasets.map((item) => ({
      id: item.id,
      expertName: item.expert_name,
      expertise: item.expertise,
      source: item.source,
      importedAt: item.imported_at,
      notes: item.notes,
      criteria: item.criteria ?? [],
      alternatives: item.alternatives ?? [],
      smartRanking: item.smart_ranking ?? [],
      sawRanking: item.saw_ranking ?? []
    })),
    landingMedia: landingMedia.map((item) => ({
      id: item.id,
      title: item.title,
      locationName: item.location_name,
      type: item.type,
      url: item.url,
      posterUrl: item.poster_url ?? undefined,
      caption: item.caption,
      createdAt: item.created_at
    })),
    updatedAt: new Date().toISOString()
  };
}

export async function writeSupabaseDatabase(input: SupabaseSmartlocDatabase) {
  const database = await persistMediaUrls(input);
  await replaceTable<SupabaseUserRow>("smartloc_users", database.users.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    password: item.password,
    role: item.role,
    created_at: item.createdAt
  })));
  await replaceTable<SupabaseCriteriaRow>("smartloc_criteria", database.criteria.map((item) => ({
    id: item.id,
    name: item.name,
    weight: item.weight,
    kind: item.kind,
    attribute: item.attribute ?? "",
    unit: item.unit ?? ""
  })));
  await replaceTable<SupabaseAlternativeRow>("smartloc_alternatives", database.alternatives.map((item) => ({
    id: item.id,
    name: item.name,
    address: item.address,
    latitude: item.latitude,
    longitude: item.longitude,
    photo_url: item.photoUrl,
    values: item.values
  })));
  await replaceTable<SupabaseExpertDatasetRow>("smartloc_expert_datasets", database.expertDatasets.map((item) => ({
    id: item.id,
    expert_name: item.expertName,
    expertise: item.expertise,
    source: item.source,
    imported_at: item.importedAt,
    notes: item.notes,
    criteria: item.criteria,
    alternatives: item.alternatives,
    smart_ranking: item.smartRanking,
    saw_ranking: item.sawRanking
  })));
  await replaceTable<SupabaseLandingMediaRow>("smartloc_landing_media", database.landingMedia.map((item) => ({
    id: item.id,
    title: item.title,
    location_name: item.locationName,
    type: item.type,
    url: item.url,
    poster_url: item.posterUrl ?? null,
    caption: item.caption,
    created_at: item.createdAt
  })));
}
