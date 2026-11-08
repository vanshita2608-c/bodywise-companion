"use client";

import { useEffect, useState } from "react";
import { DAY, dayKey, startOfDay } from "@/lib/logic";
import type { Journey } from "@/lib/types";

/** Animated ring that fills to `value` (0..1) on mount. */
export function ProgressRing({ value, label, size = 120 }: { value: number | null; label?: string; size?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(Math.max(0, Math.min(1, value ?? 0))), 150);
    return () => clearTimeout(t);
  }, [value]);

  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF6B8B" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          className="fg"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
        />
      </svg>
      <div className="val" aria-label={label}>
        {value === null ? "–" : `${Math.round((value ?? 0) * 100)}%`}
      </div>
    </div>
  );
}

/** GitHub-style consistency grid: one square per day since starting (up to 8 weeks). */
export function ConsistencyHeatmap({ journey }: { journey: Journey }) {
  const start = startOfDay(journey.start);
  const today = startOfDay(Date.now());
  const totalDays = Math.min(56, Math.floor((today - start) / DAY) + 1);
  const first = today - (totalDays - 1) * DAY;
  // pad so the grid always ends on a full row of 7
  const cells = Math.ceil(totalDays / 7) * 7;

  return (
    <>
      <div className="heat" role="img" aria-label="Days you used the product">
        {Array.from({ length: cells }, (_, i) => {
          const t = first + i * DAY;
          if (t > today) return <span key={i} className="f" style={{ animationDelay: `${i * 12}ms` }} />;
          const l = journey.logs[dayKey(t)];
          const cls = l?.used ? (l.key ? "k" : "u") : "";
          return <span key={i} className={cls} title={dayKey(t)} style={{ animationDelay: `${i * 12}ms` }} />;
        })}
      </div>
      <div className="heat-legend">
        <span>
          <i style={{ background: "var(--surface-2)" }} />
          Missed
        </span>
        <span>
          <i style={{ background: "color-mix(in srgb,var(--brand) 55%,var(--surface-2))" }} />
          Used
        </span>
        <span>
          <i style={{ background: "var(--grad)" }} />
          Used + key step
        </span>
      </div>
    </>
  );
}
