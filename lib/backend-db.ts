import { promises as fs } from "fs";
import path from "path";
import { seedAlternatives, seedCriteria, seedExpertDatasets, seedLandingMedia, seedUsers } from "./seed";
import { deleteSupabaseUser, isSupabaseConfigured, readSupabaseDatabase, upsertSupabaseUser, writeSupabaseDatabase, writeSupabaseUsers } from "./supabase-db";
import type { Alternative, Criteria, ExpertDataset, LandingMedia, User } from "./types";

export interface SmartlocDatabase {
  users: User[];
  criteria: Criteria[];
  alternatives: Alternative[];
  expertDatasets: ExpertDataset[];
  landingMedia: LandingMedia[];
  updatedAt: string;
}

const dataDirectory = process.env.SMARTLOC_DATA_DIR
  ?? (process.env.VERCEL ? path.join("/tmp", "smartloc") : path.join(process.cwd(), "data"));
const databasePath = path.join(dataDirectory, "smartloc-db.json");

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export function createSeedDatabase(): SmartlocDatabase {
  return {
    users: clone(seedUsers),
    criteria: clone(seedCriteria),
    alternatives: clone(seedAlternatives),
    expertDatasets: clone(seedExpertDatasets),
    landingMedia: clone(seedLandingMedia),
    updatedAt: new Date().toISOString()
  };
}

export async function readDatabase(): Promise<SmartlocDatabase> {
  if (isSupabaseConfigured()) {
    const database = await readSupabaseDatabase();
    const isEmpty = !database.users.length
      && !database.criteria.length
      && !database.alternatives.length
      && !database.expertDatasets.length
      && !database.landingMedia.length;
    if (isEmpty) {
      const seeded = createSeedDatabase();
      await writeSupabaseDatabase(seeded);
      return seeded;
    }
    return normalizeDatabase(database);
  }

  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    const raw = await fs.readFile(databasePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<SmartlocDatabase>;
    return normalizeDatabase(parsed);
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code !== "ENOENT") throw error;
    const seeded = createSeedDatabase();
    await writeDatabase(seeded);
    return seeded;
  }
}

export async function writeDatabase(database: SmartlocDatabase) {
  if (isSupabaseConfigured()) {
    await writeSupabaseDatabase(database);
    return;
  }

  await fs.mkdir(dataDirectory, { recursive: true });
  const next = { ...database, updatedAt: new Date().toISOString() };
  await fs.writeFile(databasePath, JSON.stringify(next, null, 2), "utf8");
}

export async function updateDatabase(mutator: (database: SmartlocDatabase) => void | Promise<void>) {
  const database = await readDatabase();
  await mutator(database);
  await writeDatabase(database);
  return database;
}

export async function updateUsers(mutator: (users: User[]) => void | Promise<void>) {
  const database = await readDatabase();
  await mutator(database.users);
  if (isSupabaseConfigured()) {
    await writeSupabaseUsers(database.users);
  } else {
    await writeDatabase(database);
  }
  return database.users;
}

export async function createUserRecord(input: Omit<User, "id" | "createdAt">) {
  const database = await readDatabase();
  if (database.users.some((item) => item.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("EMAIL_EXISTS");
  }
  const user: User = { ...input, id: createId("usr"), createdAt: new Date().toISOString() };
  if (isSupabaseConfigured()) {
    await upsertSupabaseUser(user);
  } else {
    database.users.push(user);
    await writeDatabase(database);
  }
  return user;
}

export async function updateUserRecord(id: string, input: Omit<User, "id" | "createdAt">) {
  const database = await readDatabase();
  if (database.users.some((item) => item.id !== id && item.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("EMAIL_EXISTS");
  }
  const existing = database.users.find((item) => item.id === id);
  if (!existing) throw new Error("NOT_FOUND");
  const user: User = { ...existing, ...input, id, createdAt: existing.createdAt };
  if (isSupabaseConfigured()) {
    await upsertSupabaseUser(user);
  } else {
    database.users = database.users.map((item) => item.id === id ? user : item);
    await writeDatabase(database);
  }
  return user;
}

export async function deleteUserRecord(id: string) {
  const database = await readDatabase();
  const exists = database.users.some((item) => item.id === id);
  if (!exists) throw new Error("NOT_FOUND");
  if (isSupabaseConfigured()) {
    await deleteSupabaseUser(id);
  } else {
    database.users = database.users.filter((item) => item.id !== id);
    await writeDatabase(database);
  }
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function publicUser(user: User) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function normalizeDatabase(input: Partial<SmartlocDatabase>): SmartlocDatabase {
  return {
    users: Array.isArray(input.users) ? input.users : clone(seedUsers),
    criteria: Array.isArray(input.criteria) ? input.criteria : clone(seedCriteria),
    alternatives: Array.isArray(input.alternatives) ? input.alternatives : clone(seedAlternatives),
    expertDatasets: Array.isArray(input.expertDatasets) ? input.expertDatasets : clone(seedExpertDatasets),
    landingMedia: Array.isArray(input.landingMedia) ? input.landingMedia : clone(seedLandingMedia),
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : new Date().toISOString()
  };
}
