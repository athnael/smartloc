import type { Alternative, Criteria, RankingMethod, RankingResult } from "./types";

function safeWeightTotal(criteria: Criteria[]) {
  const total = criteria.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
  return total || 1;
}

export function calculateSmart(criteria: Criteria[], alternatives: Alternative[]): RankingResult[] {
  if (!criteria.length || !alternatives.length) return [];
  const totalWeight = safeWeightTotal(criteria);

  const results = alternatives.map((alternative) => {
    const utilities: Record<string, number> = {};
    let score = 0;

    criteria.forEach((criterion) => {
      const values = alternatives.map((item) => Number(item.values[criterion.id] ?? 0));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const current = Number(alternative.values[criterion.id] ?? 0);
      const range = max - min;
      const utility = range === 0
        ? 1
        : criterion.kind === "benefit"
          ? (current - min) / range
          : (max - current) / range;
      utilities[criterion.id] = utility;
      score += utility * (Math.max(0, criterion.weight) / totalWeight);
    });

    return { alternative, score, utilities, rank: 0 };
  });

  return results
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function calculateSaw(criteria: Criteria[], alternatives: Alternative[]): RankingResult[] {
  if (!criteria.length || !alternatives.length) return [];
  const totalWeight = safeWeightTotal(criteria);

  const results = alternatives.map((alternative) => {
    const utilities: Record<string, number> = {};
    let score = 0;

    criteria.forEach((criterion) => {
      const values = alternatives.map((item) => Math.max(0, Number(item.values[criterion.id] ?? 0)));
      const current = Math.max(0, Number(alternative.values[criterion.id] ?? 0));
      const max = Math.max(...values);
      const positive = values.filter((value) => value > 0);
      const min = positive.length ? Math.min(...positive) : 0;
      const normalized = criterion.kind === "benefit"
        ? (max === 0 ? 1 : current / max)
        : (current === 0 ? (min === 0 ? 1 : 0) : min / current);
      utilities[criterion.id] = normalized;
      score += normalized * (Math.max(0, criterion.weight) / totalWeight);
    });

    return { alternative, score, utilities, rank: 0 };
  });

  return results
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function calculateRanking(method: RankingMethod, criteria: Criteria[], alternatives: Alternative[]) {
  return method === "SMART"
    ? calculateSmart(criteria, alternatives)
    : calculateSaw(criteria, alternatives);
}
