# Month-End Money Plan

A static, single-page budget planner for your bank accounts. No build step, no backend. Your numbers are saved only in your own browser (localStorage).

## What it does

- **Today** – "safe to spend today" figure, quick logging of day-to-day spends, adhoc spends, savings and income, and a live goal check.
- **Plan** – balances, income still to come, bills (tick them as paid and the account balance updates), and the day-to-day budget.
- **Log** – every entry, filterable, with delete/undo. Deleting puts the money back.
- **Goal** – target amount and month. Shows the monthly saving needed, whether you're on pace, whether adhoc spending or overspending is the cause, catch-up options, a "can I afford it?" tester and a monthly chart.
- **Months** – close the month (planned vs actual, kept in history), then set up the next one with a day-to-day budget sized to still hit your goal. Also backup export/import.

Data saved by the older version is migrated automatically.

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
