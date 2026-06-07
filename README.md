# Peptide Rotation — Injection Tracker

Single-user peptide injection rotation tracker. Faithful clone of the original
UI, with state stored in **Postgres** (instead of `localStorage`) so it persists
across devices and redeploys. One Next.js service — deploys to Railway as-is.

- **GHK-Cu** (cyan) + **IPA+CJC** (purple), two pins per session
- 6 body zones (upper / mid / lower × left / right)
- Row advances each session, side flips, 72h cooldown per zone
- Three tabs: Today / Map / Log

## Stack
- Next.js 14 (App Router) — frontend + API in one deploy
- Postgres via `pg`, single-row JSONB state (`tracker_state`, `id = 1`)
- Schema is created automatically on first request — no migration step

## Deploy on Railway
1. Push this folder to a GitHub repo.
2. In Railway: **New Project → Deploy from GitHub repo** → pick the repo.
3. Add a database: **New → Database → Add PostgreSQL** (same project).
4. Open your app service → **Variables** → add:
   ```
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   ```
   (the internal reference — no SSL needed, fastest path).
5. Deploy. Railway/Nixpacks auto-runs `npm install`, `npm run build`,
   then `npm start`, binding to `$PORT`. Open the generated URL.

That's it. The table is created on first load; data lives in Postgres.

## First-run note
On the very first load the app seeds the same demo state the original used
(UR = GHK-Cu, UL = IPA+CJC, freshly pinned, session 2). Tap **Reset All Data**
once to start from a clean slate — after that it stays clean.

## Local development
```bash
cp .env.example .env.local      # set DATABASE_URL to a Postgres you can reach
npm install
npm run dev                     # http://localhost:3000
```

## API
- `GET /api/state` → `{ logs, sessionIndex }` (seeds on first ever call)
- `PUT /api/state` body `{ logs, sessionIndex }` → upserts the single state row
