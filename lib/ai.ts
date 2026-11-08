import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-side Claude helper shared by the AI routes.
 * The API key lives only on the server (ANTHROPIC_API_KEY env var), never in the browser.
 */
const MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

export const aiConfigured = () => !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

/** Safety + tone rules every AI feature follows. */
export const BASE_RULES = `You are the in-app assistant of "Is It Working?", a results companion for Be Bodywise customers (skin, body, hair and nutrition products).
Rules:
- You are not a doctor. Never diagnose. For severe, spreading, painful or persistent reactions, or anything that worries the user, tell them to stop and see a dermatologist or doctor.
- Base product advice on the product facts provided, and say "check your pack label" for dosing or anything you aren't sure about.
- Be warm, honest and brief. Plain words, no jargon. No markdown headings or tables; short paragraphs or "- " bullets only.
- Reply in the user's language and style (English, Hindi or Hinglish).`;

export type AIResult = { ok: true; text: string } | { ok: false; error: string; status: number };

export async function askClaude(opts: {
  system: string;
  messages: Anthropic.Beta.BetaMessageParam[];
  maxTokens?: number;
}): Promise<AIResult> {
  if (!aiConfigured()) {
    return { ok: false, status: 503, error: "AI isn't switched on for this deployment yet (missing ANTHROPIC_API_KEY)." };
  }
  try {
    const response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 4000,
      output_config: { effort: "low" }, // short, fast consumer replies
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // if a safety classifier declines, retry on Anthropic's recommended model
      system: `${BASE_RULES}\n\n${opts.system}`,
      messages: opts.messages,
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
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, status: 503, error: "AI key is invalid. Check ANTHROPIC_API_KEY." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, status: 429, error: "Too many requests right now. Try again in a minute." };
    }
    if (error instanceof Anthropic.BadRequestError) {
      return { ok: false, status: 400, error: "That request couldn't be processed." };
    }
    if (error instanceof Anthropic.APIError) {
      return { ok: false, status: 502, error: "The AI service had a problem. Please try again." };
    }
    return { ok: false, status: 500, error: "Something went wrong. Please try again." };
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}
