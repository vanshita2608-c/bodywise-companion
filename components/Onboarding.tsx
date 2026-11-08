"use client";

import { useState } from "react";
import { DURATIONS, PRODUCTS } from "@/lib/products";
import type { Journey, ProductId, Scores } from "@/lib/types";
import { Header, ScaleRow, Timeline } from "./ui";

const TOTAL = 4;

export default function Onboarding({ onDone, onExit }: { onDone: (j: Journey) => void; onExit: () => void }) {
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState<ProductId | null>(null);
  const [concern, setConcern] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<Scores>({});

  const p = product ? PRODUCTS[product] : null;
  const canNext =
    (step === 1 && !!product) ||
    (step === 2 && !!concern && !!duration) ||
    (step === 3 && !!p && p.markers.every((m) => baseline[m.id] !== undefined)) ||
    step === 4;

  const go = (n: number) => {
    setStep(n);
    window.scrollTo(0, 0);
  };

  const next = () => {
    if (step < TOTAL) return go(step + 1);
    onDone({ product: product!, concern: concern!, duration: duration!, start: Date.now(), baseline, logs: {}, weekly: [] });
  };

  return (
    <>
      <Header inApp={false} />
      <div className="stack-lg screen" key={step}>
        <div className="row between">
          <button className="link" onClick={() => (step === 1 ? onExit() : go(step - 1))}>
            ← Back
          </button>
          <span className="small muted">
            Step {step} of {TOTAL}
          </span>
        </div>
        <div className="progress">
          <i style={{ width: `${(step / TOTAL) * 100}%` }} />
        </div>

        {step === 1 && (
          <>
            <h2>Which product are you using?</h2>
            <div className="plist">
              {(Object.keys(PRODUCTS) as ProductId[]).map((id) => (
                <button
                  key={id}
                  className={`pcard ${product === id ? "sel" : ""}`}
                  onClick={() => {
                    setProduct(id);
                    setConcern(null);
                    setBaseline({});
                  }}
                >
                  <span className="picon">{PRODUCTS[id].icon}</span>
                  <span>
                    <b>{PRODUCTS[id].name}</b>
                    <br />
                    <span className="small muted">{PRODUCTS[id].category}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && p && (
          <>
            <h2>What are you using it for?</h2>
            <div className="opts">
              {p.concerns.map((c) => (
                <button key={c} className={`opt ${concern === c ? "sel" : ""}`} onClick={() => setConcern(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="stack">
              <h3>How long have you had this concern?</h3>
              <p className="small muted">
                Long-standing concerns usually take longer to respond. We&apos;ll set expectations accordingly.
              </p>
              <div className="opts">
                {DURATIONS.map((d) => (
                  <button key={d} className={`opt ${duration === d ? "sel" : ""}`} onClick={() => setDuration(d)}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && p && (
          <>
            <h2>Where are you starting from?</h2>
            <p className="muted small">
              Rate how things are <b>today</b>. This is your baseline; every week we&apos;ll compare against it.
              Without it, it&apos;s impossible to tell if anything changed.
            </p>
            <div className="card">
              {p.markers.map((m) => (
                <ScaleRow
                  key={m.id}
                  marker={m}
                  value={baseline[m.id]}
                  onChange={(v) => setBaseline((b) => ({ ...b, [m.id]: v }))}
                />
              ))}
            </div>
          </>
        )}

        {step === 4 && p && (
          <>
            <h2>Your plan for {p.short}</h2>
            {duration === "More than a year" && (
              <div className="callout warn">
                You&apos;ve had this for over a year, so expect results toward the later end of these timelines.
                That&apos;s normal, not failure.
              </div>
            )}
            <div className="card stack">
              <h3>What to expect</h3>
              <Timeline product={p} week={-1} />
            </div>
            <div className="card stack">
              <h3>The step most people skip</h3>
              <p>{p.steps.find((s) => s.key)?.text}</p>
              <div className="callout info small">
                <b>Common mistake:</b> {p.mistake}
              </div>
            </div>
          </>
        )}

        <button className="btn" onClick={next} disabled={!canNext}>
          {step === TOTAL ? "Start tracking" : "Continue"}
        </button>
      </div>
    </>
  );
}
