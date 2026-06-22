export type Role = "admin" | "user";
export type CriteriaKind = "benefit" | "cost";
export type RankingMethod = "SMART" | "SAW";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
}

export interface Criteria {
  id: string;
  name: string;
  weight: number;
  kind: CriteriaKind;
  attribute?: string;
  unit?: string;
}

export interface Alternative {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  values: Record<string, number>;
}

export interface LandingMedia {
  id: string;
  title: string;
  locationName: string;
  type: "image" | "video";
  url: string;
  posterUrl?: string;
  caption: string;
  createdAt: string;
}

export interface RankingResult {
  alternative: Alternative;
  score: number;
  rank: number;
  utilities: Record<string, number>;
}

export interface ExpertRankResult {
  alternativeId: string;
  locationName: string;
  score: number;
  rank: number;
  utilities: Record<string, number>;
}

export interface ExpertDataset {
  id: string;
  expertName: string;
  expertise: string;
  source: string;
  importedAt: string;
  notes: string;
  criteria: Criteria[];
  alternatives: Alternative[];
  smartRanking: ExpertRankResult[];
  sawRanking: ExpertRankResult[];
}
