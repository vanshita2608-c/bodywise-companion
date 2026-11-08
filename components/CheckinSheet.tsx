"use client";

import { useEffect, useState } from "react";
import { productOf, weekNo } from "@/lib/logic";
import { CHANGES } from "@/lib/products";
import type { Journey, Scores } from "@/lib/types";
import { ScaleRow } from "./ui";

export default function CheckinSheet({
  journey,
  onSave,
  onClose,
}: {
  journey: Journey;
  onSave: (scores: Scores, changes: string[]) => void;
  onClose: () => void;
}) {
  const p = productOf(journey);
  const last = journey.weekly[journey.weekly.length - 1];
  const [scores, setScores] = useState<Scores>({ ...(last?.scores ?? journey.baseline) });
  const [changes, setChanges] = useState<string[]>([]);
  const w = Math.max(1, weekNo(journey));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (c: string) => setChanges((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  return (
    <div className="sheet-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet stack-lg" role="dialog" aria-modal="true" aria-label="Weekly check-in">
        <div className="row between">
          <h2>Week {w} check-in</h2>
          <button className="link" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="small muted">
          How do things look <b>this week</b>? Compare honestly with your start. Your baseline is marked ●.
        </p>
        <div className="card">
          {p.markers.map((m) => (
            <ScaleRow
              key={m.id}
              marker={m}
              value={scores[m.id]}
              baseline={journey.baseline[m.id]}
              onChange={(v) => setScores((s) => ({ ...s, [m.id]: v }))}
            />
          ))}
        </div>
        <div className="stack">
          <h3>Did anything else change this week?</h3>
          <p className="small muted">This helps us tell what&apos;s really causing a change.</p>
          <div className="toggles">
            {CHANGES.map((c) => (
              <button key={c} className={`tg ${changes.includes(c) ? "sel" : ""}`} aria-pressed={changes.includes(c)} onClick={() => toggle(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <button className="btn" onClick={() => onSave(scores, changes)}>
          Save check-in
        </button>
      </div>
    </div>
  );
}
