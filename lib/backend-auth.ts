import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { readDatabase } from "./backend-db";
import type { Role, User } from "./types";

export const sessionCookieName = "smartloc_session";

interface SessionPayload {
  userId: string;
  role: Role;
  exp: number;
}

const encoder = new TextEncoder();

function secret() {
  return process.env.SMARTLOC_AUTH_SECRET || "smartloc-local-development-secret";
}

function base64url(input: string | Uint8Array) {
  const buffer = typeof input === "string" ? Buffer.from(input) : Buffer.from(input);
  return buffer.toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(user: User) {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  };
  const encodedPayload = base64url(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  const expected = signPayload(encodedPayload);
  const signatureBytes = encoder.encode(signature);
  const expectedBytes = encoder.encode(expected);
  if (signatureBytes.length !== expectedBytes.length || !timingSafeEqual(signatureBytes, expectedBytes)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || !payload.role || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function requireUser(request: NextRequest, role?: Role) {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const cookie = request.cookies.get(sessionCookieName)?.value;
  const session = verifySessionToken(bearer || cookie);
  if (!session) return { ok: false as const, status: 401, message: "Sesi tidak valid atau sudah berakhir." };
  if (role && session.role !== role) return { ok: false as const, status: 403, message: "Akses hanya untuk admin." };
  const database = await readDatabase();
  const user = database.users.find((item) => item.id === session.userId);
  if (!user) return { ok: false as const, status: 401, message: "Pengguna tidak ditemukan." };
  if (role && user.role !== role) return { ok: false as const, status: 403, message: "Akses hanya untuk admin." };
  return { ok: true as const, user, session, database };
}
