import { afterEach, expect, it, vi } from "vitest";
import { createAdminToken, verifyAdminToken, SESSION_SECONDS } from "../src/lib/admin-token";
vi.mock("server-only", () => ({}));
const cookieStore = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
import { adminConfig, isAdmin } from "../src/lib/admin";
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });
it("rejects missing and placeholder admin configuration", async () => {
  vi.stubEnv("ADMIN_PASSWORD", "REPLACE_ME_WITH_A_STRONG_ADMIN_PASSWORD");
  vi.stubEnv("ADMIN_SESSION_SECRET", "REPLACE_ME_WITH_A_RANDOM_SESSION_SECRET");
  expect(adminConfig()).toBeNull();
  expect(await isAdmin()).toBe(false);
});
it("requires a valid signed cookie to grant dashboard access", async () => {
  vi.stubEnv("ADMIN_PASSWORD", "a-unique-long-test-password");
  vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret-at-least-32-characters");
  expect(await isAdmin()).toBe(false);
  cookieStore.get.mockReturnValue({ value: "forged" });
  expect(await isAdmin()).toBe(false);
  cookieStore.get.mockReturnValue({ value: createAdminToken(adminConfig()!.secret) });
  expect(await isAdmin()).toBe(true);
  vi.stubEnv("ADMIN_PASSWORD", "another-unique-test-password");
  expect(await isAdmin()).toBe(false);
});
it("rejects tampering, a different signing secret, malformed tokens, and expired sessions", () => {
  const now = 1700000000000;
  const token = createAdminToken("secret", now);
  expect(verifyAdminToken(token, "secret", now)).toBe(true);
  expect(verifyAdminToken(token.slice(0, -1) + "z", "secret", now)).toBe(false);
  expect(verifyAdminToken(token, "other", now)).toBe(false);
  expect(verifyAdminToken("", "secret", now)).toBe(false);
  expect(verifyAdminToken(token, "secret", now + SESSION_SECONDS * 1000)).toBe(false);
});
