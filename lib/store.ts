"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiRequest, normalizeApiUser, type BootstrapData } from "./api-client";
import { seedAlternatives, seedCriteria, seedExpertDatasets, seedLandingMedia, seedUsers } from "./seed";
import type { Alternative, Criteria, ExpertDataset, LandingMedia, Role, User } from "./types";

type NewUser = Omit<User, "id" | "createdAt">;
type RegisterResult = { ok: boolean; message: string; user?: User };

interface SmartlocState {
  users: User[];
  criteria: Criteria[];
  alternatives: Alternative[];
  expertDatasets: ExpertDataset[];
  landingMedia: LandingMedia[];
  sessionUserId: string | null;
  apiToken: string | null;
  apiReady: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  loadFromApi: () => Promise<void>;
  login: (email: string, password: string, role?: Role) => Promise<User | null>;
  logout: () => void;
  register: (input: NewUser) => Promise<RegisterResult>;
  addCriteria: (input: Omit<Criteria, "id">) => void;
  updateCriteria: (id: string, input: Omit<Criteria, "id">) => void;
  deleteCriteria: (id: string) => void;
  addAlternative: (input: Omit<Alternative, "id">) => void;
  updateAlternative: (id: string, input: Omit<Alternative, "id">) => void;
  deleteAlternative: (id: string) => void;
  importAlternatives: (items: Omit<Alternative, "id">[]) => void;
  importExpertDataset: (item: Omit<ExpertDataset, "id" | "importedAt">) => void;
  deleteExpertDataset: (id: string) => void;
  addLandingMedia: (item: Omit<LandingMedia, "id" | "createdAt">) => void;
  updateLandingMedia: (id: string, item: Omit<LandingMedia, "id" | "createdAt">) => void;
  deleteLandingMedia: (id: string) => void;
  resetLandingMedia: () => void;
  deleteUser: (id: string) => void;
  resetDemo: () => void;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

function upsertUser(users: User[], user: User) {
  return users.some((item) => item.id === user.id)
    ? users.map((item) => item.id === user.id ? { ...item, ...user, password: item.password || user.password } : item)
    : [...users, user];
}

function localCriteriaId(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
}

export const useSmartlocStore = create<SmartlocState>()(
  persist(
    (set, get) => {
      const syncWithApi = (path: string, options: RequestInit = {}) => {
        void apiRequest(path, { ...options, token: get().apiToken ?? undefined }).catch((error) => {
          console.warn("Sinkronisasi API gagal:", error);
        });
      };

      return {
        users: clone(seedUsers),
        criteria: clone(seedCriteria),
        alternatives: clone(seedAlternatives),
        expertDatasets: clone(seedExpertDatasets),
        landingMedia: clone(seedLandingMedia),
        sessionUserId: null,
        apiToken: null,
        apiReady: false,
        hasHydrated: false,
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        loadFromApi: async () => {
          try {
            const response = await apiRequest<BootstrapData>("/api/bootstrap");
            if (!response.data) return;
            set({
              users: response.data.users.map(normalizeApiUser),
              criteria: response.data.criteria,
              alternatives: response.data.alternatives,
              expertDatasets: response.data.expertDatasets,
              landingMedia: response.data.landingMedia,
              apiReady: true
            });
          } catch (error) {
            console.warn("API belum tersedia, memakai data lokal:", error);
            set({ apiReady: false });
          }
        },
        login: async (email, password, role) => {
          try {
            const response = await apiRequest("/api/auth/login", {
              method: "POST",
              body: JSON.stringify({ email, password, role })
            });
            if (!response.user) return null;
            const user = normalizeApiUser(response.user);
            set((state) => ({
              users: upsertUser(state.users, user),
              sessionUserId: user.id,
              apiToken: response.token ?? state.apiToken,
              apiReady: true
            }));
            return user;
          } catch (error) {
            console.warn("Login API gagal, mencoba data lokal:", error);
            const user = get().users.find(
              (item) => item.email.toLowerCase() === email.toLowerCase()
                && item.password === password
                && (!role || item.role === role)
            );
            if (!user) return null;
            set({ sessionUserId: user.id });
            return user;
          }
        },
        logout: () => {
          const token = get().apiToken;
          set({ sessionUserId: null, apiToken: null });
          syncWithApi("/api/auth/logout", { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        },
        register: async (input) => {
          try {
            const response = await apiRequest("/api/auth/register", {
              method: "POST",
              body: JSON.stringify(input)
            });
            if (!response.user) return { ok: false, message: "Akun gagal dibuat." };
            const user = { ...normalizeApiUser(response.user), password: input.password };
            set((state) => ({ users: upsertUser(state.users, user), sessionUserId: null, apiReady: true }));
            return { ok: true, message: "Akun berhasil dibuat.", user };
          } catch (error) {
            const message = error instanceof Error ? error.message : "Akun gagal dibuat.";
            if (message.toLowerCase().includes("email")) return { ok: false, message };
            if (get().users.some((item) => item.email.toLowerCase() === input.email.toLowerCase())) {
              return { ok: false, message: "Email sudah digunakan." };
            }
            const user: User = {
              ...input,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString()
            };
            set((state) => ({ users: [...state.users, user], sessionUserId: null }));
            return { ok: true, message: "Akun berhasil dibuat.", user };
          }
        },
        addCriteria: (input) => {
          const item: Criteria = { ...input, id: localCriteriaId(input.name) };
          set((state) => ({
            criteria: [...state.criteria, item],
            alternatives: state.alternatives.map((alternative) => ({
              ...alternative,
              values: { ...alternative.values, [item.id]: 0 }
            }))
          }));
          syncWithApi("/api/criteria", { method: "POST", body: JSON.stringify(item) });
        },
        updateCriteria: (id, input) => {
          const item: Criteria = { ...input, id };
          set((state) => ({
            criteria: state.criteria.map((criteria) => criteria.id === id ? item : criteria)
          }));
          syncWithApi(`/api/criteria/${id}`, { method: "PUT", body: JSON.stringify(item) });
        },
        deleteCriteria: (id) => {
          set((state) => ({
            criteria: state.criteria.filter((item) => item.id !== id),
            alternatives: state.alternatives.map((item) => {
              const values = { ...item.values };
              delete values[id];
              return { ...item, values };
            })
          }));
          syncWithApi(`/api/criteria/${id}`, { method: "DELETE" });
        },
        addAlternative: (input) => {
          const item: Alternative = { ...input, id: crypto.randomUUID() };
          set((state) => ({ alternatives: [...state.alternatives, item] }));
          syncWithApi("/api/alternatives", { method: "POST", body: JSON.stringify(item) });
        },
        updateAlternative: (id, input) => {
          const item: Alternative = { ...input, id };
          set((state) => ({
            alternatives: state.alternatives.map((alternative) => alternative.id === id ? item : alternative)
          }));
          syncWithApi(`/api/alternatives/${id}`, { method: "PUT", body: JSON.stringify(item) });
        },
        deleteAlternative: (id) => {
          set((state) => ({
            alternatives: state.alternatives.filter((item) => item.id !== id)
          }));
          syncWithApi(`/api/alternatives/${id}`, { method: "DELETE" });
        },
        importAlternatives: (items) => {
          const alternatives = items.map((item) => ({ ...item, id: crypto.randomUUID() }));
          set((state) => ({
            alternatives: [...state.alternatives, ...alternatives]
          }));
          syncWithApi("/api/alternatives-import", { method: "POST", body: JSON.stringify(alternatives) });
        },
        importExpertDataset: (item) => {
          const dataset: ExpertDataset = { ...item, id: crypto.randomUUID(), importedAt: new Date().toISOString() };
          set((state) => ({
            expertDatasets: [...state.expertDatasets, dataset]
          }));
          syncWithApi("/api/expert-datasets", { method: "POST", body: JSON.stringify(dataset) });
        },
        deleteExpertDataset: (id) => {
          set((state) => ({
            expertDatasets: state.expertDatasets.filter((item) => item.id !== id)
          }));
          syncWithApi(`/api/expert-datasets/${id}`, { method: "DELETE" });
        },
        addLandingMedia: (item) => {
          const media: LandingMedia = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
          set((state) => ({
            landingMedia: [media, ...state.landingMedia]
          }));
          syncWithApi("/api/landing-media", { method: "POST", body: JSON.stringify(media) });
        },
        updateLandingMedia: (id, item) => {
          let updated: LandingMedia | null = null;
          set((state) => ({
            landingMedia: state.landingMedia.map((media) => {
              if (media.id !== id) return media;
              updated = { ...item, id, createdAt: media.createdAt };
              return updated;
            })
          }));
          if (updated) syncWithApi(`/api/landing-media/${id}`, { method: "PUT", body: JSON.stringify(updated) });
        },
        deleteLandingMedia: (id) => {
          set((state) => ({
            landingMedia: state.landingMedia.filter((item) => item.id !== id)
          }));
          syncWithApi(`/api/landing-media/${id}`, { method: "DELETE" });
        },
        resetLandingMedia: () => {
          set({ landingMedia: clone(seedLandingMedia) });
          syncWithApi("/api/landing-media-reset", { method: "POST" });
        },
        deleteUser: (id) => {
          set((state) => ({
            users: state.users.filter((item) => item.id !== id),
            sessionUserId: state.sessionUserId === id ? null : state.sessionUserId
          }));
          syncWithApi(`/api/users/${id}`, { method: "DELETE" });
        },
        resetDemo: () => {
          set({
            users: clone(seedUsers),
            criteria: clone(seedCriteria),
            alternatives: clone(seedAlternatives),
            expertDatasets: clone(seedExpertDatasets),
            landingMedia: clone(seedLandingMedia),
            sessionUserId: null
          });
          syncWithApi("/api/reset", { method: "POST" });
        }
      };
    },
    {
      name: "smartloc-demo-v1",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<Pick<SmartlocState, "users" | "criteria" | "alternatives" | "expertDatasets" | "sessionUserId" | "apiToken">>;
        return {
          users: state.users ?? clone(seedUsers),
          criteria: state.criteria ?? clone(seedCriteria),
          alternatives: state.alternatives ?? clone(seedAlternatives),
          expertDatasets: state.expertDatasets ?? clone(seedExpertDatasets),
          landingMedia: clone(seedLandingMedia),
          sessionUserId: state.sessionUserId ?? null,
          apiToken: state.apiToken ?? null
        };
      },
      partialize: (state) => ({
        users: state.users,
        criteria: state.criteria,
        alternatives: state.alternatives,
        expertDatasets: state.expertDatasets,
        landingMedia: state.landingMedia,
        sessionUserId: state.sessionUserId,
        apiToken: state.apiToken
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true)
    }
  )
);

export function useCurrentUser() {
  const users = useSmartlocStore((state) => state.users);
  const id = useSmartlocStore((state) => state.sessionUserId);
  return users.find((item) => item.id === id) ?? null;
}
