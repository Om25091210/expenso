# Month-End Money Plan

A static, single-page budget planner for your bank accounts. No build step, no backend. Your numbers are saved only in your own browser (localStorage).

## What it does

- **Today** – "safe to spend today" figure, quick logging of day-to-day spends, adhoc spends, savings and income, and a live goal check.
- **Plan** – balances for up to 8 banks (starts with 4; add, rename or remove them),  income still to come, bills (tick them as paid and the account balance updates), and the day-to-day budget.
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

Without sync, data is stored per browser, so your phone and laptop keep separate numbers. Turn on sync (below) to share them.

## Sync across devices (optional)

Your data can live in a Google Sheet that you own, reached through a small Google Apps Script. No database or server settings are needed on Vercel. The app stays local-first: every change is saved in the browser immediately and uploaded in the background, so it keeps working offline.

One-time setup (about five minutes):

1. **Make the sheet.** Create a new Google Sheet (any name). Open **Extensions → Apps Script**, delete the sample code, paste in everything from [`apps-script/Code.gs`](apps-script/Code.gs) and save.
2. **Optional: set a passphrase.** In the Apps Script editor open **Project Settings** (gear icon) → **Script properties** → **Add script property**. Name: `SYNC_PASSPHRASE`. Value: a long, unguessable phrase. Skip this step and the sheet is open to anyone who has the web app URL, and that URL sits in the public page source, so only skip it if you're fine with that. To remove the passphrase later, delete the property. Nothing needs redeploying.
3. **Deploy it.** Click **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then **Deploy**. Google asks you to authorise your own script. Choose your account, then **Advanced → Go to (project name)** and allow it. Copy the **Web app URL** (it ends in `/exec`).
4. **Connect.** Put the URL in the `SYNC_URL` constant near the top of the sync section in `index.html` and redeploy. With no passphrase set, every device then connects by itself. With one set, open **Months → Sync across devices** on each device, enter it and press **Connect and sync**. Without `SYNC_URL` you paste the URL there too. The first device uploads its data. A device that already has its own numbers is asked which copy to keep.

Notes:

- Your data is one JSON document in a sheet called `data` (revision in `A1`, the JSON split across column A below it). You can look at it, but don't edit it by hand. Google Sheets' **File → Version history** gives you free restore points.
- If two devices edit while one is offline, you're asked which copy to keep. The other is overwritten.
- If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** or the change won't go live.
- If you use a passphrase it is sent in the request body over HTTPS, never in the URL, and only to `script.google.com` addresses.
- Export a backup from the Months tab now and then.
