import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const sql = vi.hoisted(() => vi.fn().mockResolvedValue([]));
vi.mock("@/lib/db", () => ({ getSql: () => sql }));
import { addSubscriber } from "../src/lib/waitlist";
it("uses parameterized SQL and a conflict-safe insert for repeated signups", async () => {
  const email = "guest@example.com";
  await addSubscriber(email);
  await addSubscriber(email);
  const [template, value] = sql.mock.calls[0];
  expect(template.join("?")).toContain("VALUES (?) ON CONFLICT (email) DO NOTHING");
  expect(value).toBe(email);
  expect(sql).toHaveBeenCalledTimes(2);
});
