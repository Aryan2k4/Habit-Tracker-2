# Bloom

[Hosted app](https://bloom-garden-habits-aryan.dualdandelion32.chatgpt.site) · [Rebuild source](https://github.com/Aryan2k4/Habit-Tracker-2/tree/bloom-rebuild)

The hosted app currently requires the owner's connected ChatGPT account. The original project remains on the repository's `master` branch.

Bloom turns meaningful goals into scheduled habits and a garden that grows with real check-ins. This is a fresh full-stack rebuild; the previous React/Supabase project is preserved in the sibling `Habit-Tracker-main` directory.

## Stack

- React 19, TypeScript with strict checking, and Vinext (Next.js App Router APIs on Vite).
- Cloudflare Worker server and D1 relational persistence, with Drizzle schema migrations.
- Platform-managed Sign in with ChatGPT; every personal query and mutation is scoped to the authenticated user.
- WebLLM for optional on-device inference. No paid AI API or secret is required.
- Responsive CSS, original Bloom photograph, custom animated SVG plant, accessible native dialogs, and reduced-motion support.

## Features

- Goals, editable milestones and habits, weekday schedules, pause/resume, dated check-ins.
- Calendar planner with dated tasks and priorities.
- Current and longest activity streaks, 12-week heatmap, weekly completion counts.
- Six plant growth stages, watering feedback, flower and pot customization.
- Persisted focus sessions with server-enforced completion time.
- Private journal with daily mood and editable reflections.
- Local AI coaching with actual aggregate progress, and an explicitly labeled non-AI guided planner.
- Invitation-code challenges sharing only names and active-day counts.
- Optional open-app browser reminders, recurring ICS calendar export, and JSON data export.

## Run locally

Requires Node 24 (Node 22.13+ runs the app; Node 24 is recommended for the native TypeScript test runner), npm, Git, and tar.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_wide_franklin_richards.sql
npm run dev -- --port 5180
```

Apply the initial migration once to a new local database. Visit the printed local URL and select Sign in. The portable development adapter supplies the local `Seedy` test account only on loopback. This mock authentication is not included in production.

```sh
npm run typecheck
npm test
# With the local development server running on port 5180:
node tests/api-smoke.mjs
```

The integration test creates and cleans up its own goal, habit and task records. It also starts/cancels a test focus session, replacing an existing unfinished local test session. Never run it against production.

## Data and behavior

`db/schema.ts` defines goals, habits, logs, tasks, journals, sessions, profiles, circles, and memberships. All writes pass a Zod discriminated union and same-origin validation. Completion writes are idempotent under the `(owner, habit, date)` primary key. Goal creation and its habits are inserted atomically. Foreign keys cascade intentional goal deletion.

Dates follow the profile time zone. A global activity streak is a consecutive series of days with at least one habit check-in. Yesterday's streak remains active until today ends. Plant growth follows total retained check-ins, so a missed day does not destroy the garden. Removing check-ins or deleting goals can reduce growth. Paused habits are excluded from completion percentages; schedule edits recalculate historical percentages. Existing logs remain available in the export.

The timer continues across refreshes. Users explicitly save an elapsed session. Canceling discards an unfinished session. Journal text is never supplied to the AI or challenge leaderboard.

## Hosting and access

`.openai/hosting.json` binds this checkout to its Sites project and D1 database. The Sites pipeline builds the Worker, applies migrations, and publishes it. Authentication is provided by Sites and is not a portable standalone OAuth implementation. To host on another platform, supply a trusted identity adapter; never trust client-supplied identity headers on an unprotected origin.

The initial Site audience is owner-only. Sharing the site with other people is separate from challenge invitation codes. A challenge code does not grant access to a private hosted site.

## AI and reminder limits

The AI module is loaded only when requested. Model weights are downloaded to the browser, require WebGPU support and sufficient memory, and may take several minutes. Model hosting, browser policy, or hardware can prevent loading. Suggestions can be inaccurate. The guided planner works without AI and is labeled accordingly. No data is sent to a hosted AI API, although model downloads contact the model provider.

Browser reminders require notification permission and an open Bloom tab. Calendar export lets a calendar app deliver reminders when Bloom is closed; calendar import and notification behavior depend on that app. This release does not claim background web push or offline editing.

## Preservation

The original pink flower photograph is retained unmodified in `public/android-chrome-512x512.png`, the landing page, sidebar, and original icon assets. No old `.env` or user records were copied into this rebuild.
