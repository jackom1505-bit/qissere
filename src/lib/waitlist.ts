import "server-only";
import { getSql } from "./db";

export async function addSubscriber(email: string) {
  const sql = getSql();
  // The unique constraint makes simultaneous requests and retries safe.
  await sql`INSERT INTO waitlist_subscribers (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
}

export async function getSubscriberCount(): Promise<number> {
  const sql = getSql();
  const [row] = await sql`SELECT count(*)::int AS count FROM waitlist_subscribers`;
  return row.count;
}

export type Subscriber = { id: string; email: string; created_at: string };
export async function listSubscribers(page: number, search: string) {
  const sql = getSql();
  const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
  const [countRows, rows] = await sql.transaction([
    sql`SELECT count(*)::int AS count FROM waitlist_subscribers WHERE email ILIKE ${pattern}`,
    sql`SELECT id::text, email, created_at FROM waitlist_subscribers WHERE email ILIKE ${pattern} ORDER BY created_at DESC, id DESC LIMIT 50 OFFSET ${(page - 1) * 50}`,
  ], { isolationLevel: "RepeatableRead", readOnly: true });
  return { total: countRows[0].count as number, subscribers: rows as Subscriber[] };
}
