import { calculateSaw, calculateSmart } from "./ranking";
import type { Alternative, Criteria, ExpertDataset, LandingMedia, User } from "./types";

export const seedUsers: User[] = [
  {
    id: "usr-admin",
    name: "Admin SMARTLOC",
    email: "admin@smartloc.id",
    password: "admin123",
    role: "admin",
    createdAt: "2026-05-10"
  },
  {
    id: "usr-demo",
    name: "Maria Tumbel",
    email: "user@smartloc.id",
    password: "user123",
    role: "user",
    createdAt: "2026-06-02"
  },
  {
    id: "usr-andi",
    name: "Andi Waworuntu",
    email: "andi@usaha.id",
    password: "usaha123",
    role: "user",
    createdAt: "2026-06-14"
  }
];

export const seedCriteria: Criteria[] = [
  { id: "population", name: "Jumlah penduduk", weight: 25, kind: "benefit", unit: "jiwa", attribute: "Potensi pasar" },
  { id: "area", name: "Luas daerah", weight: 15, kind: "benefit", unit: "km²", attribute: "Cakupan wilayah" },
  { id: "distance", name: "Jarak ke pusat kota", weight: 20, kind: "cost", unit: "km", attribute: "Aksesibilitas" },
  { id: "rent", name: "Harga sewa", weight: 25, kind: "cost", unit: "Rp", attribute: "Biaya operasional" },
  { id: "competition", name: "Persaingan", weight: 15, kind: "cost", unit: "usaha", attribute: "Kompetitor sejenis" }
];

export const seedAlternatives: Alternative[] = [
  {
    id: "megamas",
    name: "Kawasan Megamas",
    address: "Jl. Laksda John Lie, Wenang Selatan, Manado",
    latitude: 1.4827,
    longitude: 124.8345,
    photoUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    values: { population: 32850, area: 3.64, distance: 1.2, rent: 18, competition: 42 }
  },
  {
    id: "boulevard",
    name: "Boulevard Manado",
    address: "Jl. Piere Tendean, Sario, Manado",
    latitude: 1.4748,
    longitude: 124.8322,
    photoUrl: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=900&q=80",
    values: { population: 30120, area: 2.85, distance: 2.1, rent: 15, competition: 35 }
  },
  {
    id: "paal-dua",
    name: "Paal Dua",
    address: "Jl. Yos Sudarso, Paal Dua, Manado",
    latitude: 1.4878,
    longitude: 124.8596,
    photoUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
    values: { population: 36940, area: 8.02, distance: 4.8, rent: 8, competition: 24 }
  },
  {
    id: "malalayang",
    name: "Malalayang",
    address: "Jl. Wolter Monginsidi, Malalayang, Manado",
    latitude: 1.4579,
    longitude: 124.7992,
    photoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    values: { population: 61500, area: 17.12, distance: 6.5, rent: 10, competition: 28 }
  },
  {
    id: "mapanget",
    name: "Mapanget",
    address: "Jl. A.A. Maramis, Mapanget, Manado",
    latitude: 1.5229,
    longitude: 124.8914,
    photoUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
    values: { population: 63100, area: 49.75, distance: 10.4, rent: 6, competition: 16 }
  }
];

export const seedLandingMedia: LandingMedia[] = [
  {
    id: "landing-megamas-1",
    title: "Megamas sore hari",
    locationName: "Kawasan Megamas",
    type: "image",
    url: seedAlternatives[0].photoUrl,
    caption: "Area tepi laut dengan arus kunjungan tinggi.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-megamas-2",
    title: "Koridor komersial Megamas",
    locationName: "Kawasan Megamas",
    type: "image",
    url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
    caption: "Visual kepadatan usaha dan akses utama.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-boulevard-1",
    title: "Boulevard Manado",
    locationName: "Boulevard Manado",
    type: "image",
    url: seedAlternatives[1].photoUrl,
    caption: "Ruang usaha di jalur strategis kota.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-boulevard-2",
    title: "Aktivitas ruko Boulevard",
    locationName: "Boulevard Manado",
    type: "image",
    url: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=900&q=80",
    caption: "Kawasan dengan visibilitas tinggi untuk pelanggan.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-paaldua-1",
    title: "Paal Dua",
    locationName: "Paal Dua",
    type: "image",
    url: seedAlternatives[2].photoUrl,
    caption: "Alternatif lokasi dengan biaya operasional lebih ringan.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-paaldua-2",
    title: "Akses Paal Dua",
    locationName: "Paal Dua",
    type: "image",
    url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    caption: "Akses jalan dan aktivitas sekitar lokasi.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-malalayang-1",
    title: "Malalayang",
    locationName: "Malalayang",
    type: "image",
    url: seedAlternatives[3].photoUrl,
    caption: "Kawasan padat penduduk dengan potensi pasar besar.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-malalayang-2",
    title: "Titik usaha Malalayang",
    locationName: "Malalayang",
    type: "image",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    caption: "Dokumentasi titik usaha dan sebaran aktivitas.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-mapanget-1",
    title: "Mapanget",
    locationName: "Mapanget",
    type: "image",
    url: seedAlternatives[4].photoUrl,
    caption: "Wilayah berkembang dengan ruang ekspansi luas.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-mapanget-2",
    title: "Akses Mapanget",
    locationName: "Mapanget",
    type: "image",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    caption: "Koridor penghubung menuju kawasan usaha baru.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-video-survei-1",
    title: "Video Lokasi Megamas",
    locationName: "Kawasan Megamas",
    type: "video",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    posterUrl: seedAlternatives[0].photoUrl,
    caption: "Contoh slot video survei; admin dapat mengganti dengan video lapangan sendiri.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-video-survei-2",
    title: "Video Lokasi Mapanget",
    locationName: "Mapanget",
    type: "video",
    url: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    posterUrl: seedAlternatives[4].photoUrl,
    caption: "Contoh slot video dokumentasi rute dan suasana lokasi.",
    createdAt: "2026-06-01"
  },
  {
    id: "landing-video-survei-3",
    title: "Video Lokasi Boulevard",
    locationName: "Boulevard Manado",
    type: "video",
    url: "https://media.w3.org/2010/05/bunny/trailer.mp4",
    posterUrl: seedAlternatives[1].photoUrl,
    caption: "Contoh slot video vertikal untuk aktivitas dan kepadatan sekitar lokasi.",
    createdAt: "2026-06-01"
  }
];

const seedExpertAlternatives = seedAlternatives.slice(2);
const expertSmart = calculateSmart(seedCriteria, seedExpertAlternatives);
const expertSaw = calculateSaw(seedCriteria, seedExpertAlternatives);

export const seedExpertDatasets: ExpertDataset[] = [{
  id: "expert-dataset-demo",
  expertName: "Tim Expert SMARTLOC",
  expertise: "Pengembangan UMKM dan perencanaan wilayah",
  source: "Workshop Lokasi Usaha Manado 2026",
  importedAt: "2026-06-15",
  notes: "Dataset pembanding yang disusun oleh expert menggunakan lima kriteria utama SMARTLOC.",
  criteria: seedCriteria,
  alternatives: seedExpertAlternatives,
  smartRanking: expertSmart.map((item) => ({
    alternativeId: item.alternative.id,
    locationName: item.alternative.name,
    score: item.score,
    rank: item.rank,
    utilities: item.utilities
  })),
  sawRanking: expertSaw.map((item) => ({
    alternativeId: item.alternative.id,
    locationName: item.alternative.name,
    score: item.score,
    rank: item.rank,
    utilities: item.utilities
  }))
}];
