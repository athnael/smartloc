import { promises as fs } from "fs";
import path from "path";
import { seedAlternatives, seedCriteria, seedExpertDatasets, seedLandingMedia, seedUsers } from "./seed";
import type { Alternative, Criteria, ExpertDataset, LandingMedia, User } from "./types";

export interface SmartlocDatabase {
  users: User[];
  criteria: Criteria[];
  alternatives: Alternative[];
  expertDatasets: ExpertDataset[];
  landingMedia: LandingMedia[];
  updatedAt: string;
}

const dataDirectory = path.join(process.cwd(), "data");
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
