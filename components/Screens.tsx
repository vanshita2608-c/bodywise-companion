"use client";

import {
  DAY,
  adherence,
  dayKey,
  daysOfProductLeft,
  daysSince,
  improvement,
  keyStepRate,
  productOf,
  startOfDay,
  verdict,
  weekNo,
} from "@/lib/logic";
import { SCALE } from "@/lib/products";
import type { Journey } from "@/lib/types";
import { CoachCard, ForecastCard, PhotoCheck } from "./AI";
import { ConsistencyHeatmap, ProgressRing } from "./Charts";
import ProgressChart from "./ProgressChart";
import { Timeline, VerdictCard } from "./ui";

/* ---------------------------- Today ---------------------------- */
export function Today({
  journey,
  onToggleUsed,
  onToggleKey,
  onCheckin,
  onSeeProgress,
}: {
  journey: Journey;
  onToggleUsed: () => void;
  onToggleKey: () => void;
  onCheckin: () => void;
  onSeeProgress: () => void;
}) {
  const p = productOf(journey);
  const d = daysSince(journey);
  const w = weekNo(journey);
  const today = dayKey(Date.now());
  const log = journey.logs[today] ?? {};
  const lastW = journey.weekly[journey.weekly.length - 1];
  const checkinDue = d >= 6 && (!lastW || lastW.week < w);
  const left = daysOfProductLeft(journey);

  const dots = Array.from({ length: 7 }, (_, i) => {
    const t = Date.now() - (6 - i) * DAY;
    const k = dayKey(t);
    const before = startOfDay(t) < startOfDay(journey.start);
    const cls = before ? "" : journey.logs[k]?.used ? "done" : k === today ? "" : "miss";
    return (
      <div key={k} className={`wd ${cls} ${k === today ? "today" : ""}`} title={k}>
        {"SMTWTFS"[new Date(t).getDay()]}
      </div>
    );
  });

  return (
    <div className="stack-lg screen">
      <div className="stack">
        <span className="chip">
          {p.icon} {p.short} · Day {d + 1} · Week {w + 1}
        </span>
        <h2>Today</h2>
      </div>

      <div className="card stack">
        <div className="row between">
          <h3>Did you use it today?</h3>
          {log.used && (
            <span className="chip done-chip">Done ✓</span>
          )}
        </div>
        <div className="toggles">
          <button className={`tg ${log.used ? "sel" : ""}`} aria-pressed={!!log.used} onClick={onToggleUsed}>
            Yes, used it
          </button>
          <button
            className={`tg ${log.used && log.key ? "sel" : ""}`}
            aria-pressed={!!(log.used && log.key)}
            onClick={onToggleKey}
            disabled={!log.used}
          >
            {p.keyStep}
          </button>
        </div>
        <div className="week-dots">{dots}</div>
      </div>

      {checkinDue && (
        <div className="card stack" style={{ borderColor: "var(--brand)" }}>
          <h3>Your weekly check-in is ready</h3>
          <p className="small muted">30 seconds. Rate how things look this week, and we&apos;ll tell you if you&apos;re on track.</p>
          <button className="btn" onClick={onCheckin}>
            Do week {w} check-in
          </button>
        </div>
      )}

      <VerdictCard v={verdict(journey)}>
        <button className="link" style={{ paddingLeft: 0, textAlign: "left" }} onClick={onSeeProgress}>
          See full progress →
        </button>
      </VerdictCard>

      <div className="card stack">
        <h3>This stage</h3>
        <Timeline product={p} week={w} />
      </div>

      <div className="callout info small">
        🧴 About <b>{left} days</b> of product left at your pace.
        {left <= 7 && " Time to reorder so you don't break the routine."}
      </div>

      {!checkinDue && (
        <button className="btn ghost" onClick={onCheckin}>
          Log a check-in now
        </button>
      )}
    </div>
  );
}

/* --------------------------- Progress -------------------------- */
export function Progress({ journey, onCheckin }: { journey: Journey; onCheckin: () => void }) {
  const p = productOf(journey);
  const last = journey.weekly[journey.weekly.length - 1];
  const imp = last ? Math.round(improvement(journey, last.scores) * 100) : null;
  const adh = adherence(journey, 14);
  const ks = keyStepRate(journey);
  const pct = (v: number | null) => (v === null ? "–" : `${Math.round(v * 100)}%`);

  return (
    <div className="stack-lg screen">
      <div className="stack">
        <span className="chip">
          {p.icon} {p.short}
        </span>
        <h2>Is it working?</h2>
      </div>

      <VerdictCard v={verdict(journey)} />

      <CoachCard journey={journey} />

      <div className="stats">
        <div className="stat ring-card">
          <ProgressRing value={imp === null ? null : Math.max(0, imp) / 100} label="Improvement vs start" />
          <span>better than week 0</span>
        </div>
        <div className="stat">
          <b>{pct(adh)}</b>
          <span>days used (14d)</span>
        </div>
        <div className="stat">
          <b>{pct(ks)}</b>
          <span>key step done</span>
        </div>
      </div>

      <div className="card stack chart">
        <h3>Your progress vs. typical</h3>
        <ProgressChart journey={journey} />
        <div className="legend">
          <span>
            <i style={{ background: "var(--brand)" }} />
            You
          </span>
          <span>
            <i style={{ background: "var(--band)" }} />
            Typical range
          </span>
          <span>
            <i style={{ background: "var(--warn)", borderRadius: "50%" }} />
            Something else changed
          </span>
          <span>
            <i style={{ background: "repeating-linear-gradient(90deg,var(--brand-2) 0 3px,transparent 3px 5px)" }} />
            Forecast
          </span>
        </div>
        <p className="tiny muted">
          Improvement in your main concerns compared with your week-0 baseline. Dashed line = week {p.judgeWeek}, the
          fair point to judge.
        </p>
      </div>

      <ForecastCard journey={journey} />

      <PhotoCheck journey={journey} />

      <div className="card stack">
        <div className="row between">
          <h3>Your consistency</h3>
          <span className="small muted">{pct(adh)} last 14 days</span>
        </div>
        <ConsistencyHeatmap journey={journey} />
      </div>

      <div className="card stack">
        <h3>By concern</h3>
        {p.markers.map((m) => {
          const b = journey.baseline[m.id] ?? 0;
          const n = last ? last.scores[m.id] ?? b : b;
          const color = n < b ? "var(--good)" : n > b ? "var(--bad)" : "var(--ink-2)";
          return (
            <div key={m.id}>
              <div className="row between small">
                <span>{m.label}</span>
                <span className="muted">
                  {SCALE[b]} → <b style={{ color: n === b ? "var(--ink)" : color }}>{SCALE[n]}</b>
                </span>
              </div>
              <div className="bar">
                <i style={{ width: `${(n / 4) * 100}%`, background: n < b ? "linear-gradient(90deg,var(--good),#5EEAD4)" : color }} />
              </div>
            </div>
          );
        })}
      </div>

      {journey.weekly.length > 0 && (
        <div className="card stack">
          <h3>Check-in history</h3>
          {[...journey.weekly].reverse().map((x) => (
            <div key={x.week} className="row between small">
              <span>Week {x.week}</span>
              <span className="muted">
                {Math.round(improvement(journey, x.scores) * 100)}% better
                {x.changes.length > 0 && ` · ⚠ ${x.changes.join(", ")}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <button className="btn ghost" onClick={onCheckin}>
        Log a check-in
      </button>
    </div>
  );
}

/* ----------------------------- Guide ---------------------------- */
export function Guide({ journey }: { journey: Journey }) {
  const p = productOf(journey);
  return (
    <div className="stack-lg screen">
      <div className="stack">
        <span className="chip">
          {p.icon} {p.short}
        </span>
        <h2>How to use it right</h2>
      </div>
      <div className="card stack">
        <ol className="steps">
          {p.steps.map((s) => (
            <li key={s.text} className={s.key ? "key" : ""}>
              {s.text}
            </li>
          ))}
        </ol>
      </div>
      <div className="callout warn small">
        <b>Most common mistake:</b> {p.mistake}
      </div>
      <div className="card stack">
        <h3>What to expect, week by week</h3>
        <Timeline product={p} week={weekNo(journey)} />
      </div>
      <div className="card stack">
        <h3>Watch out for</h3>
        <p className="small">{p.watch}</p>
      </div>
      <p className="tiny muted">
        General guidance for this type of product. Always follow the instructions on your pack, and see a doctor for
        anything that worries you.
      </p>
    </div>
  );
}
