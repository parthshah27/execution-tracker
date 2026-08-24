# GoalManager

A mobile-first personal tracker for:
- Trading P&L and trading discipline
- Upskilling and study time
- Daily achievements and reflections
- Streaks and simple progress metrics

## Tech stack

- Vite + React + TypeScript
- Supabase (Postgres) as the backend

## Latest implementation

This version uses Supabase for persistence. The client is initialized in `src/supabaseClient.ts` and domain services live under `src/services/` (`dailyEntries.ts`, `goals.ts`, `weeklyReviews.ts`). A SQL migration for the primary `daily_entries` table is available at `supabase/daily_entries.sql`.

## Run locally

1. Create a `.env` file in the project root with these variables:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

2. Install and run in development:

```bash
npm install
npm run dev
```

3. Build for production:

```bash
npm run build
npm run preview
```

## Database / Migrations

- To create the required table locally or on your Supabase project, run the SQL in `supabase/daily_entries.sql` (creates `daily_entries`).
- The app expects the `daily_entries` table shape matching the queries in `src/services/dailyEntries.ts`.

## Vercel deployment

1. Push this repository to GitHub (or Git provider) and import the project into Vercel.
2. Set the following Environment Variables in Vercel (Project Settings → Environment Variables):

```
VITE_SUPABASE_URL    -> your Supabase project URL
VITE_SUPABASE_ANON_KEY -> your Supabase anon/public key
```

3. Use these build settings (Vercel detects Vite automatically, but verify):

- Build command: `npm run build`
- Output directory: `dist`

4. Deploy. Vercel will build and serve the static app. Ensure your Supabase project's RLS and API settings allow requests from your deployed origin or use appropriate row-level security policies and service keys for server-side actions.

## Notes & troubleshooting

- If the app can't read/write entries after deployment, verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct and that the Supabase table exists and has the correct columns.
- For local debugging, check the network requests in the browser devtools to confirm Supabase responses.

## Quick links

- Client init: `src/supabaseClient.ts`
- Services: `src/services/dailyEntries.ts`, `src/services/goals.ts`, `src/services/weeklyReviews.ts`
- Migration SQL: `supabase/daily_entries.sql`