"use client";
import { useActionState } from "react";
import { login } from "./actions";
export default function LoginForm() {
  const [error, action, pending] = useActionState(login, "");
  return <form action={action} className="mt-8 space-y-5">
    <label className="block text-sm text-cream-200" htmlFor="password">Admin password</label>
    <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024} className="w-full rounded border border-brass-400/30 bg-ink-950 px-4 py-3 text-cream-50 focus:outline-brass-400" />
    {error && <p role="alert" className="text-sm text-ember-300">{error}</p>}
    <button disabled={pending} className="btn-brass w-full rounded px-5 py-3 disabled:opacity-50">{pending ? "Signing in…" : "Open dashboard"}</button>
  </form>;
}
