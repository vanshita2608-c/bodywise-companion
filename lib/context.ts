import { adherence, improvement, keyStepRate, productOf, verdict, weekNo } from "./logic";
import { forecast } from "./predict";
import { PRODUCTS, SCALE } from "./products";
import type { Journey, ProductId } from "./types";

/**
 * A compact, privacy-safe summary of the user's journey that we send to the AI.
 * No names, phone numbers or photos, only product, ratings and usage stats.
 */
export function journeySummary(j: Journey) {
  const p = productOf(j);
  const fc = forecast(j);
  const label = (scores: Record<string, number>) =>
    p.markers.map((m) => `${m.label}: ${SCALE[scores[m.id] ?? 0]}`).join("; ");
  return {
    product: p.name,
    concern: j.concern,
    hadConcernFor: j.duration,
    weeksCompleted: weekNo(j),
    judgeWeek: p.judgeWeek,
    keyStep: p.keyStep,
    baseline: label(j.baseline),
    checkins: j.weekly.map((w) => ({
      week: w.week,
      ratings: label(w.scores),
      improvementPct: Math.round(improvement(j, w.scores) * 100),
      otherChanges: w.changes,
    })),
    daysUsedLast14Pct: pctOrNull(adherence(j, 14)),
    keyStepDonePct: pctOrNull(keyStepRate(j)),
    appVerdict: verdict(j).label,
    forecast: fc
      ? { projectedPctAtJudgeWeek: fc.projectedPct, range: `${fc.lowPct}–${fc.highPct}%`, chanceOfMeaningfulResult: `${fc.chancePct}%` }
      : "not enough check-ins yet",
  };
}

const pctOrNull = (v: number | null) => (v === null ? null : Math.round(v * 100));

/** Product facts the AI should ground its answers in. */
export function productFacts(id: ProductId) {
  const p = PRODUCTS[id];
  return [
    `Product: ${p.name} (${p.category})`,
    `Used for: ${p.concerns.join(", ")}`,
    `How to use: ${p.steps.map((s, i) => `${i + 1}. ${s.text}${s.key ? " (KEY STEP)" : ""}`).join(" ")}`,
    `Most common mistake: ${p.mistake}`,
    `Typical timeline: ${p.timeline.map((t) => `week ${t.week}: ${t.text}`).join(" | ")}`,
    `Fair point to judge: week ${p.judgeWeek}`,
    `Watch out for: ${p.watch}`,
  ].join("\n");
}
