# QISSARÉ

Next.js App Router, React, TypeScript, Tailwind CSS, and React Three Fiber.

## Development

Use Node.js 20.9 or newer (Node.js 22 LTS recommended).

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

## Adding a backend

Add route handlers at `src/app/api/<name>/route.ts`, exporting functions such
as `GET` or `POST`. Call them from the frontend with `fetch('/api/<name>')`.
Keep database access and secrets in server code. Put local secrets in
`.env.local` (ignored by Git); only variables intentionally exposed to the
browser should use the `NEXT_PUBLIC_` prefix.

The existing waitlist and discovered secrets still use browser local storage.
The waitlist does not save email addresses or send messages. Connect it to a
database-backed route when implementing the real signup backend.
