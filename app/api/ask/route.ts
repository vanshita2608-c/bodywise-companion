import { askAI, json, type Message } from "@/lib/ai";
import { productFacts } from "@/lib/context";
import { PRODUCTS } from "@/lib/products";
import type { ProductId } from "@/lib/types";

type ChatTurn = { role: "user" | "assistant"; text: string };

/**
 * "Ask about your product": a judgement-free chat for the questions people feel awkward
 * asking customer care ("is this normal?", "can I use it daily?").
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const productId = body?.productId as ProductId;
  const history = (Array.isArray(body?.messages) ? body.messages : []) as ChatTurn[];
  if (!PRODUCTS[productId]) return json({ error: "Unknown product." }, 400);

  // keep requests small and well-formed: last 10 turns, 600 chars each, must end with the user
  const turns = history
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.text === "string" && t.text.trim())
    .slice(-10)
    .map((t) => ({ role: t.role, text: t.text.slice(0, 600) }));
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return json({ error: "Ask a question first." }, 400);

  const summary = body?.summary ? JSON.stringify(body.summary).slice(0, 6000) : "not available";
  const messages: Message[] = turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] }));

  const result = await askAI({
    system: `Answer the user's questions about their product. No question is silly; be kind and never make them feel judged.
Keep answers under 90 words unless they ask for detail. Use their progress data when it helps.
If the question is about a different product or brand, answer generally and suggest checking that product's label.

${productFacts(productId)}

The user's progress data: ${summary}`,
    messages,
  });

  return result.ok ? json({ text: result.text }) : json({ error: result.error }, result.status);
}
