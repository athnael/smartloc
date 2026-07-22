import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateRanking } from "@/lib/ranking";
import { createId, createSeedDatabase, publicUser, readDatabase, updateDatabase, updateUsers, writeDatabase } from "@/lib/backend-db";
import { createSessionToken, requireUser, sessionCookieName } from "@/lib/backend-auth";
import type { Alternative, Criteria, ExpertDataset, LandingMedia, RankingMethod, Role } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const roleSchema = z.enum(["admin", "user"]);
const criteriaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  weight: z.number().min(0).max(100),
  kind: z.enum(["benefit", "cost"]),
  attribute: z.string().optional().default(""),
  unit: z.string().optional().default("")
});
const alternativeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  address: z.string().min(3),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  photoUrl: z.string().min(1),
  values: z.record(z.number())
});
const landingMediaSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  locationName: z.string().min(2),
  type: z.enum(["image", "video"]),
  url: z.string().min(1),
  posterUrl: z.string().optional(),
  caption: z.string().optional().default("")
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: roleSchema.optional()
});
const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: roleSchema
});
const adminUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: roleSchema
});
const expertDatasetSchema = z.object({
  id: z.string().optional(),
  expertName: z.string().min(2),
  expertise: z.string().default(""),
  source: z.string().default(""),
  notes: z.string().default(""),
  criteria: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    weight: z.number(),
    kind: z.enum(["benefit", "cost"]),
    attribute: z.string().optional(),
    unit: z.string().optional()
  })),
  alternatives: z.array(alternativeSchema.extend({ id: z.string().min(1) })),
  smartRanking: z.array(z.any()).optional(),
  sawRanking: z.array(z.any()).optional()
});

type RouteContext = { params: Promise<{ smartloc?: string[] }> };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message: string, status = 400) {
  return json({ ok: false, message }, status);
}

async function body<T>(request: NextRequest, schema: z.ZodType<T>) {
  const payload = await request.json().catch(() => null);
  return schema.safeParse(payload);
}

async function parts(context: RouteContext) {
  return (await context.params).smartloc ?? [];
}

function methodFromSearch(request: NextRequest): RankingMethod {
  return request.nextUrl.searchParams.get("method")?.toUpperCase() === "SAW" ? "SAW" : "SMART";
}

export async function GET(request: NextRequest, context: RouteContext) {
  const route = await parts(context);
  const [resource, id] = route;

  if (!resource || resource === "health") {
    return json({
      ok: true,
      name: "SMARTLOC API",
      storage: {
        supabaseUrl: Boolean(process.env.SUPABASE_URL),
        supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        bucket: process.env.SMARTLOC_SUPABASE_BUCKET ?? "smartloc-media"
      }
    });
  }

  let database;
  try {
    database = await readDatabase();
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Database tidak dapat dibaca.";
    return json({
      ok: false,
      message: "Database SMARTLOC belum bisa diakses. Periksa environment Supabase di Vercel dan tabel Supabase.",
      detail
    }, 500);
  }

  if (resource === "bootstrap") {
    return json({
      ok: true,
      data: {
        users: database.users.map(publicUser),
        criteria: database.criteria,
        alternatives: database.alternatives,
        expertDatasets: database.expertDatasets,
        landingMedia: database.landingMedia
      }
    });
  }

  if (resource === "me") {
    const auth = await requireUser(request);
    if (!auth.ok) return error(auth.message, auth.status);
    return json({ ok: true, user: publicUser(auth.user) });
  }

  if (resource === "users") return json({ ok: true, data: database.users.map(publicUser) });
  if (resource === "criteria") return json({ ok: true, data: id ? database.criteria.find((item) => item.id === id) ?? null : database.criteria });
  if (resource === "alternatives") return json({ ok: true, data: id ? database.alternatives.find((item) => item.id === id) ?? null : database.alternatives });
  if (resource === "expert-datasets") return json({ ok: true, data: id ? database.expertDatasets.find((item) => item.id === id) ?? null : database.expertDatasets });
  if (resource === "landing-media") return json({ ok: true, data: id ? database.landingMedia.find((item) => item.id === id) ?? null : database.landingMedia });

  if (resource === "ranking") {
    const method = methodFromSearch(request);
    return json({ ok: true, method, data: calculateRanking(method, database.criteria, database.alternatives) });
  }

  return error("Endpoint tidak ditemukan.", 404);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const route = await parts(context);
  const [resource, action] = route;

  if (resource === "auth" && action === "login") {
    const parsed = await body(request, loginSchema);
    if (!parsed.success) return error("Data login tidak valid.");
    const database = await readDatabase();
    const user = database.users.find((item) =>
      item.email.toLowerCase() === parsed.data.email.toLowerCase()
      && item.password === parsed.data.password
      && (!parsed.data.role || item.role === parsed.data.role)
    );
    if (!user) return error("Email atau password tidak cocok.", 401);
    const token = createSessionToken(user);
    const response = json({ ok: true, user: publicUser(user), token });
    response.cookies.set(sessionCookieName, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return response;
  }

  if (resource === "auth" && action === "logout") {
    const response = json({ ok: true });
    response.cookies.delete(sessionCookieName);
    return response;
  }

  if (resource === "auth" && action === "register") {
    const parsed = await body(request, registerSchema);
    if (!parsed.success) return error("Data registrasi tidak valid.");
    const created = await updateUsers((users) => {
      if (users.some((item) => item.email.toLowerCase() === parsed.data.email.toLowerCase())) {
        throw new Error("EMAIL_EXISTS");
      }
      users.push({ ...parsed.data, id: createId("usr"), createdAt: new Date().toISOString() });
    }).catch((err) => err instanceof Error && err.message === "EMAIL_EXISTS" ? null : Promise.reject(err));
    if (!created) return error("Email sudah digunakan.", 409);
    const user = created.find((item) => item.email.toLowerCase() === parsed.data.email.toLowerCase());
    return json({ ok: true, user: user ? publicUser(user) : null }, 201);
  }

  if (resource === "reset") {
    const auth = await requireUser(request, "admin");
    if (!auth.ok) return error(auth.message, auth.status);
    const database = createSeedDatabase();
    await writeDatabase(database);
    return json({ ok: true, data: database });
  }

  const auth = await requireUser(request, "admin");
  if (!auth.ok) return error(auth.message, auth.status);

  if (resource === "criteria") {
    const parsed = await body(request, criteriaSchema);
    if (!parsed.success) return error("Data kriteria tidak valid.");
    const item: Criteria = { ...parsed.data, id: parsed.data.id ?? createId("cri") };
    const database = await updateDatabase((db) => {
      db.criteria.push(item);
      db.alternatives = db.alternatives.map((alternative) => ({ ...alternative, values: { ...alternative.values, [item.id]: 0 } }));
    });
    return json({ ok: true, data: item, database }, 201);
  }

  if (resource === "users") {
    const parsed = await body(request, adminUserSchema);
    if (!parsed.success) return error("Data pengguna tidak valid.");
    const created = await updateUsers((users) => {
      if (users.some((item) => item.email.toLowerCase() === parsed.data.email.toLowerCase())) {
        throw new Error("EMAIL_EXISTS");
      }
      users.push({ ...parsed.data, id: createId("usr"), createdAt: new Date().toISOString() });
    }).catch((err) => err instanceof Error && err.message === "EMAIL_EXISTS" ? null : Promise.reject(err));
    if (!created) return error("Email sudah digunakan.", 409);
    const user = created.find((item) => item.email.toLowerCase() === parsed.data.email.toLowerCase());
    return json({ ok: true, user: user ? publicUser(user) : null }, 201);
  }

  if (resource === "alternatives") {
    const parsed = await body(request, alternativeSchema);
    if (!parsed.success) return error("Data alternatif tidak valid.");
    const item: Alternative = { ...parsed.data, id: parsed.data.id ?? createId("alt") };
    await updateDatabase((db) => { db.alternatives.push(item); });
    return json({ ok: true, data: item }, 201);
  }

  if (resource === "alternatives-import") {
    const parsed = await body(request, z.array(alternativeSchema));
    if (!parsed.success) return error("Data impor alternatif tidak valid.");
    const items: Alternative[] = parsed.data.map((item) => ({ ...item, id: item.id ?? createId("alt") }));
    await updateDatabase((db) => { db.alternatives.push(...items); });
    return json({ ok: true, data: items }, 201);
  }

  if (resource === "expert-datasets") {
    const parsed = await body(request, expertDatasetSchema);
    if (!parsed.success) return error("Data expert tidak valid.");
    const smart = calculateRanking("SMART", parsed.data.criteria, parsed.data.alternatives);
    const saw = calculateRanking("SAW", parsed.data.criteria, parsed.data.alternatives);
    const item: ExpertDataset = {
      id: parsed.data.id ?? createId("expert"),
      expertName: parsed.data.expertName,
      expertise: parsed.data.expertise ?? "",
      source: parsed.data.source ?? "",
      notes: parsed.data.notes ?? "",
      criteria: parsed.data.criteria,
      alternatives: parsed.data.alternatives,
      importedAt: new Date().toISOString(),
      smartRanking: smart.map((rank) => ({ alternativeId: rank.alternative.id, locationName: rank.alternative.name, score: rank.score, rank: rank.rank, utilities: rank.utilities })),
      sawRanking: saw.map((rank) => ({ alternativeId: rank.alternative.id, locationName: rank.alternative.name, score: rank.score, rank: rank.rank, utilities: rank.utilities }))
    };
    await updateDatabase((db) => { db.expertDatasets.push(item); });
    return json({ ok: true, data: item }, 201);
  }

  if (resource === "landing-media") {
    const parsed = await body(request, landingMediaSchema);
    if (!parsed.success) return error("Data media landing tidak valid.");
    const item: LandingMedia = {
      id: parsed.data.id ?? createId("media"),
      title: parsed.data.title,
      locationName: parsed.data.locationName,
      type: parsed.data.type,
      url: parsed.data.url,
      posterUrl: parsed.data.posterUrl,
      caption: parsed.data.caption ?? "",
      createdAt: new Date().toISOString()
    };
    await updateDatabase((db) => { db.landingMedia.unshift(item); });
    return json({ ok: true, data: item }, 201);
  }

  if (resource === "landing-media-reset") {
    const seeded = createSeedDatabase().landingMedia;
    await updateDatabase((db) => { db.landingMedia = seeded; });
    return json({ ok: true, data: seeded });
  }

  return error("Endpoint tidak ditemukan.", 404);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const route = await parts(context);
  const [resource, id] = route;
  if (!id) return error("ID wajib disertakan.", 400);
  const auth = await requireUser(request, "admin");
  if (!auth.ok) return error(auth.message, auth.status);

  if (resource === "criteria") {
    const parsed = await body(request, criteriaSchema);
    if (!parsed.success) return error("Data kriteria tidak valid.");
    await updateDatabase((db) => { db.criteria = db.criteria.map((item) => item.id === id ? { ...parsed.data, id } : item); });
    return json({ ok: true });
  }
  if (resource === "users") {
    const parsed = await body(request, adminUserSchema);
    if (!parsed.success) return error("Data pengguna tidak valid.");
    const updated = await updateUsers((users) => {
      if (users.some((item) => item.id !== id && item.email.toLowerCase() === parsed.data.email.toLowerCase())) {
        throw new Error("EMAIL_EXISTS");
      }
      const index = users.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("NOT_FOUND");
      users[index] = { ...users[index], ...parsed.data, id, createdAt: users[index].createdAt };
    }).catch((err) => err instanceof Error && err.message === "EMAIL_EXISTS" ? null : Promise.reject(err));
    if (!updated) return error("Email sudah digunakan.", 409);
    const user = updated.find((item) => item.id === id);
    return json({ ok: true, user: user ? publicUser(user) : null });
  }
  if (resource === "alternatives") {
    const parsed = await body(request, alternativeSchema);
    if (!parsed.success) return error("Data alternatif tidak valid.");
    await updateDatabase((db) => { db.alternatives = db.alternatives.map((item) => item.id === id ? { ...parsed.data, id } : item); });
    return json({ ok: true });
  }
  if (resource === "landing-media") {
    const parsed = await body(request, landingMediaSchema);
    if (!parsed.success) return error("Data media landing tidak valid.");
    await updateDatabase((db) => {
      db.landingMedia = db.landingMedia.map((item) => item.id === id ? {
        id,
        title: parsed.data.title,
        locationName: parsed.data.locationName,
        type: parsed.data.type,
        url: parsed.data.url,
        posterUrl: parsed.data.posterUrl,
        caption: parsed.data.caption ?? "",
        createdAt: item.createdAt
      } : item);
    });
    return json({ ok: true });
  }
  return error("Endpoint tidak ditemukan.", 404);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const route = await parts(context);
  const [resource, id] = route;
  if (!id) return error("ID wajib disertakan.", 400);
  const auth = await requireUser(request, "admin");
  if (!auth.ok) return error(auth.message, auth.status);

  if (resource === "users") {
    await updateUsers((users) => {
      const index = users.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("NOT_FOUND");
      users.splice(index, 1);
    }).catch((err) => err instanceof Error && err.message === "NOT_FOUND" ? null : Promise.reject(err));
    return json({ ok: true });
  }

  await updateDatabase((db) => {
    if (resource === "criteria") {
      db.criteria = db.criteria.filter((item) => item.id !== id);
      db.alternatives = db.alternatives.map((alternative) => {
        const values = { ...alternative.values };
        delete values[id];
        return { ...alternative, values };
      });
    }
    else if (resource === "alternatives") db.alternatives = db.alternatives.filter((item) => item.id !== id);
    else if (resource === "expert-datasets") db.expertDatasets = db.expertDatasets.filter((item) => item.id !== id);
    else if (resource === "landing-media") db.landingMedia = db.landingMedia.filter((item) => item.id !== id);
    else throw new Error("NOT_FOUND");
  }).catch((err) => err instanceof Error && err.message === "NOT_FOUND" ? null : Promise.reject(err));

  return json({ ok: true });
}
