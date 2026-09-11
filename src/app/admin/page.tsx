import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { listSubscribers } from "@/lib/waitlist";
import LoginForm from "./LoginForm";
import { logout } from "./actions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Waitlist Admin · QISSARÉ", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  if (!(await isAdmin())) return <main className="min-h-screen flex items-center justify-center px-6 py-16">
    <div className="glass-warm w-full max-w-md rounded-xl p-8 sm:p-10">
      <Link href="/" className="font-display text-brass-300 tracking-widest">QISSARÉ</Link>
      <p className="font-mono mt-8 text-xs uppercase tracking-widest text-cream-200/50">The guest list</p>
      <h1 className="font-serif mt-3 text-3xl">Welcome back.</h1>
      <p className="mt-3 text-sm text-cream-200/60">Sign in to see who’s waiting for the first cup.</p>
      <LoginForm />
    </div>
  </main>;

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 254) : "";
  const pageNumber = Number(params.page);
  const page = Number.isInteger(pageNumber) && pageNumber > 0 ? Math.min(pageNumber, 1000000) : 1;
  let data: Awaited<ReturnType<typeof listSubscribers>> | null = null;
  try { data = await listSubscribers(page, search); } catch { /* Display a safe, actionable error below. */ }
  const pageUrl = (next: number) => `/admin?${new URLSearchParams({ q: search, page: String(next) })}`;
  const pages = data ? Math.max(1, Math.ceil(data.total / 50)) : 1;
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-10 sm:py-16">
    <header className="flex items-center justify-between gap-4 border-b border-brass-400/20 pb-6">
      <Link href="/" className="font-display text-xl tracking-widest text-brass-300">QISSARÉ</Link>
      <form action={logout}><button className="text-sm text-cream-200/70 underline underline-offset-4">Sign out</button></form>
    </header>
    <div className="mt-12 flex flex-wrap items-end justify-between gap-6">
      <div><p className="font-mono text-xs uppercase tracking-[0.3em] text-brass-400">Chapter One</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">The guest list.</h1><p className="mt-4 text-cream-200/60">Every email, a seat waiting to be filled.</p></div>
      <Link href={pageUrl(page)} className="btn-ghost rounded px-5 py-3 text-sm">Refresh list</Link>
    </div>
    <section className="glass-warm mt-10 rounded-xl p-6"><p className="text-sm text-cream-200/60">{search ? "Matching subscribers" : "Total subscribers"}</p><p className="mt-2 font-display text-4xl text-brass-300">{data ? data.total.toLocaleString("en-US") : "—"}</p></section>
    <form className="my-8 flex flex-wrap gap-3" action="/admin">
      <label className="sr-only" htmlFor="search">Search emails</label><input id="search" type="search" name="q" defaultValue={search} placeholder="Search by email…" maxLength={254} className="min-w-0 flex-1 rounded border border-brass-400/25 bg-ink-900 px-4 py-3 focus:outline-brass-400" />
      <button className="btn-brass rounded px-6 py-3">Search</button>{search && <Link href="/admin" className="px-4 py-3 underline">Clear</Link>}
    </form>
    {!data ? <div role="alert" className="rounded border border-ember-400/30 p-6 text-cream-200"><h2 className="font-serif text-xl">We couldn’t load the guest list.</h2><p className="mt-2 text-sm">Check DATABASE_URL and run npm run db:init, then refresh this page.</p></div> : <>
      <div className="overflow-x-auto rounded-xl border border-brass-400/20">
        <table className="w-full text-left text-sm"><caption className="sr-only">Waitlist subscribers, newest first</caption><thead className="bg-ink-800 text-brass-300"><tr><th scope="col" className="px-5 py-4">Email address</th><th scope="col" className="px-5 py-4">Joined (India time)</th></tr></thead>
          <tbody>{data.subscribers.map(row => <tr key={row.id} className="border-t border-brass-400/10"><td className="px-5 py-4 break-all">{row.email}</td><td className="whitespace-nowrap px-5 py-4 text-cream-200/60">{new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(new Date(row.created_at))}</td></tr>)}</tbody>
        </table>
        {data.subscribers.length === 0 && <p className="px-5 py-12 text-center text-cream-200/60">{search ? "No emails match your search." : page > 1 ? "No subscribers on this page." : "No signups yet. New subscribers will appear here."}</p>}
      </div>
      <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm text-cream-200/70"><span>Page {page} · {data.total.toLocaleString("en-US")} results</span><div className="flex gap-6">{page > 1 && <Link href={pageUrl(page - 1)}>← Previous</Link>}{page < pages && <Link href={pageUrl(page + 1)}>Next →</Link>}</div></nav>
    </>}
  </main>;
}
