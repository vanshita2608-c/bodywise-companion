# Is It Working? — a results companion for Be Bodywise customers

Built for the Mosaic Fellowship Builder Challenge (Part 2).

**Problem (from 5 customer conversations):** Be Bodywise customers can't tell whether a product is working. They don't know the step that makes it work, how long results realistically take, or which change in their routine caused an improvement. So they judge the product on gut feel, and slow or unclear results turn into "I'll switch to another one."

**What the app does**
1. **Use it right:** product-specific steps with the one *key step* people skip highlighted (e.g. leave the salicylic wash on for ~1 minute, let the roll-on dry fully).
2. **Know what to expect:** a week-by-week timeline and an honest "judge it at week N" point, adjusted for long-standing concerns.
3. **See if it's working:** a baseline rating, a 1-tap daily log, and a 30-second weekly check-in. Progress is charted against a typical range and turned into a plain verdict: *too early / working / slower than typical (and why) / mixed signal / not the right fit*.
4. **Attribution:** customers log other changes (new shampoo, diet, stress) so improvements aren't confounded.

## Tech
Next.js 15 (App Router) + TypeScript + React 19, exported as a static site. No backend; data stays in the browser (localStorage). No customer personal data is used in the app.

```
app/            layout, page, global styles
components/     Landing, Onboarding, Today / Progress / Guide screens, CheckinSheet, ProgressChart
lib/products.ts usage steps, key step, timelines per product
lib/logic.ts    progress maths + the "is it working?" verdict
lib/storage.ts  local storage + 5-week demo journey
```

## Run locally
```bash
npm install
npm run dev      # open http://localhost:3000
```

## Deploy
Import the GitHub repo on https://vercel.com/new and click Deploy. Every `git push` redeploys automatically.

Tip for reviewers: tap **"See a 5-week example"** on the home screen to see a filled-in journey instantly.

AI tools used: Claude (Claude Code) for analysis support and building.
