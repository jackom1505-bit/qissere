// Best-effort per-process limits. Add host-level rate limits for multi-instance deployments.
const buckets = new Map<string, { count: number; reset: number }>();
export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  for (const [id, bucket] of buckets) if (bucket.reset <= now) buckets.delete(id);
  const bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= 10000) return false;
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}
