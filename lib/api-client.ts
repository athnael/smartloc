import type { Alternative, Criteria, ExpertDataset, LandingMedia, User } from "./types";

export type ApiUser = Omit<User, "password"> & { password?: string };

export interface BootstrapData {
  users: ApiUser[];
  criteria: Criteria[];
  alternatives: Alternative[];
  expertDatasets: ExpertDataset[];
  landingMedia: LandingMedia[];
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  user?: ApiUser | null;
  token?: string;
  message?: string;
}

export function normalizeApiUser(user: ApiUser): User {
  return { password: "", ...user };
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const response = await fetch(path.startsWith("/api") ? path : `/api/${path}`, {
    ...options,
    headers,
    credentials: "same-origin"
  });
  const payload = await response.json().catch(() => ({ ok: false, message: "Respons API tidak valid." })) as ApiResponse<T>;

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message ?? `API gagal (${response.status}).`);
  }

  return payload;
}
