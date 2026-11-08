"use client";

import { ProgressRing } from "./Charts";
import { Header } from "./ui";

/** Quotes are from our real customer conversations (Part 1). */
const QUOTES = [
  "“Mujhe itna difference nahi dikha jitna main expect kar rahi thi… I'll switch to another one.”",
  "“I don't know about the hairfall… uss hi time maine shampoo bhi change kiya tha, so I don't know kisne kaam kiya.”",
  "“Bottle pe thoda clearer usage instructions.”",
];

export default function Landing({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  return (
    <>
      <Header inApp={false} />
      <div className="stack-lg screen">
        <div className="hero stack">
          <h1>
            Know if your product is <em>actually working</em>.
          </h1>
          <p className="muted">
            Use it the right way, know what to expect each week, and get an honest answer from your own progress, not
            guesswork.
          </p>
        </div>
        <div className="hero-visual" aria-hidden>
          <ProgressRing value={0.5} size={92} />
          <div className="stack" style={{ marginTop: 0 }}>
            <span className="vlabel" style={{ color: "var(--good)" }}>
              ✓ It&apos;s working
            </span>
            <p style={{ fontWeight: 700 }}>Hair fall down 50% by week 5</p>
            <p className="small muted">Ahead of the typical range. Full picture at week 12.</p>
          </div>
        </div>
        <div className="pillars">
          <div className="pillar">
            <b>✓</b>
            <span>Use it right: the step most people skip</span>
          </div>
          <div className="pillar">
            <b>⏱</b>
            <span>Know what to expect, week by week</span>
          </div>
          <div className="pillar">
            <b>↗</b>
            <span>See if it&apos;s working, with a 30-sec check-in</span>
          </div>
        </div>
        <div className="stack">
          <button className="btn" onClick={onStart}>
            Start my tracker
          </button>
          <button className="btn ghost" onClick={onDemo}>
            See a 5-week example
          </button>
        </div>
        <div className="card stack">
          <p className="small muted">Why this exists. Real Be Bodywise customers told us:</p>
          {QUOTES.map((q) => (
            <p className="quote" key={q}>
              {q}
            </p>
          ))}
        </div>
        <p className="foot">
          Concept prototype built for the Mosaic Fellowship Builder Challenge.
          <br />
          Not an official Be Bodywise app. Your data stays on this device.
        </p>
      </div>
    </>
  );
}
