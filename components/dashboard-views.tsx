"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, Award, BarChart3, BrainCircuit, Building2, Calculator, Download,
  Edit3, FileDown, FileSpreadsheet, ImagePlus, Map, MapPin, Plus, Printer, RotateCcw, Search,
  ShieldCheck, Sparkles, Trash2, TrendingUp, Upload, Users, Video
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { LocationMap } from "./location-map";
import { calculateRanking } from "@/lib/ranking";
import { useSmartlocStore } from "@/lib/store";
import type { Alternative, Criteria, ExpertDataset, LandingMedia, RankingMethod, RankingResult, User } from "@/lib/types";
import { formatNumber, formatScore } from "@/lib/utils";

type ViewId = "overview" | "ranking" | "map" | "criteria" | "alternatives" | "users" | "reports" | "expert" | "landing";

function PageIntro({ eyebrow, title, description, action }: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <div className="text-[9px] font-black uppercase tracking-[.22em] text-coral">{eyebrow}</div>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ocean">{title}</h2>
        <p className="mt-2 max-w-2xl text-xs leading-6 text-ink/50">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon, accent = "sea" }: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
  accent?: "sea" | "coral" | "land";
}) {
  const colors = {
    sea: "bg-sea/10 text-sea",
    coral: "bg-coral/10 text-coral",
    land: "bg-land/15 text-[#55735d]"
  };
  return (
    <div className="rounded-2xl border border-ocean/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[.17em] text-ink/40">{label}</div>
          <div className="mt-3 font-data text-3xl font-bold tracking-tight text-ocean">{value}</div>
          <div className="mt-2 text-[10px] text-ink/45">{detail}</div>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${colors[accent]}`}><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  );
}

export function OverviewView({ user, results, onNavigate }: {
  user: User;
  results: RankingResult[];
  onNavigate: (view: ViewId) => void;
}) {
  const criteria = useSmartlocStore((state) => state.criteria);
  const alternatives = useSmartlocStore((state) => state.alternatives);
  const users = useSmartlocStore((state) => state.users);
  const top = results[0];

  if (user.role === "admin") {
    return (
      <>
        <PageIntro eyebrow="Pusat Kendali" title={`Selamat Datang, ${user.name.split(" ")[0]}.`} description="Pantau kesiapan data dan kelola seluruh komponen yang membentuk rekomendasi lokasi usaha." />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Kriteria Aktif" value={criteria.length} detail={`${criteria.reduce((sum, item) => sum + item.weight, 0)}% total bobot`} icon={BarChart3} />
          <StatCard label="Alternatif Lokasi" value={alternatives.length} detail="Tersebar di Kota Manado" icon={MapPin} accent="coral" />
          <StatCard label="Pengguna" value={users.length} detail={`${users.filter((item) => item.role === "user").length} pelaku usaha`} icon={Users} accent="land" />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-2xl border border-ocean/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-ocean">Ranking SMART Terkini</h3>
                <p className="mt-1 text-[10px] text-ink/45">Dihitung langsung dari data tersimpan.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onNavigate("ranking")}>Verifikasi <ArrowRight className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="mt-5 space-y-2">
              {results.slice(0, 4).map((item) => (
                <div key={item.alternative.id} className="flex items-center gap-4 rounded-xl bg-mist/70 p-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-xl font-data text-xs font-bold ${item.rank === 1 ? "bg-coral text-white" : "bg-white text-ocean"}`}>{item.rank}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-ocean">{item.alternative.name}</div>
                    <div className="mt-1 truncate text-[9px] text-ink/40">{item.alternative.address}</div>
                  </div>
                  <div className="font-data text-xs font-bold text-sea">{formatScore(item.score)}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="topography relative overflow-hidden rounded-2xl p-6 text-ink">
            <div className="relative z-10">
              <Badge variant="coral" className="bg-white/70 text-ink">Lokasi teratas</Badge>
              <h3 className="mt-16 font-serif text-3xl font-bold">{top?.alternative.name ?? "Belum ada data"}</h3>
              <p className="mt-2 text-xs leading-5 text-ink/60">{top?.alternative.address}</p>
              <div className="mt-6 flex items-end justify-between border-t border-ink/15 pt-4">
                <span className="text-[9px] uppercase tracking-widest text-ink/50">Skor akhir</span>
                <span className="font-data text-2xl font-extrabold text-ink">{top ? formatScore(top.score) : "—"}</span>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <PageIntro eyebrow="Atlas Peluang Anda" title={`Halo, ${user.name.split(" ")[0]}. Mau Buka Usaha Di Mana?`} description="Mulai dari rekomendasi berbasis data, lalu lihat konteks setiap lokasi langsung pada peta." />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="topography relative min-h-[360px] overflow-hidden rounded-[2rem] p-7 text-ink sm:p-9">
          <div className="relative z-10 flex h-full max-w-xl flex-col justify-between">
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-[.22em] text-ink/65">Rekomendasi hari ini</div>
              <h3 className="mt-5 font-serif text-4xl font-bold leading-tight">{top?.alternative.name ?? "Data belum tersedia"}</h3>
              <p className="mt-4 text-xs leading-6 text-ink/65">{top?.alternative.address}</p>
            </div>
            <div className="mt-16 flex flex-wrap items-end justify-between gap-5">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-ink/50">Skor SMART</div>
                <div className="mt-1 font-data text-4xl font-extrabold text-ink">{top ? formatScore(top.score) : "—"}</div>
              </div>
              <Button variant="coral" onClick={() => onNavigate("ranking")}>Lihat analisis <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </section>
        <section className="rounded-[2rem] border border-ocean/10 bg-white p-6">
          <h3 className="font-serif text-xl font-bold text-ocean">Tiga Lokasi Teratas</h3>
          <div className="mt-5 space-y-4">
            {results.slice(0, 3).map((item) => (
              <button key={item.alternative.id} onClick={() => onNavigate("map")} className="group flex w-full items-center gap-4 text-left">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-data text-sm font-bold ${item.rank === 1 ? "bg-coral text-white" : "bg-mist text-sea"}`}>{item.rank}</div>
                <div className="min-w-0 flex-1 border-b border-ocean/8 py-3">
                  <div className="truncate text-xs font-bold text-ocean group-hover:text-sea">{item.alternative.name}</div>
                  <div className="mt-1 text-[9px] text-ink/40">{item.alternative.values.rent} jt/bln · {item.alternative.values.distance} km</div>
                </div>
                <ArrowRight className="h-4 w-4 text-ink/20 group-hover:text-coral" />
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Lokasi Dianalisis" value={alternatives.length} detail="Alternatif di Manado" icon={Map} />
        <StatCard label="Kriteria Keputusan" value={criteria.length} detail="Benefit dan cost" icon={TrendingUp} accent="land" />
        <StatCard label="Metode Tersedia" value="2" detail="SMART dan SAW" icon={Sparkles} accent="coral" />
      </div>
    </>
  );
}

export function RankingView({ method, setMethod, results, criteria }: {
  method: RankingMethod;
  setMethod: (method: RankingMethod) => void;
  results: RankingResult[];
  criteria: Criteria[];
}) {
  const [query, setQuery] = useState("");
  const [calculation, setCalculation] = useState<RankingResult | null>(null);
  const filtered = results.filter((item) => item.alternative.name.toLowerCase().includes(query.toLowerCase()));
  const totalWeight = criteria.reduce((sum, item) => sum + item.weight, 0);

  return (
    <>
      <PageIntro
        eyebrow="Analisis Multi-Kriteria"
        title="Ranking Lokasi Usaha"
        description={`Urutan dihitung dengan metode ${method}. Skor diperbarui otomatis saat data kriteria atau alternatif berubah.`}
      />
      {totalWeight !== 100 ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Total bobot saat ini {totalWeight}%. Sistem menormalisasi bobot secara otomatis agar perhitungan tetap valid.
        </div>
      ) : null}
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-2xl border border-ocean/10 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-ocean/10 p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-serif text-xl font-bold text-ocean">Hasil Perankingan</h3>
              <p className="mt-1 text-[10px] text-ink/40">{results.length} alternatif · tertinggi ke terendah</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari lokasi…" className="w-full pl-9 sm:w-56" />
            </div>
          </div>
          <div className="grid gap-3 p-4">
            {filtered.map((item) => (
              <article key={item.alternative.id} className="rounded-2xl border border-orange-100 bg-[#fffdf8] p-4 shadow-sm transition hover:border-orange-300">
                <div className="grid gap-4 xl:grid-cols-[minmax(220px,.95fr)_minmax(0,1.65fr)_150px] xl:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-data text-sm font-bold ${item.rank === 1 ? "bg-coral text-white" : "bg-mist text-ocean"}`}>{item.rank}</span>
                    <img src={item.alternative.photoUrl} alt="" className="h-14 w-16 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-ocean">{item.alternative.name}</div>
                      <div className="mt-1 truncate text-[11px] font-medium text-ink/55">{item.alternative.address}</div>
                    </div>
                  </div>
                  <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
                    {criteria.map((criterion) => (
                      <div key={criterion.id} className="min-w-0 rounded-xl bg-mist/70 px-3 py-2">
                        <div className="truncate text-[10px] font-bold text-ink/60">{criterion.name}</div>
                        <div className="mt-1 font-data text-xs font-extrabold text-ocean">{formatNumber(item.alternative.values[criterion.id] ?? 0)} <span className="font-medium text-ink/50">{criterion.unit}</span></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-white px-3 py-3 xl:flex-col xl:items-end">
                    <div><div className="text-[10px] font-bold uppercase text-ink/55">Skor {method}</div><div className="font-data text-xl font-extrabold text-sea">{formatScore(item.score)}</div></div>
                    <Button size="sm" variant="outline" onClick={() => setCalculation(item)}><Calculator className="h-3.5 w-3.5" /> Perhitungan</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length ? <div className="p-10 text-center text-xs text-ink/40">Lokasi tidak ditemukan. Coba kata kunci lain.</div> : null}
        </section>
        <aside className="space-y-5">
          <div className="topography rounded-2xl p-6 text-ink">
            <Award className="h-6 w-6 text-ink" />
            <div className="mt-12 text-[9px] uppercase tracking-[.2em] text-ink/50">Pilihan teratas</div>
            <h3 className="mt-2 font-serif text-2xl font-bold">{results[0]?.alternative.name ?? "—"}</h3>
            <div className="mt-5 border-t border-ink/15 pt-4 font-data text-3xl font-extrabold text-ink">{results[0] ? formatScore(results[0].score) : "—"}</div>
          </div>
          <div className="rounded-2xl border border-ocean/10 bg-white p-5">
            <h3 className="text-xs font-bold text-ocean">Komposisi Bobot</h3>
            <div className="mt-4 space-y-4">
              {criteria.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between text-[10px]"><span className="text-ink/55">{item.name}</span><span className="font-data font-bold text-ocean">{item.weight}%</span></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-sea" style={{ width: `${Math.min(100, item.weight)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <Dialog open={Boolean(calculation)} onOpenChange={(open) => !open && setCalculation(null)}>
        <DialogContent className="max-w-4xl" title={`Perhitungan ${method}: ${calculation?.alternative.name ?? ""}`} description="Rincian ini menunjukkan angka mentah, normalisasi, bobot, dan kontribusi setiap kriteria terhadap skor akhir.">
          {calculation ? <CalculationDetail method={method} result={calculation} results={results} criteria={criteria} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CalculationDetail({ method, result, results, criteria }: {
  method: RankingMethod;
  result: RankingResult;
  results: RankingResult[];
  criteria: Criteria[];
}) {
  const totalWeight = criteria.reduce((sum, item) => sum + Math.max(0, item.weight), 0) || 1;
  return (
    <div>
      <div className="rounded-xl bg-mist p-4 text-xs leading-6 text-ink/65">
        {method === "SMART"
          ? "SMART mengubah nilai asli menjadi utility 0–1 berdasarkan nilai minimum dan maksimum, lalu mengalikannya dengan bobot ternormalisasi."
          : "SAW membagi nilai benefit dengan nilai maksimum, sedangkan cost menggunakan nilai minimum dibagi nilai alternatif. Hasilnya dikalikan bobot ternormalisasi."}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {criteria.map((criterion) => {
              const values = results.map((item) => Number(item.alternative.values[criterion.id] ?? 0));
              const min = Math.min(...values);
              const max = Math.max(...values);
              const raw = Number(result.alternative.values[criterion.id] ?? 0);
              const normalized = result.utilities[criterion.id] ?? 0;
              const weight = Math.max(0, criterion.weight) / totalWeight;
              const formula = method === "SMART"
                ? max === min ? "Nilai sama → 1" : criterion.kind === "benefit" ? `(x − ${min}) ÷ (${max} − ${min})` : `(${max} − x) ÷ (${max} − ${min})`
                : criterion.kind === "benefit" ? `x ÷ ${max}` : `${min} ÷ x`;
              return (
                <article key={criterion.id} className="rounded-xl border border-orange-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-extrabold text-ocean">{criterion.name}</h3><Badge variant={criterion.kind === "benefit" ? "land" : "coral"}>{criterion.kind}</Badge></div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-mist p-2"><div className="text-[10px] font-semibold text-ink/55">Nilai asli</div><div className="font-data text-sm font-bold">{formatNumber(raw)}</div></div>
                    <div className="rounded-lg bg-mist p-2"><div className="text-[10px] font-semibold text-ink/55">Minimum</div><div className="font-data text-sm font-bold">{formatNumber(min)}</div></div>
                    <div className="rounded-lg bg-mist p-2"><div className="text-[10px] font-semibold text-ink/55">Maksimum</div><div className="font-data text-sm font-bold">{formatNumber(max)}</div></div>
                  </div>
                  <div className="mt-3 rounded-lg bg-orange-50 p-3"><div className="text-[10px] font-semibold text-ink/55">Rumus normalisasi</div><div className="mt-1 break-words font-data text-xs font-bold text-ocean">{formula.replace("x", String(raw))}</div></div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div><div className="text-[10px] text-ink/55">Normalisasi</div><div className="font-data text-sm font-bold text-sea">{formatScore(normalized)}</div></div>
                    <div><div className="text-[10px] text-ink/55">Bobot</div><div className="font-data text-sm font-bold">{formatScore(weight)}</div></div>
                    <div><div className="text-[10px] text-ink/55">Kontribusi</div><div className="font-data text-sm font-bold text-coral">{formatScore(normalized * weight)}</div></div>
                  </div>
                </article>
              );
            })}
      </div>
      <div className="mt-5 rounded-xl bg-ocean p-5 text-white">
        <div className="text-[9px] uppercase tracking-[.18em] text-white/55">Penjumlahan kontribusi</div>
        <div className="mt-2 font-data text-sm text-white/75">
          {criteria.map((criterion) => formatScore((result.utilities[criterion.id] ?? 0) * (Math.max(0, criterion.weight) / totalWeight))).join(" + ")}
        </div>
        <div className="mt-3 border-t border-white/15 pt-3 text-sm font-bold">
          Skor akhir = <span className="font-data text-xl text-land">{formatScore(result.score)}</span>
        </div>
      </div>
    </div>
  );
}

export function MapView({ method, results }: { method: RankingMethod; results: RankingResult[] }) {
  const [selectedId, setSelectedId] = useState(results[0]?.alternative.id);
  const selected = results.find((item) => item.alternative.id === selectedId) ?? results[0];
  return (
    <>
      <PageIntro eyebrow="Konteks Geografis" title="Peta Alternatif Lokasi" description={`Klik marker untuk melihat detail lokasi dan skor ${method}. Google Maps akan aktif otomatis saat API key tersedia.`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <LocationMap results={results} selectedId={selectedId} onSelect={setSelectedId} />
        <aside className="flex h-[480px] min-h-0 flex-col overflow-hidden rounded-2xl border border-ocean/10 bg-white">
          {selected ? (
            <div className="shrink-0 border-b border-orange-100 bg-[#fff8df] p-3">
              <img src={selected.alternative.photoUrl} alt={selected.alternative.name} className="h-32 w-full rounded-xl object-cover sm:h-40" />
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-ocean">{selected.alternative.name}</div>
                  <div className="mt-1 text-[11px] leading-5 text-ink/60">{selected.alternative.address}</div>
                </div>
                <Badge variant="coral">#{selected.rank}</Badge>
              </div>
              <div className="mt-3 rounded-xl bg-white px-3 py-2 font-data text-sm font-extrabold text-sea">Skor {method}: {formatScore(selected.score)}</div>
            </div>
          ) : null}
          <div className="scrollbar-thin min-h-0 flex-1 space-y-2 overflow-y-auto p-3 pb-6">
            {results.map((item) => (
              <button key={item.alternative.id} onClick={() => setSelectedId(item.alternative.id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selectedId === item.alternative.id ? "bg-coral text-white" : "hover:bg-mist"}`}>
                <img src={item.alternative.photoUrl} alt="" className="h-10 w-12 shrink-0 rounded-lg object-cover" />
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-data text-xs font-bold ${selectedId === item.alternative.id ? "bg-white text-coral" : "bg-mist text-sea"}`}>{item.rank}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{item.alternative.name}</span><span className={`mt-1 block font-data text-[9px] ${selectedId === item.alternative.id ? "text-white/65" : "text-ink/40"}`}>{item.alternative.latitude.toFixed(4)}, {item.alternative.longitude.toFixed(4)}</span></span>
                <span className="font-data text-[10px] font-bold">{formatScore(item.score)}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

export function CriteriaView() {
  const criteria = useSmartlocStore((state) => state.criteria);
  const alternatives = useSmartlocStore((state) => state.alternatives);
  const addCriteria = useSmartlocStore((state) => state.addCriteria);
  const updateCriteria = useSmartlocStore((state) => state.updateCriteria);
  const deleteCriteria = useSmartlocStore((state) => state.deleteCriteria);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Criteria | null>(null);
  const total = criteria.reduce((sum, item) => sum + item.weight, 0);

  function save(input: Omit<Criteria, "id">) {
    if (editing) updateCriteria(editing.id, input);
    else addCriteria(input);
    toast.success(editing ? "Kriteria diperbarui." : "Kriteria ditambahkan.");
    setOpen(false);
    setEditing(null);
  }

  function remove(item: Criteria) {
    if (!confirm(`Hapus kriteria "${item.name}"? Nilai terkait pada semua alternatif juga akan dihapus.`)) return;
    deleteCriteria(item.id);
    toast.success("Kriteria dihapus.");
  }

  return (
    <>
      <PageIntro eyebrow="Master Data" title="Kriteria Penilaian" description="Atur faktor, bobot, dan karakter benefit/cost yang menjadi dasar perhitungan." action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Tambah Kriteria</Button>} />
      <div className={`mb-5 rounded-xl border px-4 py-3 text-xs ${total === 100 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
        Total bobot: <strong className="font-data">{total}%</strong>. {total === 100 ? "Komposisi bobot valid." : "Perhitungan tetap berjalan dengan normalisasi otomatis, tetapi idealnya total bobot 100%."}
      </div>
      <section className="overflow-hidden rounded-2xl border border-ocean/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-mist/70 text-[9px] font-bold uppercase tracking-[.14em] text-ink/40"><tr><th className="px-5 py-4">Kriteria</th><th className="px-5 py-4">Atribut</th><th className="px-5 py-4">Jenis</th><th className="px-5 py-4">Bobot</th><th className="px-5 py-4">Rentang data</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-ocean/7">
              {criteria.map((item) => {
                const values = alternatives.map((alternative) => alternative.values[item.id] ?? 0);
                return (
                  <tr key={item.id}>
                    <td className="px-5 py-4"><div className="text-xs font-bold text-ocean">{item.name}</div><div className="mt-1 text-[9px] text-ink/40">{item.unit || "Tanpa satuan"}</div></td>
                    <td className="px-5 py-4 text-xs text-ink/55">{item.attribute || "—"}</td>
                    <td className="px-5 py-4"><Badge variant={item.kind === "benefit" ? "land" : "coral"}>{item.kind}</Badge></td>
                    <td className="px-5 py-4 font-data text-sm font-bold text-sea">{item.weight}%</td>
                    <td className="px-5 py-4 font-data text-[10px] text-ink/50">{values.length ? `${formatNumber(Math.min(...values))} – ${formatNumber(Math.max(...values))}` : "—"}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2"><Button size="icon" variant="ghost" onClick={() => { setEditing(item); setOpen(true); }} aria-label="Edit"><Edit3 className="h-4 w-4" /></Button><Button size="icon" variant="danger" onClick={() => remove(item)} aria-label="Hapus"><Trash2 className="h-4 w-4" /></Button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) setEditing(null); }}>
        <DialogContent title={editing ? "Edit Kriteria" : "Tambah Kriteria"} description="Bobot akan dinormalisasi otomatis saat dihitung.">
          <CriteriaForm initial={editing} onSave={save} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function CriteriaForm({ initial, onSave, onCancel }: {
  initial: Criteria | null;
  onSave: (input: Omit<Criteria, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [weight, setWeight] = useState(initial ? String(initial.weight) : "");
  const [kind, setKind] = useState<"benefit" | "cost">(initial?.kind ?? "benefit");
  const [attribute, setAttribute] = useState(initial?.attribute ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 3) return setError("Nama kriteria minimal 3 karakter.");
    const parsedWeight = Number(weight);
    if (weight === "" || !Number.isFinite(parsedWeight) || parsedWeight < 0 || parsedWeight > 100) return setError("Bobot harus berada di antara 0–100.");
    onSave({ name: name.trim(), weight: parsedWeight, kind, attribute: attribute.trim(), unit: unit.trim() });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Nama kriteria" error={error} className="sm:col-span-2"><Input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Contoh: Akses transportasi" /></Field>
      <Field label="Bobot (%)"><Input type="number" min="0" max="100" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Contoh: 20" /></Field>
      <Field label="Jenis">
        <select value={kind} onChange={(e) => setKind(e.target.value as "benefit" | "cost")} className="h-11 rounded-xl border-ocean/15 text-sm focus:border-sea focus:ring-sea/15"><option value="benefit">Benefit</option><option value="cost">Cost</option></select>
      </Field>
      <Field label="Atribut"><Input value={attribute} onChange={(e) => setAttribute(e.target.value)} placeholder="Contoh: Potensi pasar" /></Field>
      <Field label="Satuan"><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Contoh: km" /></Field>
      <div className="mt-3 flex justify-end gap-3 sm:col-span-2"><Button type="button" variant="outline" onClick={onCancel}>Batal</Button><Button type="submit">Simpan kriteria</Button></div>
    </form>
  );
}

export function AlternativesView() {
  const alternatives = useSmartlocStore((state) => state.alternatives);
  const criteria = useSmartlocStore((state) => state.criteria);
  const addAlternative = useSmartlocStore((state) => state.addAlternative);
  const updateAlternative = useSmartlocStore((state) => state.updateAlternative);
  const deleteAlternative = useSmartlocStore((state) => state.deleteAlternative);
  const importAlternatives = useSmartlocStore((state) => state.importAlternatives);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Alternative | null>(null);
  const [query, setQuery] = useState("");
  const filtered = alternatives.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  function save(input: Omit<Alternative, "id">) {
    if (editing) updateAlternative(editing.id, input);
    else addAlternative(input);
    toast.success(editing ? "Alternatif diperbarui." : "Alternatif ditambahkan.");
    setOpen(false);
    setEditing(null);
  }

  function remove(item: Alternative) {
    if (!confirm(`Hapus alternatif "${item.name}"?`)) return;
    deleteAlternative(item.id);
    toast.success("Alternatif dihapus.");
  }

  return (
    <>
      <PageIntro
        eyebrow="Master data"
        title="Alternatif Lokasi"
        description="Kelola identitas lokasi, koordinat, foto, serta nilai pada setiap kriteria."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" /> Impor Excel</Button>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Tambah Alternatif</Button>
          </div>
        }
      />
      <div className="mb-5 flex max-w-xs items-center">
        <div className="relative w-full"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari alternatif…" className="pl-9" /></div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-ocean/10 bg-white">
            <div className="relative h-40">
              <img src={item.photoUrl} alt={item.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean/65 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white"><h3 className="font-serif text-xl font-bold">{item.name}</h3><p className="mt-1 truncate text-[9px] text-white/65">{item.address}</p></div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="rounded-xl bg-mist/65 p-3"><div className="truncate text-[10px] font-semibold uppercase tracking-wide text-ink/60">{criterion.name}</div><div className="mt-1 font-data text-sm font-bold text-ocean">{formatNumber(item.values[criterion.id] ?? 0)} <span className="text-[10px] font-medium text-ink/50">{criterion.unit}</span></div></div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between"><span className="font-data text-[9px] text-ink/40">{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</span><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => { setEditing(item); setOpen(true); }}><Edit3 className="h-4 w-4" /></Button><Button size="icon" variant="danger" onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></Button></div></div>
            </div>
          </article>
        ))}
      </section>
      {!filtered.length ? <div className="rounded-2xl border border-dashed border-ocean/15 p-14 text-center text-xs text-ink/40">Belum ada alternatif yang cocok.</div> : null}
      <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) setEditing(null); }}>
        <DialogContent title={editing ? "Edit Alternatif" : "Tambah Alternatif"} description="Isi lokasi dan seluruh nilai kriteria agar dapat langsung dihitung.">
          <AlternativeForm initial={editing} criteria={criteria} onSave={save} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-4xl" title="Impor Alternatif Dari Excel" description="Gunakan template agar nama kolom dan nilai kriteria dapat dibaca dengan tepat.">
          <AlternativeImport
            criteria={criteria}
            onImport={(items) => {
              importAlternatives(items);
              toast.success(`${items.length} alternatif berhasil diimpor.`);
              setImportOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LandingPageView() {
  const media = useSmartlocStore((state) => state.landingMedia);
  const addMedia = useSmartlocStore((state) => state.addLandingMedia);
  const updateMedia = useSmartlocStore((state) => state.updateLandingMedia);
  const deleteMedia = useSmartlocStore((state) => state.deleteLandingMedia);
  const resetMedia = useSmartlocStore((state) => state.resetLandingMedia);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LandingMedia | null>(null);

  function save(input: Omit<LandingMedia, "id" | "createdAt">) {
    if (editing) updateMedia(editing.id, input);
    else addMedia(input);
    toast.success(editing ? "Media landing page diperbarui." : "Media landing page ditambahkan.");
    setOpen(false);
    setEditing(null);
  }

  function remove(item: LandingMedia) {
    if (!confirm(`Hapus media "${item.title}" dari landing page?`)) return;
    deleteMedia(item.id);
    toast.success("Media landing page dihapus.");
  }

  return (
    <>
      <PageIntro
        eyebrow="Etalase Publik"
        title="Landing Page"
        description="Atur foto dan video yang tampil di galeri landing page. Gunakan dokumentasi lokasi Anda sendiri agar halaman pembuka terasa nyata."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { resetMedia(); toast.success("Galeri landing page dikembalikan ke data demo."); }}><RotateCcw className="h-4 w-4" /> Reset Galeri</Button>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><ImagePlus className="h-4 w-4" /> Tambah Media</Button>
          </div>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Media" value={media.length} detail="Tampil di landing page" icon={ImagePlus} />
        <StatCard label="Foto" value={media.filter((item) => item.type === "image").length} detail="Dokumentasi visual lokasi" icon={MapPin} accent="land" />
        <StatCard label="Video" value={media.filter((item) => item.type === "video").length} detail="Cuplikan survei lapangan" icon={Video} accent="coral" />
      </div>
      <section className="rounded-2xl border border-orange-200 bg-white p-3 sm:p-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {media.map((item) => (
            <article key={item.id} className="flex min-h-[390px] flex-col overflow-hidden rounded-2xl border border-orange-100 bg-[#fffdf8] shadow-sm transition hover:-translate-y-0.5 hover:shadow-float">
              <div className="relative bg-mist p-3">
                {item.type === "image" ? (
                  <img src={item.url} alt={item.title} className="aspect-[4/3] h-[190px] w-full rounded-xl object-cover sm:h-[210px]" />
                ) : (
                  <video src={item.url} poster={item.posterUrl} controls className="aspect-[4/3] h-[190px] w-full rounded-xl object-cover sm:h-[210px]" />
                )}
                <Badge variant={item.type === "video" ? "coral" : "land"} className="absolute left-3 top-3">{item.type === "video" ? "Video" : "Foto"}</Badge>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="line-clamp-1 text-[10px] font-black uppercase tracking-[.16em] text-coral">{item.locationName}</div>
                <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-extrabold leading-5 text-ocean">{item.title}</h3>
                <p className="mt-2 line-clamp-2 min-h-12 text-xs leading-6 text-ink/60">{item.caption || "Belum ada keterangan media."}</p>
                <div className="mt-auto flex justify-end gap-2 pt-4">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(item); setOpen(true); }}><Edit3 className="h-3.5 w-3.5" /> Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(item)}><Trash2 className="h-3.5 w-3.5" /> Hapus</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!media.length ? <div className="p-12 text-center text-xs text-ink/45">Belum ada media. Tambahkan foto atau video untuk landing page.</div> : null}
      </section>
      <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) setEditing(null); }}>
        <DialogContent title={editing ? "Edit Media Landing Page" : "Tambah Media Landing Page"} description="Pilih foto atau video dari perangkat. Media baru tampil di landing page setelah tombol Simpan media ditekan.">
          <LandingMediaForm initial={editing} onSave={save} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function LandingMediaForm({ initial, onSave, onCancel }: {
  initial: LandingMedia | null;
  onSave: (input: Omit<LandingMedia, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [locationName, setLocationName] = useState(initial?.locationName ?? "");
  const [type, setType] = useState<"image" | "video">(initial?.type ?? "image");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [posterUrl] = useState(initial?.posterUrl ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState("");

  async function selectFile(file: File) {
    setError("");
    setProcessing(true);
    try {
      if (file.type.startsWith("image/")) {
        setType("image");
        setUrl(await compressLandingAdminPhoto(file));
        setFileName(file.name);
      } else if (file.type.startsWith("video/")) {
        if (file.size > 6 * 1024 * 1024) {
          setError("Video lokal maksimal 6 MB agar aman tersimpan di browser.");
          return;
        }
        setType("video");
        setUrl(await readFileAsDataUrl(file));
        setFileName(file.name);
      } else {
        setError("Gunakan file gambar atau video.");
      }
    } catch {
      setError("File tidak dapat diproses.");
    } finally {
      setProcessing(false);
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 3) return setError("Judul minimal 3 karakter.");
    if (locationName.trim().length < 3) return setError("Nama lokasi wajib diisi.");
    if (!url.trim()) return setError("Pilih file foto atau video terlebih dahulu.");
    onSave({
      title: title.trim(),
      locationName: locationName.trim(),
      type,
      url: url.trim(),
      posterUrl: type === "video" ? posterUrl.trim() || undefined : undefined,
      caption: caption.trim() || "Dokumentasi visual lokasi usaha."
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Judul Media" error={error} className="sm:col-span-2"><Input value={title} onChange={(event) => { setTitle(event.target.value); setError(""); }} placeholder="Contoh: Survei Boulevard pagi hari" /></Field>
      <Field label="Nama Lokasi"><Input value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="Contoh: Boulevard Manado" /></Field>
      <Field label="Jenis Media">
        <div className="flex h-11 items-center rounded-xl border border-orange-200 bg-mist px-3 text-sm font-bold text-ocean">
          {type === "video" ? <Video className="mr-2 h-4 w-4 text-coral" /> : <ImagePlus className="mr-2 h-4 w-4 text-coral" />}
          {type === "video" ? "Video 4:3" : "Foto 4:3"}
        </div>
      </Field>
      <Field label="Pilih Foto/Video" hint="Foto dan video ditampilkan 4:3. Klik Simpan media agar masuk ke landing page." className="sm:col-span-2">
        <label className={`inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-coral px-5 text-sm font-semibold text-white hover:bg-[#e85d00] ${processing ? "pointer-events-none opacity-60" : ""}`}>
          <Upload className="h-4 w-4" /> {processing ? "Memproses…" : "Pilih file"}
          <input
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            disabled={processing}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) selectFile(file);
              event.target.value = "";
            }}
          />
        </label>
        {fileName ? <div className="mt-2 text-[11px] font-semibold text-ink/55">File dipilih: {fileName}. Belum masuk landing page sampai disimpan.</div> : null}
        {!fileName && initial ? <div className="mt-2 text-[11px] font-semibold text-ink/55">Media saat ini akan tetap dipakai jika Anda tidak memilih file baru.</div> : null}
      </Field>
      {url ? (
        <div className="grid place-items-center overflow-hidden rounded-2xl border border-orange-200 bg-mist p-3 sm:col-span-2">
          {type === "image" ? <img src={url} alt="Preview media" className="aspect-[4/3] w-full rounded-xl object-cover" /> : <video src={url} poster={posterUrl} controls className="aspect-[4/3] w-full rounded-xl object-cover" />}
        </div>
      ) : null}
      <Field label="Keterangan" className="sm:col-span-2"><Input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Keterangan singkat media" /></Field>
      <div className="mt-3 flex justify-end gap-3 sm:col-span-2"><Button type="button" variant="outline" onClick={onCancel}>Batal</Button><Button type="submit">Simpan media</Button></div>
    </form>
  );
}

function compressLandingAdminPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const maximumSide = 1280;
      const scale = Math.min(1, maximumSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas tidak tersedia."));
        return;
      }
      context.fillStyle = "#FFFDF2";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gagal membaca gambar."));
    };
    image.src = objectUrl;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

function AlternativeForm({ initial, criteria, onSave, onCancel }: {
  initial: Alternative | null;
  criteria: Criteria[];
  onSave: (input: Omit<Alternative, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [latitude, setLatitude] = useState(initial ? String(initial.latitude) : "");
  const [longitude, setLongitude] = useState(initial ? String(initial.longitude) : "");
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(criteria.map((item) => [item.id, initial ? String(initial.values[item.id] ?? "") : ""])));
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  async function selectPhoto(file: File) {
    setPhotoError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return setPhotoError("Gunakan gambar JPG, PNG, atau WebP.");
    }
    if (file.size > 8 * 1024 * 1024) {
      return setPhotoError("Ukuran foto maksimal 8 MB.");
    }
    setIsProcessingPhoto(true);
    try {
      const compressed = await compressAlternativePhoto(file);
      setPhotoUrl(compressed);
    } catch {
      setPhotoError("Foto tidak dapat diproses. Coba pilih gambar lain.");
    } finally {
      setIsProcessingPhoto(false);
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 3) return setError("Nama lokasi minimal 3 karakter.");
    if (address.trim().length < 8) return setError("Alamat perlu dibuat lebih lengkap.");
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    if (!latitude || !longitude || parsedLatitude < -90 || parsedLatitude > 90 || parsedLongitude < -180 || parsedLongitude > 180) return setError("Koordinat tidak valid.");
    if (criteria.some((item) => values[item.id] === "" || !Number.isFinite(Number(values[item.id])))) return setError("Semua nilai kriteria wajib diisi.");
    onSave({
      name: name.trim(),
      address: address.trim(),
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      photoUrl: photoUrl.trim() || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
      values: Object.fromEntries(criteria.map((item) => [item.id, Number(values[item.id])]))
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Nama Lokasi" error={error} className="sm:col-span-2"><Input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Nama kawasan atau kecamatan" /></Field>
      <Field label="Alamat" className="sm:col-span-2"><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat lengkap" /></Field>
      <Field label="Latitude"><Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Contoh: 1.4748" /></Field>
      <Field label="Longitude"><Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Contoh: 124.8421" /></Field>
      <Field label="Foto Lokasi" error={photoError} hint="Unggah foto sendiri atau gunakan URL. Foto akan diperkecil otomatis agar ringan." className="sm:col-span-2">
        <div className="overflow-hidden rounded-2xl border border-orange-200 bg-mist/45">
          {photoUrl ? (
            <div className="relative h-48 bg-mist">
              <img src={photoUrl} alt="Preview foto lokasi" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => { setPhotoUrl(""); setPhotoError(""); }}
                className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-red-600 shadow-lg backdrop-blur hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus foto
              </button>
            </div>
          ) : (
            <div className="grid h-36 place-items-center px-5 text-center">
              <div>
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-land text-ink"><Upload className="h-5 w-5" /></div>
                <p className="mt-3 text-xs font-bold text-ocean">Belum ada foto lokasi</p>
                <p className="mt-1 text-[11px] text-ink/55">JPG, PNG, atau WebP · maksimal 8 MB</p>
              </div>
            </div>
          )}
          <div className="grid gap-3 border-t border-orange-200 bg-white p-4 sm:grid-cols-[auto_1fr]">
            <label className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-coral px-5 text-sm font-semibold text-white hover:bg-[#e85d00] ${isProcessingPhoto ? "pointer-events-none opacity-60" : ""}`}>
              <Upload className="h-4 w-4" /> {isProcessingPhoto ? "Memproses foto…" : photoUrl ? "Ganti foto" : "Pilih foto"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={isProcessingPhoto}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) selectPhoto(file);
                  event.target.value = "";
                }}
              />
            </label>
            <Input
              value={photoUrl.startsWith("data:") ? "" : photoUrl}
              onChange={(event) => { setPhotoUrl(event.target.value); setPhotoError(""); }}
              placeholder="Atau tempel URL foto"
              disabled={photoUrl.startsWith("data:")}
            />
          </div>
        </div>
      </Field>
      <div className="my-2 border-t border-ocean/10 sm:col-span-2" />
      {criteria.map((item) => (
        <Field key={item.id} label={`${item.name}${item.unit ? ` (${item.unit})` : ""}`}>
          <Input type="number" step="any" min="0" value={values[item.id] ?? ""} onChange={(e) => setValues((current) => ({ ...current, [item.id]: e.target.value }))} placeholder={`Masukkan ${item.name.toLowerCase()}`} />
        </Field>
      ))}
      <div className="mt-3 flex justify-end gap-3 sm:col-span-2"><Button type="button" variant="outline" onClick={onCancel}>Batal</Button><Button type="submit">Simpan alternatif</Button></div>
    </form>
  );
}

function compressAlternativePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const maximumSide = 1280;
      const scale = Math.min(1, maximumSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas tidak tersedia."));
        return;
      }
      context.fillStyle = "#FFFDF2";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gambar tidak valid."));
    };
    image.src = objectUrl;
  });
}

function AlternativeImport({ criteria, onImport }: {
  criteria: Criteria[];
  onImport: (items: Omit<Alternative, "id">[]) => void;
}) {
  const [items, setItems] = useState<Omit<Alternative, "id">[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");

  async function downloadTemplate() {
    const XLSX = await import("xlsx");
    const example = {
      nama_lokasi: "Contoh Lokasi",
      alamat: "Jl. Contoh No. 1, Manado",
      latitude: 1.4748,
      longitude: 124.8421,
      foto_url: "",
      ...Object.fromEntries(criteria.map((item) => [item.id, 10]))
    };
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet([example]);
    XLSX.utils.book_append_sheet(workbook, sheet, "alternatif");
    XLSX.writeFile(workbook, "template-alternatif-smartloc.xlsx");
  }

  async function readFile(file: File) {
    setFileName(file.name);
    setItems([]);
    setErrors([]);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const nextItems: Omit<Alternative, "id">[] = [];
      const nextErrors: string[] = [];
      rows.forEach((row, index) => {
        const rowNumber = index + 2;
        const name = String(row.nama_lokasi ?? "").trim();
        const address = String(row.alamat ?? "").trim();
        const latitude = Number(row.latitude);
        const longitude = Number(row.longitude);
        const criterionValues = Object.fromEntries(criteria.map((item) => [item.id, Number(row[item.id])]));
        const missingCriterion = criteria.find((item) => row[item.id] === "" || !Number.isFinite(Number(row[item.id])));
        if (!name || !address || !Number.isFinite(latitude) || !Number.isFinite(longitude) || missingCriterion) {
          nextErrors.push(`Baris ${rowNumber}: ${missingCriterion ? `nilai "${missingCriterion.id}" belum valid` : "nama, alamat, atau koordinat belum valid"}.`);
          return;
        }
        nextItems.push({
          name,
          address,
          latitude,
          longitude,
          photoUrl: String(row.foto_url ?? "").trim() || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
          values: criterionValues
        });
      });
      setItems(nextItems);
      setErrors(nextErrors);
    } catch {
      setErrors(["File tidak dapat dibaca. Pastikan formatnya .xlsx atau .xls dan mengikuti template."]);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={downloadTemplate}><FileSpreadsheet className="h-4 w-4" /> Unduh template Excel</Button>
        <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-coral px-5 text-sm font-semibold text-white hover:bg-[#e85d00]">
          <Upload className="h-4 w-4" /> Pilih file Excel
          <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={(event) => event.target.files?.[0] && readFile(event.target.files[0])} />
        </label>
      </div>
      {fileName ? <p className="mt-3 text-xs text-ink/50">File: <strong>{fileName}</strong></p> : null}
      {errors.length ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <strong>{errors.length} baris perlu diperbaiki:</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">{errors.slice(0, 8).map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}
      {items.length ? (
        <>
          <div className="mt-5 overflow-x-auto rounded-xl border border-orange-200">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-mist text-[9px] uppercase tracking-wider text-ink/45"><tr><th className="px-4 py-3">Lokasi</th><th className="px-4 py-3">Koordinat</th>{criteria.map((item) => <th key={item.id} className="px-4 py-3">{item.id}</th>)}</tr></thead>
              <tbody className="divide-y divide-orange-100">{items.slice(0, 10).map((item, index) => <tr key={`${item.name}-${index}`}><td className="px-4 py-3 font-bold text-ocean">{item.name}</td><td className="px-4 py-3 font-data">{item.latitude}, {item.longitude}</td>{criteria.map((criterion) => <td key={criterion.id} className="px-4 py-3 font-data">{item.values[criterion.id]}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4"><p className="text-xs text-ink/50">{items.length} baris valid siap diimpor.</p><Button onClick={() => onImport(items)}><Upload className="h-4 w-4" /> Impor data valid</Button></div>
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-orange-200 p-8 text-center text-xs text-ink/45">Belum ada file yang dipilih.</div>
      )}
    </div>
  );
}

export function UsersView({ currentUserId }: { currentUserId: string }) {
  const users = useSmartlocStore((state) => state.users);
  const deleteUser = useSmartlocStore((state) => state.deleteUser);
  function remove(user: User) {
    if (user.id === currentUserId) return toast.error("Akun yang sedang digunakan tidak dapat dihapus.");
    if (!confirm(`Hapus pengguna "${user.name}"?`)) return;
    deleteUser(user.id);
    toast.success("Pengguna dihapus.");
  }
  return (
    <>
      <PageIntro eyebrow="Akses Sistem" title="Manajemen Pengguna" description="Lihat akun yang terdaftar dan perannya pada prototipe SMARTLOC." />
      <section className="overflow-hidden rounded-2xl border border-ocean/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-mist/70 text-[9px] font-bold uppercase tracking-[.14em] text-ink/40"><tr><th className="px-5 py-4">Pengguna</th><th className="px-5 py-4">Peran</th><th className="px-5 py-4">Terdaftar</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-ocean/7">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-ocean text-sm font-bold text-white">{user.name.charAt(0)}</div><div><div className="text-xs font-bold text-ocean">{user.name}</div><div className="mt-1 text-[9px] text-ink/40">{user.email}</div></div></div></td>
                  <td className="px-5 py-4"><Badge variant={user.role === "admin" ? "coral" : "sea"}>{user.role}</Badge></td>
                  <td className="px-5 py-4 font-data text-[10px] text-ink/50">{new Date(user.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-[10px] font-bold text-[#55735d]"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Aktif</span></td>
                  <td className="px-5 py-4 text-right"><Button size="icon" variant="danger" onClick={() => remove(user)} disabled={user.id === currentUserId}><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export function ExpertView({ isAdmin }: { isAdmin: boolean }) {
  const datasets = useSmartlocStore((state) => state.expertDatasets) ?? [];
  const importDataset = useSmartlocStore((state) => state.importExpertDataset);
  const deleteDataset = useSmartlocStore((state) => state.deleteExpertDataset);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(datasets[0]?.id ?? "");
  const selected = datasets.find((item) => item.id === selectedId) ?? datasets[0];
  const [expertMethod, setExpertMethod] = useState<RankingMethod>("SMART");
  const ranking = expertMethod === "SMART" ? selected?.smartRanking : selected?.sawRanking;

  return (
    <>
      <PageIntro
        eyebrow="Penilaian Profesional"
        title={isAdmin ? "Data Rekomendasi Expert" : "Rekomendasi Lokasi Dari Expert"}
        description={isAdmin ? "Impor satu paket data expert berisi kriteria, alternatif, perhitungan SMART/SAW, dan ranking." : "Audit alternatif, kriteria, dan hasil perhitungan SMART/SAW dari dataset expert."}
        action={isAdmin ? <Button onClick={() => setOpen(true)}><Upload className="h-4 w-4" /> Impor data expert</Button> : undefined}
      />
      {selected ? (
        <div className="space-y-5">
          <section className="rounded-2xl border border-orange-200 bg-white p-5">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2 text-sm font-extrabold text-ocean"><BrainCircuit className="h-5 w-5 shrink-0 text-coral" /> <span className="min-w-0 break-words">{selected.expertName}</span></div>
                <p className="mt-1 text-xs font-medium text-ink/60">{selected.expertise} · {selected.source}</p>
                <p className="mt-3 max-w-3xl text-xs leading-6 text-ink/65">{selected.notes}</p>
              </div>
              <div className="flex min-w-0 w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
                {datasets.length > 1 ? <select value={selected.id} onChange={(event) => setSelectedId(event.target.value)} className="h-11 w-full min-w-0 max-w-full rounded-xl border-orange-200 bg-white px-3 text-xs font-semibold text-ocean sm:w-auto sm:max-w-[360px] lg:max-w-[420px]" aria-label="Pilih dataset expert">{datasets.map((item) => <option key={item.id} value={item.id}>{item.expertName} — {item.source}</option>)}</select> : null}
                {isAdmin ? <Button size="sm" variant="danger" onClick={() => { if (confirm("Hapus dataset expert ini?")) deleteDataset(selected.id); }}><Trash2 className="h-3.5 w-3.5" /> Hapus dataset</Button> : null}
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Kriteria Expert" value={selected.criteria.length} detail={`${selected.criteria.reduce((sum, item) => sum + item.weight, 0)}% total bobot`} icon={BarChart3} />
            <StatCard label="Alternatif Expert" value={selected.alternatives.length} detail="Lokasi yang dianalisis" icon={MapPin} accent="land" />
            <StatCard label="Metode Dihitung" value="2" detail="SMART dan SAW" icon={Calculator} accent="coral" />
          </div>

          <section className="rounded-2xl border border-orange-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="font-serif text-xl font-bold text-ocean">Ranking Dataset Expert</h3><p className="mt-1 text-xs text-ink/60">Hasil dihitung ulang dari snapshot data yang diimpor.</p></div>
              <div className="flex rounded-xl bg-mist p-1">{(["SMART", "SAW"] as RankingMethod[]).map((item) => <button key={item} onClick={() => setExpertMethod(item)} className={`rounded-lg px-4 py-2 text-xs font-bold ${expertMethod === item ? "bg-coral text-white" : "text-ink/60"}`}>{item}</button>)}</div>
            </div>
            <div className="mt-5 grid gap-3">
              {ranking?.map((item) => {
                const alternative = selected.alternatives.find((alt) => alt.id === item.alternativeId);
                return <div key={item.alternativeId} className="grid gap-3 rounded-xl border border-orange-100 p-4 sm:grid-cols-[48px_1fr_auto] sm:items-center"><div className={`grid h-10 w-10 place-items-center rounded-xl font-bold ${item.rank === 1 ? "bg-coral text-white" : "bg-mist text-ocean"}`}>{item.rank}</div><div><div className="text-sm font-extrabold text-ocean">{item.locationName}</div><div className="mt-1 text-xs text-ink/60">{alternative?.address}</div><div className="mt-2 flex flex-wrap gap-2">{selected.criteria.map((criterion) => <span key={criterion.id} className="rounded-lg bg-mist px-2 py-1 text-[10px] font-semibold text-ink/70">{criterion.name}: {formatNumber(alternative?.values[criterion.id] ?? 0)}</span>)}</div></div><div className="font-data text-xl font-extrabold text-sea">{formatScore(item.score)}</div></div>;
              })}
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-orange-200 p-14 text-center">
          <BrainCircuit className="mx-auto h-8 w-8 text-coral" />
          <h3 className="mt-4 font-serif text-lg font-bold text-ocean">Belum Ada Data Expert</h3>
          <p className="mt-2 text-xs text-ink/60">{isAdmin ? "Impor workbook Excel berisi sheet kriteria dan alternatif." : "Administrator belum mengunggah dataset expert."}</p>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl" title="Impor Dataset Expert" description="Workbook berisi metadata expert, data kriteria, dan alternatif. SMART, SAW, serta ranking dihitung otomatis saat impor.">
          <ExpertImport onImport={(item) => { importDataset(item); toast.success("Dataset expert dan hasil ranking berhasil diimpor."); setOpen(false); }} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ExpertImport({ onImport }: {
  onImport: (item: Omit<ExpertDataset, "id" | "importedAt">) => void;
}) {
  const [dataset, setDataset] = useState<Omit<ExpertDataset, "id" | "importedAt"> | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function downloadTemplate() {
    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["nama_expert", "Tim Expert"], ["keahlian", "Perencanaan wilayah"], ["sumber", "Kajian Expert"], ["catatan", "Catatan dataset"]]), "metadata");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ id: "population", nama: "Jumlah penduduk", bobot: 25, jenis: "benefit", satuan: "jiwa", atribut: "Potensi pasar" }, { id: "rent", nama: "Harga sewa", bobot: 25, jenis: "cost", satuan: "jt/bln", atribut: "Biaya operasional" }]), "kriteria");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ id: "lokasi-1", nama_lokasi: "Contoh Lokasi", alamat: "Manado", latitude: 1.48, longitude: 124.84, foto_url: "", population: 40000, rent: 8 }]), "alternatif");
    XLSX.writeFile(workbook, "template-dataset-expert-smartloc.xlsx");
  }

  async function readFile(file: File) {
    setDataset(null);
    setErrors([]);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      if (!workbook.Sheets.metadata || !workbook.Sheets.kriteria || !workbook.Sheets.alternatif) throw new Error();
      const metadataRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets.metadata, { header: 1, defval: "" });
      const metadata = Object.fromEntries(metadataRows.map((row) => [String(row[0]), String(row[1])]));
      const criteriaRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets.kriteria, { defval: "" });
      const criteria: Criteria[] = criteriaRows.map((row, index) => ({ id: String(row.id || `kriteria-${index + 1}`).trim(), name: String(row.nama).trim(), weight: Number(row.bobot), kind: String(row.jenis).toLowerCase() === "cost" ? "cost" : "benefit", unit: String(row.satuan ?? ""), attribute: String(row.atribut ?? "") }));
      const alternativeRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets.alternatif, { defval: "" });
      const alternatives: Alternative[] = alternativeRows.map((row, index) => ({ id: String(row.id || `expert-alt-${index + 1}`).trim(), name: String(row.nama_lokasi).trim(), address: String(row.alamat).trim(), latitude: Number(row.latitude), longitude: Number(row.longitude), photoUrl: String(row.foto_url || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80"), values: Object.fromEntries(criteria.map((criterion) => [criterion.id, Number(row[criterion.id])])) }));
      if (!criteria.length || !alternatives.length || criteria.some((item) => !item.name || !Number.isFinite(item.weight)) || alternatives.some((item) => !item.name || !Number.isFinite(item.latitude) || !Number.isFinite(item.longitude) || criteria.some((criterion) => !Number.isFinite(item.values[criterion.id])))) throw new Error();
      const smart = calculateRanking("SMART", criteria, alternatives);
      const saw = calculateRanking("SAW", criteria, alternatives);
      setDataset({ expertName: metadata.nama_expert || "Expert SMARTLOC", expertise: metadata.keahlian || "Expert lokasi usaha", source: metadata.sumber || file.name, notes: metadata.catatan || "", criteria, alternatives, smartRanking: smart.map((item) => ({ alternativeId: item.alternative.id, locationName: item.alternative.name, score: item.score, rank: item.rank, utilities: item.utilities })), sawRanking: saw.map((item) => ({ alternativeId: item.alternative.id, locationName: item.alternative.name, score: item.score, rank: item.rank, utilities: item.utilities })) });
    } catch {
      setErrors(["File tidak valid. Pastikan terdapat sheet metadata, kriteria, dan alternatif dengan kolom sesuai template."]);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={downloadTemplate}><FileSpreadsheet className="h-4 w-4" /> Unduh template dataset</Button>
        <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-coral px-5 text-sm font-semibold text-white hover:bg-[#e85d00]">
          <Upload className="h-4 w-4" /> Pilih file expert
          <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={(event) => event.target.files?.[0] && readFile(event.target.files[0])} />
        </label>
      </div>
      {errors.length ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">{errors.slice(0, 8).map((error) => <div key={error}>{error}</div>)}</div> : null}
      {dataset ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><StatCard label="Expert" value={dataset.expertName} detail={dataset.expertise} icon={BrainCircuit} /><StatCard label="Kriteria" value={dataset.criteria.length} detail={`${dataset.criteria.reduce((sum, item) => sum + item.weight, 0)}% bobot`} icon={BarChart3} /><StatCard label="Alternatif" value={dataset.alternatives.length} detail="SMART & SAW siap" icon={MapPin} /></div>
          <div className="mt-5 rounded-xl border border-orange-200 p-4"><h4 className="text-sm font-bold text-ocean">Preview Ranking SMART</h4><div className="mt-3 space-y-2">{dataset.smartRanking.slice(0, 5).map((item) => <div key={item.alternativeId} className="flex justify-between rounded-lg bg-mist px-3 py-2 text-xs"><span>#{item.rank} {item.locationName}</span><strong>{formatScore(item.score)}</strong></div>)}</div></div>
          <div className="mt-5 flex justify-end"><Button onClick={() => onImport(dataset)}><Upload className="h-4 w-4" /> Impor Dataset Expert</Button></div>
        </>
      ) : <div className="mt-5 rounded-xl border border-dashed border-orange-200 p-8 text-center text-xs text-ink/45">Belum ada file yang dipilih.</div>}
    </div>
  );
}

export function ReportsView({ method, results, criteria }: {
  method: RankingMethod;
  results: RankingResult[];
  criteria: Criteria[];
}) {
  async function exportPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`SMARTLOC - Laporan ${method}`, 18, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Dibuat ${new Date().toLocaleString("id-ID")} | ${results.length} alternatif`, 18, 29);
    let y = 42;
    results.forEach((item) => {
      doc.setFont("helvetica", item.rank === 1 ? "bold" : "normal");
      doc.text(`${item.rank}. ${item.alternative.name}`, 18, y);
      doc.text(formatScore(item.score), 180, y, { align: "right" });
      y += 8;
    });
    doc.save(`smartloc-ranking-${method.toLowerCase()}.pdf`);
    toast.success("Laporan PDF diunduh.");
  }

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const rows = results.map((item) => ({
      Peringkat: item.rank,
      Lokasi: item.alternative.name,
      Alamat: item.alternative.address,
      Metode: method,
      Skor: item.score,
      ...Object.fromEntries(criteria.map((criterion) => [criterion.name, item.alternative.values[criterion.id] ?? 0]))
    }));
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, `Ranking ${method}`);
    XLSX.writeFile(workbook, `smartloc-ranking-${method.toLowerCase()}.xlsx`);
    toast.success("Laporan Excel diunduh.");
  }

  const smart = calculateRanking("SMART", criteria, useSmartlocStore.getState().alternatives);
  const saw = calculateRanking("SAW", criteria, useSmartlocStore.getState().alternatives);

  return (
    <>
      <PageIntro
        eyebrow="Dokumen Keputusan"
        title={`Laporan Perankingan ${method}`}
        description="Cetak tampilan ini atau ekspor hasil ke PDF dan Excel untuk dokumentasi."
        action={<div className="no-print flex flex-wrap gap-2"><Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Cetak</Button><Button variant="outline" onClick={exportExcel}><Download className="h-4 w-4" /> Excel</Button><Button onClick={exportPdf}><FileDown className="h-4 w-4" /> PDF</Button></div>}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Alternatif" value={results.length} detail="Lokasi dalam laporan" icon={Building2} />
        <StatCard label="Skor Tertinggi" value={results[0] ? formatScore(results[0].score) : "—"} detail={results[0]?.alternative.name ?? "Belum ada"} icon={Award} accent="coral" />
        <StatCard label="Bobot Total" value={`${criteria.reduce((sum, item) => sum + item.weight, 0)}%`} detail={`${criteria.length} kriteria aktif`} icon={ShieldCheck} accent="land" />
      </div>
      <section className="print-card overflow-hidden rounded-2xl border border-ocean/10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-ocean/10 p-6">
          <div><div className="font-serif text-2xl font-bold text-ocean">SMARTLOC</div><div className="mt-1 text-[9px] uppercase tracking-[.18em] text-sea">Laporan keputusan lokasi usaha Manado</div></div>
          <Badge variant="coral">Metode {method}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-mist/70 text-[9px] font-bold uppercase tracking-[.14em] text-ink/40"><tr><th className="px-6 py-4">Rank</th><th className="px-6 py-4">Lokasi</th><th className="px-6 py-4">Koordinat</th><th className="px-6 py-4">SMART</th><th className="px-6 py-4">SAW</th><th className="px-6 py-4 text-right">Skor terpilih</th></tr></thead>
            <tbody className="divide-y divide-ocean/7">
              {results.map((item) => (
                <tr key={item.alternative.id}>
                  <td className="px-6 py-4 font-data text-xs font-bold text-ocean">#{item.rank}</td>
                  <td className="px-6 py-4"><div className="text-xs font-bold text-ocean">{item.alternative.name}</div><div className="mt-1 max-w-xs truncate text-[9px] text-ink/40">{item.alternative.address}</div></td>
                  <td className="px-6 py-4 font-data text-[9px] text-ink/45">{item.alternative.latitude.toFixed(4)}, {item.alternative.longitude.toFixed(4)}</td>
                  <td className="px-6 py-4 font-data text-xs text-ink/55">{formatScore(smart.find((x) => x.alternative.id === item.alternative.id)?.score ?? 0)}</td>
                  <td className="px-6 py-4 font-data text-xs text-ink/55">{formatScore(saw.find((x) => x.alternative.id === item.alternative.id)?.score ?? 0)}</td>
                  <td className="px-6 py-4 text-right font-data text-sm font-bold text-sea">{formatScore(item.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-ocean/10 p-6 text-[9px] text-ink/40 sm:flex-row">
          <span>Dihasilkan otomatis oleh SMARTLOC.</span><span>{new Date().toLocaleString("id-ID")}</span>
        </div>
      </section>
    </>
  );
}
