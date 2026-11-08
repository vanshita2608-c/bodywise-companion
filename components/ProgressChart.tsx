"use client";

import { expectedAt, improvement, productOf, weekNo } from "@/lib/logic";
import type { Journey } from "@/lib/types";

const W = 320, H = 180, PAD_L = 34, PAD_R = 10, PAD_T = 10, PAD_B = 26;

/** Your improvement line vs the typical range band, with markers where something else changed. */
export default function ProgressChart({ journey }: { journey: Journey }) {
  const p = productOf(journey);
  const maxW = Math.max(p.judgeWeek, weekNo(journey), ...journey.weekly.map((x) => x.week), 2);
  const x = (wk: number) => PAD_L + (wk / maxW) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - (v + 0.2) / 1.2) * (H - PAD_T - PAD_B); // -20%..100%

  const pts: number[] = [];
  for (let i = 0; i <= maxW + 1e-9; i += maxW / 24) pts.push(i);
  const upper = pts.map((i) => `${x(i)},${y(Math.min(1, expectedAt(i, p) * 1.4))}`);
  const lower = [...pts].reverse().map((i) => `${x(i)},${y(expectedAt(i, p) * 0.6)}`);
  const band = `M${upper.join(" L")} L${lower.join(" L")} Z`;

  const series = [
    { week: 0, v: 0, changed: false },
    ...journey.weekly.map((z) => ({ week: z.week, v: improvement(journey, z.scores), changed: z.changes.length > 0 })),
  ];
  const line = series.map((s, i) => `${i ? "L" : "M"}${x(s.week)},${y(s.v)}`).join(" ");
  const lastPt = series[series.length - 1];
  const area = `${line} L${x(lastPt.week)},${y(0)} L${x(0)},${y(0)} Z`;
  const step = maxW > 8 ? 2 : 1;
  const ticks: number[] = [];
  for (let i = 0; i <= maxW; i += step) ticks.push(i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Improvement over weeks compared with typical range">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF6B8B" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0507A" stopOpacity={0.28} />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(g)} y2={y(g)} stroke="var(--line)" strokeWidth={1} />
          <text x={PAD_L - 6} y={y(g) + 4} textAnchor="end" fontSize={10} fill="var(--ink-2)">
            {g * 100}%
          </text>
        </g>
      ))}
      <path d={band} fill="var(--band)" opacity={0.7} />
      <line x1={x(p.judgeWeek)} x2={x(p.judgeWeek)} y1={PAD_T} y2={H - PAD_B} stroke="var(--ink-2)" strokeDasharray="3 3" />
      <text x={x(p.judgeWeek) - 4} y={PAD_T + 10} textAnchor="end" fontSize={9} fontWeight={700} fill="var(--ink-2)">
        judge
      </text>
      {series.length > 1 && <path className="area" d={area} fill="url(#areaGrad)" />}
      <path
        className="line"
        d={line}
        pathLength={1}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {series.map((s, i) => (
        <circle
          key={s.week}
          className="pt"
          style={{ animationDelay: `${0.3 + i * 0.2}s`, transformOrigin: `${x(s.week)}px ${y(s.v)}px` }}
          cx={x(s.week)}
          cy={y(s.v)}
          r={s.changed ? 5.5 : 4}
          fill={s.changed ? "var(--warn)" : "var(--surface)"}
          stroke={s.changed ? "var(--surface)" : "var(--brand)"}
          strokeWidth={2.5}
        >
          <title>{`Week ${s.week}: ${Math.round(s.v * 100)}%`}</title>
        </circle>
      ))}
      {ticks.map((i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--ink-2)">
          W{i}
        </text>
      ))}
    </svg>
  );
}
