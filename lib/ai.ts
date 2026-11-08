import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { ApiError, GoogleGenAI, type Content } from "@google/genai";

/**
 * Server-side AI helper shared by the AI routes. Keys live only on the server.
 *
 * Provider is picked from environment variables:
 *   GEMINI_API_KEY     → Google Gemini (has a free tier)   [model: GEMINI_MODEL, default gemini-3.5-flash]
 *   ANTHROPIC_API_KEY  → Anthropic Claude (paid)           [model: claude-opus-5-5]
 * If both are set, Gemini is used unless AI_PROVIDER=anthropic.
 */
const CLAUDE_MODEL = "claude-opus-5-5";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

type Provider = "gemini" | "anthropic";
function provider(): Provider | null {
  const gemini = !!process.env.GEMINI_API_KEY;
  const claude = !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  if (process.env.AI_PROVIDER === "anthropic" && claude) return "anthropic";
  if (gemini) return "gemini";
  if (claude) return "anthropic";
  return null;
}

/** Safety + tone rules every AI feature follows. */
export const BASE_RULES = `You are the in-app assistant of "Is It Working?", a results companion for Be Bodywise customers (skin, body, hair and nutrition products).
Rules:
- You are not a doctor. Never diagnose. For severe, spreading, painful or persistent reactions, or anything that worries the user, tell them to stop and see a dermatologist or doctor.
- Base product advice on the product facts provided, and say "check your pack label" for dosing or anything you aren't sure about.
- Be warm, honest and brief. Plain words, no jargon. No markdown headings or tables; short paragraphs or "- " bullets only.
- Reply in the user's language and style (English, Hindi or Hinglish).`;

/** Provider-neutral message format used by the routes. */
export type Part = { text: string } | { image: { mediaType: "image/jpeg" | "image/png" | "image/webp"; data: string } };
export type Message = { role: "user" | "assistant"; parts: Part[] };

export type AIResult = { ok: true; text: string } | { ok: false; error: string; status: number };

export async function askAI(opts: { system: string; messages: Message[]; maxTokens?: number }): Promise<AIResult> {
  const p = provider();
  if (!p) return { ok: false, status: 503, error: "AI isn't switched on for this deployment yet (add GEMINI_API_KEY)." };
  const system = `${BASE_RULES}\n\n${opts.system}`;
  return p === "gemini" ? askGemini(system, opts.messages, opts.maxTokens) : askClaude(system, opts.messages, opts.maxTokens);
}

/* ------------------------------ Gemini ------------------------------ */
let gemini: GoogleGenAI | null = null;

async function askGemini(system: string, messages: Message[], maxTokens = 2000): Promise<AIResult> {
  gemini ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const contents: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: m.parts.map((part) => ("text" in part ? { text: part.text } : { inlineData: { mimeType: part.image.mediaType, data: part.image.data } })),
  }));
  try {
    const res = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: { systemInstruction: system, maxOutputTokens: maxTokens },
    });
    const text = res.text?.trim();
    if (text) return { ok: true, text };
    return { ok: false, status: 422, error: "Sorry, I couldn't answer that one. Please try rephrasing, or check with a doctor." };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) return { ok: false, status: 429, error: "The free AI limit was reached for now. Please try again in a minute." };
      if (error.status === 400 || error.status === 401 || error.status === 403)
        return { ok: false, status: 503, error: "AI key or model setting is invalid. Check GEMINI_API_KEY / GEMINI_MODEL." };
      return { ok: false, status: 502, error: "The AI service had a problem. Please try again." };
    }
    return { ok: false, status: 500, error: "Something went wrong. Please try again." };
  }
}

/* ------------------------------ Claude ------------------------------ */
let claude: Anthropic | null = null;

async function askClaude(system: string, messages: Message[], maxTokens = 4000): Promise<AIResult> {
  claude ??= new Anthropic();
  const params: Anthropic.Beta.BetaMessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.parts.map((part) =>
      "text" in part
        ? { type: "text" as const, text: part.text }
        : { type: "image" as const, source: { type: "base64" as const, media_type: part.image.mediaType, data: part.image.data } },
    ),
  }));
  try {
    const response = await claude.beta.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      output_config: { effort: "low" }, // short, fast consumer replies
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // if a safety classifier declines, retry on Anthropic's recommended model
      system,
      messages: params,
    });
    if (response.stop_reason === "refusal") {
      return { ok: false, status: 422, error: "Sorry, I can't help with that one. Please check with a doctor or Be Bodywise support." };
    }
    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return text ? { ok: true, text } : { ok: false, status: 502, error: "The AI didn't return an answer. Please try again." };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return { ok: false, status: 503, error: "AI key is invalid. Check ANTHROPIC_API_KEY." };
    if (error instanceof Anthropic.RateLimitError) return { ok: false, status: 429, error: "Too many requests right now. Try again in a minute." };
    if (error instanceof Anthropic.BadRequestError) return { ok: false, status: 400, error: "That request couldn't be processed." };
    if (error instanceof Anthropic.APIError) return { ok: false, status: 502, error: "The AI service had a problem. Please try again." };
    return { ok: false, status: 500, error: "Something went wrong. Please try again." };
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}
