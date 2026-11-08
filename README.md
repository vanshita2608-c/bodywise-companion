# Is It Working? — a results companion for Be Bodywise customers

Built for the Mosaic Fellowship Builder Challenge (Part 2).

**Problem (from 5 customer conversations):** Be Bodywise customers can't tell whether a product is working. They don't know the step that makes it work, how long results realistically take, or which change in their routine caused an improvement. So they judge the product on gut feel, and slow or unclear results turn into "I'll switch to another one."

**What the app does**
1. **Use it right:** product-specific steps with the one *key step* people skip highlighted (e.g. leave the salicylic wash on for ~1 minute, let the roll-on dry fully).
2. **Know what to expect:** a week-by-week timeline and an honest "judge it at week N" point, adjusted for long-standing concerns.
3. **See if it's working:** a baseline rating, a 1-tap daily log, and a 30-second weekly check-in. Progress is charted against a typical range and turned into a plain verdict: *too early / working / slower than typical (and why) / mixed signal / not the right fit*.
4. **Attribution:** customers log other changes (new shampoo, diet, stress) so improvements aren't confounded.

Single static file (`index.html`), no build step, no backend. Data stays in the browser (localStorage). No customer personal data is used in the app.

## Run locally
Double-click `index.html`, or:
```bash
cd ~/bodywise-companion
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy (pick one, ~2 minutes)
- **Netlify Drop (easiest):** go to https://app.netlify.com/drop, drag the `bodywise-companion` folder in, and copy the URL. Sign in so the link doesn't expire.
- **Vercel:** `npx vercel` inside the folder and accept the defaults → `npx vercel --prod`.
- **GitHub Pages:** push the folder to a public repo → Settings → Pages → Deploy from branch `main` / root.

Tip for reviewers: tap **"See a 5-week example"** on the home screen to see a filled-in journey instantly.

AI tools used: Claude (Claude Code) for analysis support and building.
