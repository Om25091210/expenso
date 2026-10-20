# Month-End Money Plan

A static, single-page budget planner for three bank accounts. No build step, no backend. Your numbers are saved only in your own browser (localStorage).

## Files

- `index.html` — the whole app
- `favicon.svg`, `icon-192.png`, `icon-512.png` — icons
- `manifest.webmanifest` — lets you "Add to Home Screen" on your phone
- `vercel.json` — Vercel config (clean URLs)

## Deploy on Vercel

**Option 1: GitHub (auto-deploys on every push)**

```bash
cd budget-site
git init && git add . && git commit -m "Month-end money plan"
gh repo create money-plan --private --source=. --push
```

Then on vercel.com → Add New → Project → import `money-plan`.
Framework preset: **Other**. Leave build command and output directory empty. Deploy.

**Option 2: Vercel CLI**

```bash
cd budget-site
npx vercel --prod
```

## Use it on your phone

Open the Vercel URL in Chrome → menu → **Add to Home screen**. It opens like an app.

Data is stored per browser, so your phone and laptop keep separate numbers.
