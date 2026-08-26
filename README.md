<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9d15a013-8b74-4395-8f1b-45af20231be3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and fill in the values (see Authentication below)
3. Run the app (starts the Express server + Vite, which both serve on port 3000):
   `npm run dev`

## Authentication (Better Auth + MongoDB)

Sign-up / sign-in is handled by [Better Auth](https://www.better-auth.com) with
the official `mongodb` driver adapter. The API is mounted at `/api/auth/*` on
the same server that serves the app.

Set these variables in `.env` (placeholder values are already present):

| Variable            | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | Secret for signing & encrypting — at least 32 chars. Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL`   | Public base URL of the app (cookies/redirects) — e.g. `http://localhost:3000` |
| `MONGODB_URI`       | MongoDB Driver connection string (the official `mongodb` driver). Include the database name or set `MONGODB_DB_NAME`. |
| `MONGODB_DB_NAME`   | Optional database-name override (defaults to the name in `MONGODB_URI`)  |
| `PORT`              | Port the server binds to (default `3000`)                              |

Without a reachable MongoDB, auth requests fail fast with a `500` — plug in a
real `MONGODB_URI` (+ `BETTER_AUTH_SECRET`) to go live.

- `npm run dev` — full-stack dev (Express + Better Auth + Vite HMR on port 3000)
- `npm run dev:client` — Vite client only (auth API will not be available)
- `npm run start` — production: serves the built `dist/` + auth API
