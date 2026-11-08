import { askAI, json } from "@/lib/ai";
import { productFacts } from "@/lib/context";
import { PRODUCTS } from "@/lib/products";
import type { ProductId } from "@/lib/types";

const MAX_IMAGE_CHARS = 1_500_000; // ~1.1 MB per base64 image; the browser resizes before upload

function parseDataUrl(dataUrl: unknown) {
  if (typeof dataUrl !== "string" || dataUrl.length > MAX_IMAGE_CHARS) return null;
  const m = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  return m ? { mediaType: m[1] as "image/jpeg" | "image/png" | "image/webp", data: m[2] } : null;
}

/** Photo progress check: compares the week-0 photo with the latest one. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const productId = body?.productId as ProductId;
  const before = parseDataUrl(body?.before?.image);
  const after = parseDataUrl(body?.after?.image);
  if (!PRODUCTS[productId]) return json({ error: "Unknown product." }, 400);
  if (!before || !after) return json({ error: "Please add both photos (JPG/PNG, under ~1 MB)." }, 400);

  const result = await askAI({
    system: `You compare two progress photos of the same body area: the first is the starting photo, the second is the latest.
Describe only visible changes relevant to the user's concern (e.g. bumps, redness, flakes, visible scalp, breakouts) in under 110 words:
- a one-line verdict: "Visible improvement", "Slight change", "No clear change", or "Hard to compare"
- 2–3 "- " bullets on what looks different (or the same)
- one tip for taking more comparable photos if lighting, angle or distance differ.
Never identify the person or comment on anything unrelated to the concern. If the photos don't show skin/hair/nails, say you can't compare them.

${productFacts(productId)}`,
    messages: [
      {
        role: "user",
        parts: [
          { text: `Starting photo (week ${Number(body.before.week) || 0}):` },
          { image: before },
          { text: `Latest photo (week ${Number(body.after.week) || 0}):` },
          { image: after },
          { text: "What has changed?" },
        ],
      },
    ],
  });

  return result.ok ? json({ text: result.text }) : json({ error: result.error }, result.status);
}
