import "server-only";
import { cookies } from "next/headers";
import { verifyAdminToken } from "./admin-token";
export const ADMIN_COOKIE = "qissare_admin";
export function adminConfig() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || password.length < 16 || password.includes("REPLACE_ME") || !secret || secret.length < 32 || secret.includes("REPLACE_ME")) return null;
  // Changing either value invalidates existing sessions.
  return { password, secret: `${secret}:${password}` };
}
export async function isAdmin() {
  const config = adminConfig();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(config && token && verifyAdminToken(token, config.secret));
}
