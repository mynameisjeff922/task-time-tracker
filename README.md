# Task Time Tracker

A to-do list that also tracks how much time you spend on each task or training.
Built for the ROMTech JavaScript Training final assignment with **React**, **Next.js** and **TypeScript**.

## Features

- Log in to use the app. Logged-out visitors are sent to the login page, then back to the page they asked for.
- Add, edit, complete and delete tasks. Each one is a **Task** or a **Training**.
- Start/Stop a live timer on any task. Only one runs at a time, so starting another stops the first.
- Log time by hand for work done away from the app.
- Search and filter (All / Active / Done, Tasks / Trainings). Filters live in the URL, so you can share or bookmark them.
- Dashboard: time today and this week, the running timer, where your time went, and recent sessions.
- Weekly report: time per day for the last 7 days, plus all-time totals.

Live version: hosted on Vercel, with data in a Supabase PostgreSQL database.

## Run it locally

You need Node.js 20.9+ and a [Supabase](https://supabase.com) project (the free plan is fine).

1. Copy `.env.example` to `.env.local` and fill it in:
   - `DATABASE_URL`: in Supabase, click **Connect** and copy the **Transaction pooler** connection string, then put your database password in it.
   - `SESSION_SECRET`: any long random string (the file shows a command that makes one).
   - `DEMO_USER_*`: the email and password you want to log in with.
2. Install, set up the database, and start:

```bash
npm install
npm run db:setup
npm run dev
```

`npm run db:setup` creates the tables from `db/schema.sql`, adds starter tasks (the remaining PITC training items), and creates your login account. The password is stored as a bcrypt hash. It's safe to run again, since it skips tables that already have data.

Open http://localhost:3000 and log in.

## Deploy to Vercel

1. Push the code to GitHub, then on [vercel.com/new](https://vercel.com/new) import the repo. Vercel detects Next.js automatically.
2. Before deploying, add these **Environment Variables**: `DATABASE_URL`, `SESSION_SECRET` and `NEXT_PUBLIC_TIME_ZONE` (same values as `.env.local`).
3. Click **Deploy**. Every push to `main` deploys again automatically.

## Where each part of the training shows up

| Training topic | Where to look |
| --- | --- |
| **React:** components and props | `components/task-item.tsx`, `components/category-badge.tsx`, `components/filter-tabs.tsx` |
| **React:** state, events and effects | `components/timer-button.tsx` (`useState`, `useTransition`, `onClick`), `components/use-now.ts` (`useEffect` + `setInterval`) |
| **React:** lists and keys | `app/(main)/tasks/page.tsx` (`tasks.map(...)`) |
| **Server vs. Client Components** | Pages in `app/` are Server Components. Files that start with `"use client"` are Client Components |
| **Next.js:** layouts, pages and `<Link>` | `app/layout.tsx`, `components/nav.tsx`, `components/nav-links.tsx` (active link via `usePathname`) |
| **Next.js:** fonts, images and metadata | `next/font` in `app/layout.tsx`, `next/image` logo in `components/nav.tsx`, title template and `generateMetadata` in `app/(main)/tasks/[id]/page.tsx` |
| **Next.js:** dynamic routes | `app/(main)/tasks/[id]/page.tsx` |
| **Next.js:** search params, search and filters | `components/search.tsx` (debounced `?q=`), `app/(main)/tasks/page.tsx` |
| **Next.js:** Server Actions and form validation | `lib/actions.ts`, `components/task-form.tsx` and `components/log-time-form.tsx` (`useActionState`) |
| **Next.js:** loading, error and 404 pages | `app/(main)/loading.tsx`, `app/(main)/error.tsx`, `app/not-found.tsx`, `app/(main)/tasks/[id]/not-found.tsx` |
| **Next.js:** Route Handlers (App Router API) | `app/api/timer/route.ts` (GET/POST/DELETE), `app/api/tasks/route.ts` |
| **Pages Router:** `_app`, `getServerSideProps` | `pages/_app.tsx`, `pages/report.tsx` |
| **Pages Router:** API Routes | `pages/api/summary.ts` |
| **Authentication** (Learn Next.js course) | `app/login/page.tsx` + `components/login-form.tsx` (form), `lib/auth-actions.ts` (Server Action that checks the bcrypt password), `lib/session.ts` + `lib/session-token.ts` (signed JWT cookie with `jose`), `proxy.ts` (redirects logged-out visitors), `lib/auth.ts` (checks the login inside every page, action and API) |
| **Database** (Learn Next.js course) | `db/schema.sql` (tables), `lib/db.ts` (Postgres client), SQL in `lib/actions.ts` and `lib/timer.ts` (including transactions), `scripts/setup-db.mjs` (setup and starter data) |
| **Route groups** | `app/(main)/layout.tsx` adds the nav to logged-in pages; `app/login` has its own layout |
| **TypeScript** | `lib/types.ts` (shared models), typed props everywhere, `PageProps<"/tasks/[id]">` route types, `tsconfig.json` (`strict: true`) |

## Project structure

```
proxy.ts             Sends logged-out visitors to /login
db/schema.sql        Database tables
scripts/setup-db.mjs Creates the tables and starter data (npm run db:setup)
app/                 App Router pages, layouts and Route Handlers
  login/             Login page
  (main)/            Logged-in pages (shares the nav bar layout)
    tasks/           Task list page
    tasks/[id]/      Task detail page
  api/timer/         Start/stop timer endpoint
  api/tasks/         Task list as JSON
  api/logout/        Log out
pages/               Pages Router (weekly report + /api/summary)
components/          React components
lib/
  types.ts           TypeScript types
  auth.ts            Who is logged in? (App Router)
  pages-auth.ts      Who is logged in? (Pages Router)
  session*.ts        Login cookie
  db.ts              Database connection (Supabase Postgres)
  data.ts            Queries (totals, summaries)
  actions.ts         Server Actions (create/edit/delete/log time)
  timer.ts           Start/stop timer logic
  time.ts            Formatting and time zone helpers
```

## API

Every endpoint except `/api/logout` returns `401` unless you're logged in.

| Method | URL | What it does |
| --- | --- | --- |
| GET | `/api/tasks?status=active&category=training&q=react` | List tasks with total time |
| GET | `/api/timer` | The running timer, if any |
| POST | `/api/timer` with body `{ "taskId": "..." }` | Start a timer |
| DELETE | `/api/timer` | Stop the running timer |
| POST | `/api/logout` | Log out |
| GET | `/api/summary` | Dashboard numbers plus the last 7 days (Pages Router API Route) |

## Notes

- Login uses a signed cookie (`jose`) and bcrypt password hashes, following the Next.js authentication guide. The Learn Next.js course does the same job with NextAuth.js. There's one account, set up in `.env.local`. Sign-up and per-user task lists would be the next step.
- Data lives in Supabase PostgreSQL. Row Level Security is turned on for every table, which blocks Supabase's public REST API; the app connects directly with the database connection string instead.
- Servers run in UTC, so "today" and displayed times use `NEXT_PUBLIC_TIME_ZONE` (default `Asia/Manila`).
- `pages/report.tsx` sets its title through a `title` prop that `pages/_app.tsx` renders with `next/head`. Importing `next/head` directly in the page caused a Turbopack dev error in this mixed App/Pages Router project.
