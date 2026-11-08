# Is It Working? — a results companion for Be Bodywise customers

Built for the Mosaic Fellowship Builder Challenge (Part 2).

**Problem (from 5 customer conversations):** Be Bodywise customers can't tell whether a product is working. They don't know the step that makes it work, how long results realistically take, or which change in their routine caused an improvement. So they judge the product on gut feel, and slow or unclear results turn into "I'll switch to another one."

**What the app does**
1. **Use it right:** product-specific steps with the one *key step* people skip highlighted (e.g. leave the salicylic wash on for ~1 minute, let the roll-on dry fully).
2. **Know what to expect:** a week-by-week timeline and an honest "judge it at week N" point, adjusted for long-standing concerns.
3. **See if it's working:** a baseline rating, a 1-tap daily log, and a 30-second weekly check-in. Progress is charted against a typical range and turned into a plain verdict: *too early / working / slower than typical (and why) / mixed signal / not the right fit*.
4. **Attribution:** customers log other changes (new shampoo, diet, stress) so improvements aren't confounded.

**AI / ML features**
- **AI progress coach:** Claude reads your check-ins and explains your progress in plain words, with one thing to do this week.
- **Ask anything:** a private chat for "silly" questions people hesitate to ask customer care, grounded in the product's facts and your progress.
- **Photo progress check:** add a weekly photo; Claude compares your latest photo with week 0 (photos stay on the device until you tap compare).
- **Results forecast (ML):** a ridge-regression model fitted to your check-ins predicts your improvement range and chance of a meaningful result by the judge week.

## Tech
Next.js 15 (App Router) + TypeScript + React 19. AI via the Anthropic Claude API (`claude-opus-5-5`) in server routes (`app/api/coach`, `ask`, `photo`); the key never reaches the browser. Tracking data and photos stay in the browser (localStorage); only anonymous ratings, and photos when you tap compare, are sent to the AI. No customer personal data is used in the app.

```
app/            layout, page, global styles
components/     Landing, Onboarding, Today / Progress / Guide screens, CheckinSheet, ProgressChart
lib/products.ts usage steps, key step, timelines per product
lib/logic.ts    progress maths + the "is it working?" verdict
lib/storage.ts  local storage + 5-week demo journey
lib/predict.ts  ML forecast (ridge regression + uncertainty)
lib/ai.ts       server-side Claude client + safety rules
app/api/*       AI routes: coach, ask, photo
```

## Run locally
```bash
npm install
cp .env.example .env.local   # paste your ANTHROPIC_API_KEY
npm run dev                  # open http://localhost:3000
```

## Deploy
Import the GitHub repo on https://vercel.com/new, add the environment variable `ANTHROPIC_API_KEY`, and click Deploy. Every `git push` redeploys automatically.

Tip for reviewers: tap **"See a 5-week example"** on the home screen to see a filled-in journey instantly.

AI tools used: Claude (Claude Code) for analysis support and building.
