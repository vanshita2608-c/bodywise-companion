import { adherence, expectedAt, improvement, productOf } from "./logic";
import type { Journey } from "./types";

/**
 * ML forecast: fits a regression to the user's own weekly check-ins and projects
 * where they'll be at the product's "judge week".
 *
 * Model: improvement(w) = a · (w / judgeWeek)^0.8, the same saturating shape as the typical
 * curve, fitted by ridge regression on (week, improvement) points, shrunk toward the typical
 * result (a Bayesian-style prior) so 2–3 noisy check-ins can't produce wild projections.
 * Residual spread gives an uncertainty band and a probability (normal CDF) of reaching
 * a "meaningful result" (60% of the typical improvement). Consistency below 80% widens the band.
 */
export type Forecast = {
  projected: number; // 0..1 at judge week
  low: number;
  high: number;
  chance: number; // 0..1 probability of a meaningful result
  projectedPct: number;
  lowPct: number;
  highPct: number;
  chancePct: number;
  status: "on-track" | "borderline" | "at-risk";
  points: number;
  judgeWeek: number;
};

export function forecast(j: Journey): Forecast | null {
  const p = productOf(j);
  const pts = j.weekly.filter((w) => w.week > 0).map((w) => ({ x: Math.pow(w.week / p.judgeWeek, 0.8), y: improvement(j, w.scores) }));
  if (pts.length < 2) return null; // need at least 2 check-ins to see a trend

  // ridge regression through origin with prior = typical improvement: a = (Σxy + λ·prior) / (Σx² + λ)
  const LAMBDA = 1;
  const sxx = pts.reduce((s, q) => s + q.x * q.x, 0);
  const sxy = pts.reduce((s, q) => s + q.x * q.y, 0);
  const a = (sxy + LAMBDA * p.typical) / (sxx + LAMBDA);

  // residual standard error (with a floor so 2–3 points don't look falsely certain)
  const rss = pts.reduce((s, q) => s + (q.y - a * q.x) ** 2, 0);
  const se = Math.sqrt(rss / Math.max(1, pts.length - 1));
  const adh = adherence(j, 14) ?? 1;
  const spread = Math.max(0.06, se) * (1 + 2 / pts.length) * (adh < 0.8 ? 1.4 : 1);

  const projected = clamp(a, -0.2, 1);
  const low = clamp(projected - 1.28 * spread, -0.2, 1); // ~80% interval
  const high = clamp(projected + 1.28 * spread, -0.2, 1);
  const threshold = expectedAt(p.judgeWeek, p) * 0.6;
  // never claim certainty from a handful of self-ratings
  const chance = Math.min(0.95, Math.max(0.05, normalCdf((projected - threshold) / spread)));
  const status = chance >= 0.7 ? "on-track" : chance >= 0.4 ? "borderline" : "at-risk";

  return {
    projected, low, high, chance, status,
    projectedPct: Math.round(projected * 100),
    lowPct: Math.round(low * 100),
    highPct: Math.round(high * 100),
    chancePct: Math.round(chance * 100),
    points: pts.length,
    judgeWeek: p.judgeWeek,
  };
}

/**
 * Projected improvement at `week` for the chart: continues smoothly from the user's latest
 * check-in (lastWeek, lastValue) along the curve's shape to the forecast at the judge week.
 */
export function projectedAt(j: Journey, week: number, fc: Forecast, lastWeek: number, lastValue: number) {
  const p = productOf(j);
  const s = (w: number) => Math.pow(Math.min(1, w / p.judgeWeek), 0.8);
  const t = (s(week) - s(lastWeek)) / Math.max(1e-6, 1 - s(lastWeek));
  return clamp(lastValue + (fc.projected - lastValue) * t, -0.2, 1);
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Abramowitz–Stegun approximation of the standard normal CDF
function normalCdf(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}
