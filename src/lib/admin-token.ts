import { createHmac, randomBytes, timingSafeEqual, createHash } from "node:crypto";
export const SESSION_SECONDS = 8 * 60 * 60;
export function secureEqual(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}
export function createAdminToken(secret: string, now = Date.now()) {
  const payload = `${Math.floor(now / 1000) + SESSION_SECONDS}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}
export function verifyAdminToken(token: string, secret: string, now = Date.now()) {
  const parts = token.split(".");
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
  const expires = Number(parts[0]);
  const current = Math.floor(now / 1000);
  if (expires <= current || expires > current + SESSION_SECONDS) return false;
  const signature = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest("hex");
  return secureEqual(signature, parts[2]);
}
