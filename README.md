# QISSARÉ

Next.js App Router, React, TypeScript, Tailwind CSS, and React Three Fiber.

## Development

Use Node.js 22.12 or newer (required by the test tooling).

```sh
npm install
npm run dev
```

Open http://localhost:3000.

Development and builds use Next.js's Webpack bundler for compatibility with
restricted environments that block Turbopack worker processes.

```sh
npm run typecheck
npm run build
npm start
```

`npm start` serves the production build. Deploy to a host that supports a
Next.js server to use backend routes; the old Vite `dist` output is obsolete.

## Project structure

- `src/app/layout.tsx`: document layout, metadata, fonts, and global styles.
- `src/app/page.tsx`: home page (Server Component).
- `src/App.tsx`: interactive landing page (Client Component).
- `src/components/`: existing UI, animations, and 3D scene.
- `src/app/api/health/route.ts`: example backend endpoint; GET `/api/health`
  returns `{ "status": "ok" }`.

## Waitlist and admin dashboard

Visitors can submit their email in the bottom form without creating an account.
The server validates and normalizes the email, stores it in Neon PostgreSQL,
and prevents duplicates with a database unique constraint. The public count
comes from the database; old simulated local-storage signups are not imported.
No confirmation or marketing emails are sent by this implementation.

### Setup

1. `.env.local` already contains placeholders. Replace `DATABASE_URL` with the
   connection string from the Neon project's **Connect** dialog, including
   `sslmode=require`. `.env.example` documents the required variables.
2. Set a unique `ADMIN_PASSWORD` of at least 16 characters and a random
   `ADMIN_SESSION_SECRET` of at least 32 characters. You can generate the
   secret with `openssl rand -hex 32`. Placeholder values are rejected.
3. Run `npm run db:init` to create the table and index. It is safe to rerun;
   existing subscriber data is preserved. Alternatively, run `db/schema.sql`
   in Neon's SQL Editor.
4. Run `npm run dev`, submit an email from the home page, then visit `/admin`
   and enter your admin password. Use search, refresh, and pagination to
   browse emails and signup dates. Each page contains up to 50 signups.

The environment values are **server-only**: never prefix them with
`NEXT_PUBLIC_` or commit real credentials. On deployment, configure the same
three values in your host's environment settings, initialize the target
Neon database, and use HTTPS. Restart the app after changing local values.

The admin dashboard uses a signed, HTTP-only session cookie that expires
in eight hours. Changing either admin environment value invalidates existing
sessions. Customer authentication and external auth services are not needed.
The admin page checks authorization before querying subscriber data.

Without a real Neon connection and initialized schema, the app still builds,
but submissions fail with a retry message and the admin dashboard displays a
setup error. No submissions are silently stored in memory or local storage.

### API and files

- `POST /api/waitlist`: JSON `{ "email": "guest@example.com" }`; returns
  `{ "success": true }` for both a new signup and a duplicate.
- `GET /api/waitlist`: returns `{ "count": 0 }` with the actual count, never emails.
- `src/lib/waitlist.ts`: parameterized Neon queries.
- `db/schema.sql`: persistent schema with email uniqueness and date index.
- `src/app/admin/`: protected dashboard and admin session actions.

The signup endpoint uses body-size limits, a honeypot, and a best-effort
per-process limit of 10 valid attempts per IP per minute. Admin login allows
5 attempts per IP per 15 minutes. For public deployment, configure host-level
rate limits as well: in-memory limits reset on restart and are not shared
between server instances. The hosting proxy must overwrite `X-Forwarded-For`
rather than accept client-supplied values.

### Verification

```sh
npm test
npm run typecheck
npm run build
```

Tests cover validation, unavailable persistence, public response privacy,
request limits, conflict-safe query construction, and admin session checks.
Database calls in unit tests are mocked. After entering real credentials,
verify a signup appears in `/admin`, resubmit with different casing to check
there is only one record, and confirm it remains after restarting the app.
