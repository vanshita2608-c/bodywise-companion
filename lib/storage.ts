import { DAY, dayKey } from "./logic";
import type { Journey } from "./types";

const KEY = "bw_companion_v1";

/** Data stays on the user's device only. Storage can be blocked (private mode), so never throw. */
export function loadJourney(): Journey | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Journey) : null;
  } catch {
    return null;
  }
}

export function saveJourney(j: Journey | null) {
  try {
    if (j) localStorage.setItem(KEY, JSON.stringify(j));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** A realistic 5-week sample so reviewers can see the full experience instantly. */
export function makeDemo(): Journey {
  const start = Date.now() - 36 * DAY;
  const logs: Journey["logs"] = {};
  for (let i = 0; i <= 36; i++) {
    const skip = i % 9 === 4 || i === 18;
    if (!skip) logs[dayKey(start + i * DAY)] = { used: true, key: true };
  }
  return {
    product: "biotin",
    concern: "Hair fall / thinning",
    duration: "3–12 months",
    start,
    demo: true,
    baseline: { hairfall: 3, nails: 3, pimples: 0 },
    logs,
    weekly: [
      { week: 1, scores: { hairfall: 3, nails: 3, pimples: 1 }, changes: [] },
      { week: 2, scores: { hairfall: 3, nails: 2, pimples: 1 }, changes: [] },
      { week: 3, scores: { hairfall: 2, nails: 2, pimples: 0 }, changes: ["New hair/skin product"] },
      { week: 4, scores: { hairfall: 2, nails: 1, pimples: 0 }, changes: [] },
      { week: 5, scores: { hairfall: 2, nails: 1, pimples: 0 }, changes: [] },
    ],
  };
}
