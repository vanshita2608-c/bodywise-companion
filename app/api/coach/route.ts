import { askClaude, json } from "@/lib/ai";
import { productFacts } from "@/lib/context";
import { PRODUCTS } from "@/lib/products";
import type { ProductId } from "@/lib/types";

/** AI Progress Coach: turns the user's check-in data into a short, personal explanation + next step. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const productId = body?.productId as ProductId;
  const summary = body?.summary;
  if (!PRODUCTS[productId] || !summary) return json({ error: "Missing product or progress data." }, 400);

  const summaryText = JSON.stringify(summary);
  if (summaryText.length > 8000) return json({ error: "Progress data too large." }, 413);

  const result = await askClaude({
    system: `You are the user's progress coach. Read their tracking data and explain, in under 120 words:
1. What's actually happening (cite their numbers: improvement %, consistency, key step).
2. The most likely reason it's going this way (e.g. skipping the key step, too early, another change confounding it).
3. One specific thing to do this week.
Format: a one-line headline, then 2–3 "- " bullets. Be honest: don't promise results; if it's too early, say so.

${productFacts(productId)}`,
    messages: [{ role: "user", content: `My tracking data:\n${summaryText}` }],
  });

  return result.ok ? json({ text: result.text }) : json({ error: result.error }, result.status);
}
