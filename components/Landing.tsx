"use client";

import type { Tab } from "@/lib/types";
import { ProgressRing } from "./Charts";

/** Quotes are from our real customer conversations (Part 1). */
const QUOTES = [
  { text: "Mujhe itna difference nahi dikha jitna main expect kar rahi thi… I'll switch to another one.", who: "Body wash customer · 6/10" },
  { text: "I don't know about the hairfall… uss hi time maine shampoo bhi change kiya tha, so I don't know kisne kaam kiya.", who: "Biotin gummies customer" },
  { text: "Bottle pe thoda clearer usage instructions.", who: "Anti-dandruff shampoo customer · 9/10" },
];

const FEATURES = [
  { icon: "✓", title: "Use it right", text: "Product-specific steps with the one step most people skip highlighted." },
  { icon: "⏱", title: "Know what to expect", text: "A week-by-week timeline and an honest point to judge your product." },
  { icon: "☑", title: "30-second check-ins", text: "One tap a day, a quick weekly rating against your starting point." },
  { icon: "↗", title: "A clear verdict", text: "Too early, working, slower than typical, or not the right fit, and why." },
  { icon: "✦", title: "AI progress coach", text: "Your numbers explained in plain words, with one thing to do this week.", ai: "progress" as Tab },
  { icon: "💬", title: "Ask anything", text: "A private chat for the questions you'd never call customer care about.", ai: "ask" as Tab },
  { icon: "📷", title: "Photo check", text: "Weekly photos compared by AI, so you see change instead of guessing.", ai: "progress" as Tab },
  { icon: "📈", title: "Results forecast", text: "An ML model predicts where you'll be, so you don't quit too early.", ai: "progress" as Tab },
];

const STEPS = [
  { n: "1", title: "Pick your product", text: "Choose what you're using and what it's for. Rate where you're starting from." },
  { n: "2", title: "Log as you go", text: "Tap once a day and do a 30-second check-in each week." },
  { n: "3", title: "Get an honest answer", text: "See your progress against what's typical, and know when it's fair to judge." },
];

export default function Landing({ onStart, onDemo }: { onStart: () => void; onDemo: (tab?: Tab) => void }) {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="site">
      <header className="nav">
        <div className="nav-in">
          <div className="logo">
            <span className="dot">✦</span>Is It Working?
          </div>
          <nav className="nav-links" aria-label="Sections">
            <button onClick={() => go("features")}>Features</button>
            <button onClick={() => go("how")}>How it works</button>
            <button onClick={() => go("why")}>Why</button>
          </nav>
          <div className="nav-cta">
            <button className="btn ghost small" onClick={() => onDemo()}>
              Try the demo
            </button>
            <button className="btn small" onClick={onStart}>
              Start tracking
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero2 section screen">
          <div className="hero2-copy">
            <span className="eyebrow">For Be Bodywise customers</span>
            <h1>
              Know if your product is <em>actually working</em>.
            </h1>
            <p className="lead">
              Use it the right way, know what to expect each week, and get an honest answer from your own progress, not
              guesswork.
            </p>
            <div className="hero2-cta">
              <button className="btn" onClick={onStart}>
                Start my tracker
              </button>
              <button className="btn ghost" onClick={() => onDemo()}>
                See a 5-week example
              </button>
            </div>
            <p className="tiny muted">Free · no sign-up · your data stays on your device</p>
          </div>

          <div className="hero2-visual" aria-hidden>
            <div className="mock">
              <div className="mock-top">
                <span className="chip">🍓 Biotin Gummies · Week 5</span>
              </div>
              <div className="mock-verdict">
                <ProgressRing value={0.5} size={96} />
                <div>
                  <span className="vlabel" style={{ color: "var(--good)" }}>✓ It&apos;s working</span>
                  <p className="mock-title">Hair fall down 50%</p>
                  <p className="small muted">Ahead of the typical range. Full picture at week 12.</p>
                </div>
              </div>
              <svg className="mock-chart" viewBox="0 22 300 80">
                <path d="M10 95 C 80 92, 140 80, 290 45 L 290 75 C 140 92, 80 96, 10 96 Z" fill="var(--band)" opacity=".8" />
                <path className="mock-line" d="M10 96 L 60 96 L 110 78 L 160 62 L 210 44 L 240 44" fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
                <path d="M240 44 L 290 30" fill="none" stroke="var(--brand-2)" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="160" cy="62" r="5" fill="var(--warn)" />
              </svg>
              <div className="mock-coach">
                <span className="ai-chip">✦ AI coach</span>
                <p className="small">Nails first, shedding next. You took it 93% of days, so keep going and don&apos;t add new hair products.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="section" id="why">
          <div className="section-head">
            <span className="eyebrow">Why this exists</span>
            <h2>People don&apos;t quit because the product failed. They quit because they couldn&apos;t tell.</h2>
          </div>
          <div className="stat-row">
            <div className="stat-big">
              <b>4 of 5</b>
              <span>customers we spoke to were unsure how to use their product right</span>
            </div>
            <div className="stat-big">
              <b>8–9/10</b>
              <span>ratings from customers who could clearly see results</span>
            </div>
            <div className="stat-big">
              <b>Weeks 1–12</b>
              <span>decide repurchase, and that&apos;s exactly when no one is guiding them</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section" id="features">
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h2>Everything you need between delivery and results</h2>
          </div>
          <div className="feat-grid">
            {FEATURES.map((f) => (
              <div className={`feat ${f.ai ? "is-ai" : ""}`} key={f.title}>
                <span className="feat-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p className="small muted">{f.text}</p>
                {f.ai && (
                  <button className="link feat-try" onClick={() => onDemo(f.ai)}>
                    Try it →
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="section" id="how">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps, thirty seconds a week</h2>
          </div>
          <div className="steps-row">
            {STEPS.map((s) => (
              <div className="step-card" key={s.n}>
                <span className="step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p className="small muted">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quotes */}
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">From real customer conversations</span>
            <h2>What we heard</h2>
          </div>
          <div className="quote-grid">
            {QUOTES.map((q) => (
              <figure className="quote-card" key={q.text}>
                <blockquote>“{q.text}”</blockquote>
                <figcaption>{q.who}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="cta-band">
            <div>
              <h2>Stop guessing. Start knowing.</h2>
              <p>Set up your tracker in under a minute.</p>
            </div>
            <div className="cta-btns">
              <button className="btn light" onClick={onStart}>
                Start my tracker
              </button>
              <button className="btn outline-light" onClick={() => onDemo()}>
                See the demo
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-in">
          <div className="logo">
            <span className="dot">✦</span>Is It Working?
          </div>
          <p className="tiny muted">
            Concept prototype built for the Mosaic Fellowship Builder Challenge. Not an official Be Bodywise app. Not medical
            advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
