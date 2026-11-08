"use client";

import { SCALE } from "@/lib/products";
import type { Verdict } from "@/lib/logic";
import type { Marker, Product } from "@/lib/types";

export function Header({ onReset, inApp }: { onReset?: () => void; inApp: boolean }) {
  return (
    <div className="top">
      <div className="logo">
        <span className="dot" />
        Is It Working?
      </div>
      {inApp ? (
        <button className="link" onClick={onReset}>
          Start over
        </button>
      ) : (
        <span className="chip">for Be Bodywise</span>
      )}
    </div>
  );
}

export function ScaleRow({
  marker,
  value,
  baseline,
  onChange,
}: {
  marker: Marker;
  value?: number;
  baseline?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="marker-row">
      <p className="small" style={{ marginBottom: 6 }}>
        <b>{marker.label}</b>
      </p>
      <div className="scale" role="radiogroup" aria-label={marker.label}>
        {SCALE.map((label, i) => (
          <button
            key={i}
            role="radio"
            aria-checked={value === i}
            aria-label={`${marker.label}: ${label}`}
            className={value === i ? "sel" : ""}
            onClick={() => onChange(i)}
          >
            {i}
            {baseline === i ? " ●" : ""}
          </button>
        ))}
      </div>
      <div className="scale-lbl">
        <span>None</span>
        <span>Severe</span>
      </div>
    </div>
  );
}

export function Timeline({ product, week }: { product: Product; week: number }) {
  return (
    <div className="tl">
      {product.timeline.map((t) => (
        <div key={t.week} className={week >= 0 && week >= t.week - 1 && week < t.week + 1 ? "now" : ""}>
          <b>
            Week {t.week}
            {t.week === product.judgeWeek ? " · judge here" : ""}
          </b>
          <p className="small">{t.text}</p>
        </div>
      ))}
    </div>
  );
}

export function VerdictCard({ v, children }: { v: Verdict; children?: React.ReactNode }) {
  let body: React.ReactNode = v.body;
  if (v.emphasis && v.body.includes(v.emphasis)) {
    const [a, b] = v.body.split(v.emphasis);
    body = (
      <>
        {a}
        <b>{v.emphasis}</b>
        {b}
      </>
    );
  }
  return (
    <div className={`verdict ${v.tone} stack`} aria-live="polite">
      <span className="vlabel">{v.label}</span>
      <h3>{v.title}</h3>
      <p className="small">{body}</p>
      {children}
    </div>
  );
}
