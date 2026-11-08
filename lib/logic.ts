import { PRODUCTS } from "./products";
import type { Journey, Product, Scores } from "./types";

export const DAY = 86_400_000;

export const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const productOf = (j: Journey) => PRODUCTS[j.product];
export const daysSince = (j: Journey) => Math.floor((startOfDay(Date.now()) - startOfDay(j.start)) / DAY);
/** Completed weeks since starting. */
export const weekNo = (j: Journey) => Math.floor(daysSince(j) / 7);

function primaryAvg(scores: Scores, p: Product) {
  const ms = p.markers.filter((m) => m.primary);
  return ms.reduce((a, m) => a + (scores[m.id] ?? 0), 0) / ms.length;
}

/** Improvement in primary concerns vs baseline: 0 = same, 1 = fully gone, negative = worse. */
export function improvement(j: Journey, scores: Scores) {
  const p = productOf(j);
  const b = primaryAvg(j.baseline, p);
  if (b === 0) return 0;
  return Math.max(-1, (b - primaryAvg(scores, p)) / b);
}

/** Typical improvement at week w (eases in, reaches `typical` at judgeWeek). */
export function expectedAt(w: number, p: Product) {
  return p.typical * Math.pow(Math.min(1, w / p.judgeWeek), 0.8);
}

/** Share of the last `days` days the product was used. */
export function adherence(j: Journey, days = 14) {
  const n = Math.min(days, daysSince(j) + 1);
  if (n <= 0) return null;
  let used = 0;
  for (let i = 0; i < n; i++) if (j.logs[dayKey(Date.now() - i * DAY)]?.used) used++;
  return used / n;
}

/** Of the days used, how often the key step was done. */
export function keyStepRate(j: Journey) {
  const used = Object.values(j.logs).filter((l) => l.used);
  if (!used.length) return null;
  return used.filter((l) => l.key).length / used.length;
}

export function daysOfProductLeft(j: Journey) {
  const p = productOf(j);
  const used = Object.values(j.logs).filter((l) => l.used).length;
  return p.lastsDays - (used % p.lastsDays);
}

export type VerdictTone = "neutral" | "good" | "warn" | "bad";
export type Verdict = {
  tone: VerdictTone;
  label: string;
  title: string;
  body: string;
  /** Optional phrase in the body to emphasise. */
  emphasis?: string;
};

/**
 * The core of the app: turns baseline + check-ins + usage into an honest answer.
 * Order matters: too early → inconsistent use → confounded → on track → slow → not a fit.
 */
export function verdict(j: Journey): Verdict {
  const p = productOf(j);
  const w = weekNo(j);
  const last = j.weekly[j.weekly.length - 1];
  const adh = adherence(j, 14);
  const ks = keyStepRate(j);
  const recentChanges = [...new Set(j.weekly.slice(-2).flatMap((x) => x.changes))];

  if (!last || w < p.earlyWeek) {
    const next = p.timeline.find((t) => t.week > w) ?? p.timeline[p.timeline.length - 1];
    return {
      tone: "neutral",
      label: "Too early to judge",
      title: "Give it time. You're right where you should be.",
      body: `It's too soon for a fair verdict on ${p.short}. Next milestone, week ${next.week}: ${next.text} Keep using it and do your weekly check-in.`,
    };
  }

  const imp = improvement(j, last.scores);
  const exp = expectedAt(w, p);
  const pct = Math.round(imp * 100);

  if (adh !== null && adh < 0.6) {
    return {
      tone: "warn",
      label: "Not enough data yet",
      title: "Results depend on consistency.",
      body: `You used it on ${Math.round(adh * 100)}% of the last 14 days. Skipped days slow results down, so this isn't a fair test yet. Aim for at least 5 days a week before judging.`,
    };
  }

  if (recentChanges.length && imp > 0) {
    return {
      tone: "warn",
      label: "Improving, but there's a mix-up",
      title: `${pct}% better, but something else changed too.`,
      body: `You also logged: ${recentChanges.join(", ")}. Keep everything else steady for 2 weeks so you know what's actually helping.`,
      emphasis: recentChanges.join(", "),
    };
  }

  if (imp >= exp * 0.6) {
    const where = imp > exp * 1.4 ? "ahead of" : "in";
    const tail = w < p.judgeWeek ? `The full picture comes at week ${p.judgeWeek}.` : "You've passed the full trial window, so this is real progress.";
    return {
      tone: "good",
      label: "It's working",
      title: `${pct}% better than when you started.`,
      body: `That's ${where} the typical range for week ${w}. Keep the routine going. ${tail}`,
    };
  }

  if (w < p.judgeWeek) {
    const tip =
      ks !== null && ks < 0.7
        ? `You did the key step (${p.keyStep.toLowerCase()}) only ${Math.round(ks * 100)}% of the time. That's the most common reason results are slow.`
        : `Check the key step: ${p.keyStep.toLowerCase()}. It makes the biggest difference.`;
    return {
      tone: "warn",
      label: "Slower than typical",
      title: `${Math.max(pct, 0)}% better so far. Don't give up yet.`,
      body: `${tip} You still have ${p.judgeWeek - w} week(s) before it's fair to judge.`,
    };
  }

  return {
    tone: "bad",
    label: "Full trial done, not enough change",
    title: "It may not be the right fit for you.",
    body: `You've used it consistently for ${w} weeks with only ${Math.max(pct, 0)}% improvement. Long-standing concerns can need a different strength or a doctor's input. A short consult with a dermatologist or a product switch is a better next step than continuing as is.`,
  };
}
