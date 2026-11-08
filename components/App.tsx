"use client";

import { useCallback, useEffect, useState } from "react";
import { dayKey, weekNo } from "@/lib/logic";
import { loadJourney, makeDemo, saveJourney } from "@/lib/storage";
import type { Journey, Scores, Tab } from "@/lib/types";
import CheckinSheet from "./CheckinSheet";
import Landing from "./Landing";
import Onboarding from "./Onboarding";
import { Guide, Progress, Today } from "./Screens";
import { Header } from "./ui";

type Mode = "loading" | "landing" | "onboarding" | "app";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Today", icon: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></> },
  { id: "progress", label: "Is it working?", icon: <path d="M4 19h16M6 15l4-4 3 3 5-6" /> },
  { id: "guide", label: "How to use", icon: <><path d="M5 4h10l4 4v12H5z" /><path d="M9 12h6M9 16h6" /></> },
];

export default function App() {
  const [mode, setMode] = useState<Mode>("loading");
  const [journey, setJourney] = useState<Journey | null>(null);
  const [tab, setTab] = useState<Tab>("today");
  const [checkinOpen, setCheckinOpen] = useState(false);

  // Load saved journey on the client only (localStorage isn't available during the static build).
  useEffect(() => {
    const j = loadJourney();
    setJourney(j);
    setMode(j ? "app" : "landing");
  }, []);

  const update = useCallback((j: Journey | null) => {
    setJourney(j);
    saveJourney(j);
  }, []);

  const switchTab = (t: Tab) => {
    setTab(t);
    window.scrollTo(0, 0);
  };

  const reset = () => {
    if (journey && !journey.demo && !confirm("Start over? This clears your tracking on this device.")) return;
    update(null);
    setTab("today");
    setMode("landing");
  };

  if (mode === "loading") return <div className="wrap" />;

  if (mode === "landing")
    return (
      <div className="wrap">
        <Landing
          onStart={() => setMode("onboarding")}
          onDemo={() => {
            update(makeDemo());
            setTab("today");
            setMode("app");
          }}
        />
      </div>
    );

  if (mode === "onboarding")
    return (
      <div className="wrap">
        <Onboarding
          onExit={() => setMode("landing")}
          onDone={(j) => {
            update(j);
            setTab("today");
            setMode("app");
            window.scrollTo(0, 0);
          }}
        />
      </div>
    );

  if (!journey) return null;
  const today = dayKey(Date.now());

  const toggleUsed = () => {
    const l = journey.logs[today];
    update({ ...journey, logs: { ...journey.logs, [today]: l?.used ? {} : { used: true, key: false } } });
  };
  const toggleKey = () => {
    const l = journey.logs[today];
    if (!l?.used) return;
    update({ ...journey, logs: { ...journey.logs, [today]: { ...l, key: !l.key } } });
  };
  const saveCheckin = (scores: Scores, changes: string[]) => {
    const w = Math.max(1, weekNo(journey));
    const weekly = journey.weekly
      .filter((x) => x.week !== w)
      .concat([{ week: w, scores, changes }])
      .sort((a, b) => a.week - b.week);
    update({ ...journey, weekly });
    setCheckinOpen(false);
    switchTab("progress");
  };

  return (
    <>
      <div className="wrap">
        <Header inApp onReset={reset} />
        {journey.demo && (
          <div className="banner" style={{ marginBottom: 20 }}>
            <span>You&apos;re viewing a sample 5-week journey.</span>
            <button className="btn small" onClick={reset}>
              Start my own
            </button>
          </div>
        )}
        {tab === "today" && (
          <Today
            journey={journey}
            onToggleUsed={toggleUsed}
            onToggleKey={toggleKey}
            onCheckin={() => setCheckinOpen(true)}
            onSeeProgress={() => switchTab("progress")}
          />
        )}
        {tab === "progress" && <Progress journey={journey} onCheckin={() => setCheckinOpen(true)} />}
        {tab === "guide" && <Guide journey={journey} />}
      </div>

      <nav className="tabs" aria-label="Main">
        <div className="in">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? "on" : ""} aria-current={tab === t.id ? "page" : undefined} onClick={() => switchTab(t.id)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                {t.icon}
              </svg>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {checkinOpen && <CheckinSheet journey={journey} onSave={saveCheckin} onClose={() => setCheckinOpen(false)} />}
    </>
  );
}
