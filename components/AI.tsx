"use client";

import { useEffect, useRef, useState } from "react";
import { journeySummary } from "@/lib/context";
import { weekNo, productOf } from "@/lib/logic";
import { loadPhotos, resizeImage, savePhotos, type Photo } from "@/lib/photos";
import { forecast } from "@/lib/predict";
import type { Journey } from "@/lib/types";

/* ---------------------------- helpers ---------------------------- */
async function callAI(path: string, payload: unknown): Promise<string> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data.text as string;
}

/** Renders the AI's plain-text answer: "- " lines become bullets, the rest paragraphs. */
export function AIText({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) blocks.push(<ul key={blocks.length}>{bullets.map((b, i) => <li key={i}>{clean(b)}</li>)}</ul>);
    bullets = [];
  };
  text.split("\n").forEach((line) => {
    const l = line.trim();
    if (!l) return flush();
    if (/^[-•*]\s+/.test(l)) bullets.push(l.replace(/^[-•*]\s+/, ""));
    else {
      flush();
      blocks.push(<p key={blocks.length}>{clean(l)}</p>);
    }
  });
  flush();
  return <div className="ai-text">{blocks}</div>;
}
const clean = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#+\s*/, "");

function Thinking({ label }: { label: string }) {
  return (
    <div className="ai-loading" role="status">
      <span className="dots"><i /><i /><i /></span> {label}
    </div>
  );
}

/* --------------------------- ML forecast -------------------------- */
export function ForecastCard({ journey }: { journey: Journey }) {
  const fc = forecast(journey);
  const p = productOf(journey);
  if (!fc) {
    const need = 2 - journey.weekly.filter((w) => w.week > 0).length;
    return (
      <div className="card stack">
        <div className="row between">
          <h3>Results forecast</h3>
          <span className="ai-chip">ML</span>
        </div>
        <p className="small muted">
          After {need} more weekly check-in{need > 1 ? "s" : ""}, we&apos;ll predict where you&apos;ll be by week {p.judgeWeek}, so you
          know early whether it&apos;s worth continuing.
        </p>
      </div>
    );
  }
  const tone = fc.status === "on-track" ? "good" : fc.status === "borderline" ? "warn" : "bad";
  const title =
    fc.status === "on-track" ? "Likely to work for you" : fc.status === "borderline" ? "Could go either way" : "At risk of not working";
  return (
    <div className="card stack forecast">
      <div className="row between">
        <h3>Results forecast</h3>
        <span className="ai-chip">ML</span>
      </div>
      <div className="fc-main">
        <div>
          <span className={`fc-tag ${tone}`}>{title}</span>
          <p className="fc-num">
            {fc.lowPct}–{fc.highPct}%
          </p>
          <p className="small muted">expected improvement by week {fc.judgeWeek}</p>
        </div>
        <div className="fc-chance">
          <b>{fc.chancePct}%</b>
          <span>chance of a meaningful result</span>
        </div>
      </div>
      <div className="fc-bar" aria-hidden>
        <i style={{ left: `${Math.max(0, fc.lowPct)}%`, width: `${Math.max(2, fc.highPct - Math.max(0, fc.lowPct))}%` }} />
        <b style={{ left: `${Math.max(0, fc.projectedPct)}%` }} />
      </div>
      <p className="tiny muted">
        Regression model fitted to your {fc.points} check-ins (dashed line on the chart). It updates every week and gets more accurate as
        you log more.
      </p>
    </div>
  );
}

/* ------------------------- AI progress coach ------------------------ */
export function CoachCard({ journey }: { journey: Journey }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const stamp = `${journey.weekly.length}-${Object.keys(journey.logs).length}`;
  useEffect(() => {
    setText(null);
    setError(null);
  }, [stamp]);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setText(await callAI("/api/coach", { productId: journey.product, summary: journeySummary(journey) }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card stack ai-card">
      <div className="row between">
        <h3>AI progress coach</h3>
        <span className="ai-chip">✦ AI</span>
      </div>
      {!text && !loading && (
        <>
          <p className="small muted">Get a plain-language explanation of your numbers, and one thing to do this week.</p>
          <button className="btn" onClick={run}>
            ✦ Explain my progress
          </button>
        </>
      )}
      {loading && <Thinking label="Reading your check-ins…" />}
      {text && (
        <>
          <AIText text={text} />
          <button className="link" style={{ paddingLeft: 0 }} onClick={run}>
            ↻ Refresh
          </button>
        </>
      )}
      {error && <p className="ai-error">{error}</p>}
    </div>
  );
}

/* ---------------------- Ask about your product ---------------------- */
type Turn = { role: "user" | "assistant"; text: string };

export function AskChat({ journey }: { journey: Journey }) {
  const p = productOf(journey);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    `Can I use the ${p.short.toLowerCase()} every day?`,
    "I got a few pimples. Is that normal?",
    "When will I actually see results?",
    "Is it okay if I missed a few days?",
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, loading]);

  const send = async (q: string) => {
    const question = q.trim();
    if (!question || loading) return;
    const next: Turn[] = [...turns, { role: "user", text: question.slice(0, 600) }];
    setTurns(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const answer = await callAI("/api/ask", { productId: journey.product, summary: journeySummary(journey), messages: next });
      setTurns([...next, { role: "assistant", text: answer }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack-lg screen">
      <div className="stack">
        <span className="chip">
          {p.icon} {p.short}
        </span>
        <h2>Ask anything</h2>
        <p className="small muted">
          No question is silly. Ask privately, any time, without calling customer care. Answers use your product and your progress.
        </p>
      </div>

      <div className="chat">
        {turns.length === 0 && (
          <div className="bubble ai">
            Hi! I know how {p.name} works and how your tracking is going. What would you like to know? 🙂
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`bubble ${t.role === "user" ? "me" : "ai"}`}>
            {t.role === "assistant" ? <AIText text={t.text} /> : t.text}
          </div>
        ))}
        {loading && (
          <div className="bubble ai">
            <span className="dots"><i /><i /><i /></span>
          </div>
        )}
        {error && <p className="ai-error">{error}</p>}
        <div ref={endRef} />
      </div>

      {turns.length === 0 && (
        <div className="toggles">
          {suggestions.map((s) => (
            <button key={s} className="tg" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question…"
          maxLength={600}
          aria-label="Your question"
        />
        <button className="btn small" type="submit" disabled={!input.trim() || loading} aria-label="Send">
          ↑
        </button>
      </form>
      <p className="tiny muted">AI answers are general guidance, not medical advice. For anything serious, see a doctor.</p>
    </div>
  );
}

/* ------------------------ Photo progress check ----------------------- */
export function PhotoCheck({ journey }: { journey: Journey }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const w = weekNo(journey);

  useEffect(() => setPhotos(loadPhotos()), []);

  const first = photos[0];
  const latest = photos.length > 1 ? photos[photos.length - 1] : null;

  const onFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    try {
      const image = await resizeImage(file);
      const week = photos.length === 0 ? 0 : Math.max(1, w); // first photo = baseline; later ones replace this week's
      const next = [...photos.filter((ph) => ph.week !== week), { week, image, takenAt: Date.now() }].sort((a, b) => a.week - b.week);
      if (!savePhotos(next)) return setError("Your browser storage is full. Remove a photo and try again.");
      setPhotos(next);
      setText(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const compare = async () => {
    if (!first || !latest) return;
    setLoading(true);
    setError(null);
    try {
      setText(await callAI("/api/photo", { productId: journey.product, before: first, after: latest }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    savePhotos([]);
    setPhotos([]);
    setText(null);
  };

  return (
    <div className="card stack ai-card">
      <div className="row between">
        <h3>Photo progress check</h3>
        <span className="ai-chip">✦ AI</span>
      </div>
      <p className="small muted">
        Add a photo of the same area each week (same light, same angle). AI compares your latest photo with your first, so you see the change
        instead of guessing. Photos stay on this device.
      </p>

      <div className="photos">
        <figure>
          {first ? <img src={first.image} alt={`Week ${first.week} photo`} /> : <div className="ph-empty">Week 0</div>}
          <figcaption>{first ? `Week ${first.week}` : "Starting photo"}</figcaption>
        </figure>
        <span className="ph-arrow" aria-hidden>→</span>
        <figure>
          {latest ? <img src={latest.image} alt={`Week ${latest.week} photo`} /> : <div className="ph-empty">Latest</div>}
          <figcaption>{latest ? `Week ${latest.week}` : "This week"}</figcaption>
        </figure>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="row">
        <button className="btn ghost" onClick={() => fileRef.current?.click()}>
          📷 {first ? "Add this week's photo" : "Add starting photo"}
        </button>
      </div>
      {first && latest && !loading && (
        <button className="btn" onClick={compare}>
          ✦ Compare with AI
        </button>
      )}
      {loading && <Thinking label="Comparing your photos…" />}
      {text && <AIText text={text} />}
      {error && <p className="ai-error">{error}</p>}
      {photos.length > 0 && (
        <button className="link" style={{ paddingLeft: 0 }} onClick={reset}>
          Remove all photos
        </button>
      )}
    </div>
  );
}
