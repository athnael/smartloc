"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3, BrainCircuit, FileBarChart, ImagePlus, LayoutDashboard, LogOut, Map,
  MapPinned, Menu, RefreshCcw, Scale, SlidersHorizontal, Users, X
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCurrentUser, useSmartlocStore } from "@/lib/store";
import type { RankingMethod } from "@/lib/types";
import { calculateRanking } from "@/lib/ranking";
import { cn } from "@/lib/utils";
import { OverviewView, RankingView, MapView, CriteriaView, AlternativesView, UsersView, ReportsView, ExpertView, LandingPageView } from "./dashboard-views";

type ViewId = "overview" | "ranking" | "map" | "criteria" | "alternatives" | "users" | "reports" | "expert" | "landing";

const userNav = [
  { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
  { id: "ranking", label: "Rekomendasi", icon: Scale },
  { id: "map", label: "Peta Lokasi", icon: Map },
  { id: "expert", label: "Rekomendasi Expert", icon: BrainCircuit },
  { id: "reports", label: "Laporan", icon: FileBarChart }
] as const;

const adminNav = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "landing", label: "Landing Page", icon: ImagePlus },
  { id: "criteria", label: "Kriteria", icon: SlidersHorizontal },
  { id: "alternatives", label: "Alternatif", icon: MapPinned },
  { id: "ranking", label: "Verifikasi Ranking", icon: BarChart3 },
  { id: "expert", label: "Data Expert", icon: BrainCircuit },
  { id: "users", label: "Pengguna", icon: Users },
  { id: "reports", label: "Laporan", icon: FileBarChart }
] as const;

export function DashboardShell() {
  const router = useRouter();
  const user = useCurrentUser();
  const hasHydrated = useSmartlocStore((state) => state.hasHydrated);
  const criteria = useSmartlocStore((state) => state.criteria);
  const alternatives = useSmartlocStore((state) => state.alternatives);
  const loadFromApi = useSmartlocStore((state) => state.loadFromApi);
  const logout = useSmartlocStore((state) => state.logout);
  const resetDemo = useSmartlocStore((state) => state.resetDemo);
  const [method, setMethod] = useState<RankingMethod>("SMART");
  const [view, setView] = useState<ViewId>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const results = useMemo(() => calculateRanking(method, criteria, alternatives), [method, criteria, alternatives]);
  const smartOverviewResults = useMemo(() => calculateRanking("SMART", criteria, alternatives), [criteria, alternatives]);

  useEffect(() => {
    if (hasHydrated && !user) router.replace("/login");
  }, [hasHydrated, user, router]);

  useEffect(() => {
    if (hasHydrated) void loadFromApi();
  }, [hasHydrated, loadFromApi]);

  if (!hasHydrated || !user) {
    return <div className="grid min-h-screen place-items-center bg-mist text-sm font-bold text-sea">Memuat SMARTLOC…</div>;
  }

  const nav = user.role === "admin" ? adminNav : userNav;
  const activeLabel = nav.find((item) => item.id === view)?.label ?? "Dashboard";

  function handleLogout() {
    const target = user?.role === "admin" ? "/login/admin" : "/login/user";
    logout();
    toast.success("Anda telah keluar.");
    router.replace(target);
  }

  function changeView(id: ViewId) {
    setView(id);
    setMobileOpen(false);
  }

  return (
    <div className={cn("min-h-screen bg-[#fffdf2]", mobileOpen && "overflow-hidden lg:overflow-auto")}>
      <aside className={cn(
        "no-print fixed inset-y-0 left-0 z-[80] flex w-[min(86vw,320px)] flex-col bg-gradient-to-b from-[#ff8900] via-coral to-[#e84b00] p-5 text-white shadow-2xl transition-transform lg:z-40 lg:w-[272px] lg:translate-x-0 lg:shadow-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between">
          <Logo light />
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-white/60 hover:bg-white/10 lg:hidden" aria-label="Tutup menu"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-9 rounded-2xl border border-white/10 bg-white/[.055] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-coral font-serif text-lg font-bold">{user.name.charAt(0)}</div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold">{user.name}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-white/85">{user.role === "admin" ? "Administrator" : "Pelaku usaha"}</div>
            </div>
          </div>
        </div>
        <nav className="mt-7 flex-1 space-y-1">
          <div className="mb-3 px-3 text-xs font-bold uppercase tracking-[.14em] text-white/75">Navigasi</div>
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => changeView(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition",
                view === item.id ? "bg-white text-ocean shadow-lg" : "text-white/90 hover:bg-white/15 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 pt-4">
          <button onClick={() => { resetDemo(); toast.success("Data demo dikembalikan."); router.push("/"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-white/55 hover:bg-white/10 hover:text-white">
            <RefreshCcw className="h-4 w-4" /> Reset data demo
          </button>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-white/55 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      {mobileOpen ? <button className="fixed inset-0 z-[70] bg-ocean/55 backdrop-blur-[2px] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Tutup menu" /> : null}

      <div className={cn("lg:pl-[272px]", mobileOpen && "pointer-events-none lg:pointer-events-auto")}>
        <header className="no-print sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-orange-200 bg-[#fffdf2]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-4 w-4" /></Button>
            <div>
              <div className="text-xs font-bold uppercase tracking-[.14em] text-sea">SMARTLOC / {user.role}</div>
              <h1 className="mt-1 font-serif text-xl font-bold text-ocean">{activeLabel}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(view === "ranking" || view === "map" || view === "reports") ? (
              <div className="flex rounded-xl border border-ocean/10 bg-white p-1">
                {(["SMART", "SAW"] as RankingMethod[]).map((item) => (
                  <button key={item} onClick={() => setMethod(item)} className={cn("rounded-lg px-3 py-2 font-data text-xs font-bold", method === item ? "bg-coral text-white" : "text-ink/65 hover:text-coral")}>{item}</button>
                ))}
              </div>
            ) : null}
            <Badge variant="land" className="hidden sm:inline-flex">Data lokal aktif</Badge>
          </div>
        </header>

        <main className="p-5 sm:p-8">
          {view === "overview" ? <OverviewView user={user} results={smartOverviewResults} onNavigate={changeView} /> : null}
          {view === "ranking" ? <RankingView method={method} setMethod={setMethod} results={results} criteria={criteria} /> : null}
          {view === "map" ? <MapView method={method} results={results} /> : null}
          {view === "criteria" ? <CriteriaView /> : null}
          {view === "alternatives" ? <AlternativesView /> : null}
          {view === "landing" ? <LandingPageView /> : null}
          {view === "users" ? <UsersView currentUserId={user.id} /> : null}
          {view === "expert" ? <ExpertView isAdmin={user.role === "admin"} /> : null}
          {view === "reports" ? <ReportsView method={method} results={results} criteria={criteria} /> : null}
        </main>
      </div>
    </div>
  );
}
