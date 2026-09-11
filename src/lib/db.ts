import "server-only";
import { neon } from "@neondatabase/serverless";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("REPLACE_ME") || url.includes("example.invalid")) {
    throw new Error("Database is not configured");
  }
  return neon(url, { fetchOptions: { signal: AbortSignal.timeout(10000) } });
}
