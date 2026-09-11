"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminConfig } from "@/lib/admin";
import { createAdminToken, secureEqual, SESSION_SECONDS } from "@/lib/admin-token";
import { allowRequest } from "@/lib/rate-limit";

export async function login(_previous: string, form: FormData): Promise<string> {
  const config = adminConfig();
  if (!config) return "Admin access is not configured. Update the admin values in your environment file.";
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowRequest(`admin:${ip}`, 5, 15 * 60000)) return "Too many attempts. Please try again in 15 minutes.";
  const password = form.get("password");
  if (typeof password !== "string" || password.length > 1024 || !secureEqual(password, config.password)) return "Incorrect password.";
  (await cookies()).set(ADMIN_COOKIE, createAdminToken(config.secret), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: SESSION_SECONDS,
  });
  redirect("/admin");
}
export async function logout() {
  (await cookies()).set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: 0 });
  redirect("/admin");
}
