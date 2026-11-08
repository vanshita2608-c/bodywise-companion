export type ProductId = "sa_wash" | "zpto" | "rollon" | "biotin";

export type Marker = { id: string; label: string; primary: boolean };
export type Step = { text: string; key?: boolean };
export type Milestone = { week: number; text: string };

export type Product = {
  name: string;
  short: string;
  icon: string;
  category: string;
  concerns: string[];
  markers: Marker[];
  keyStep: string; // short label used in the daily log
  steps: Step[];
  mistake: string;
  timeline: Milestone[];
  judgeWeek: number; // fair point to judge the product
  earlyWeek: number; // before this, it's too early to say anything
  typical: number; // typical improvement (0..1) reached by judgeWeek
  lastsDays: number; // how long one pack lasts with daily use
  watch: string;
};

export type Scores = Record<string, number>; // marker id -> 0 (none) .. 4 (severe)

export type DayLog = { used?: boolean; key?: boolean };
export type WeeklyCheckin = { week: number; scores: Scores; changes: string[] };

export type Journey = {
  product: ProductId;
  concern: string;
  duration: string;
  start: number; // timestamp
  baseline: Scores;
  logs: Record<string, DayLog>; // yyyy-mm-dd -> log
  weekly: WeeklyCheckin[];
  demo?: boolean;
};

export type Tab = "today" | "progress" | "guide";
