import { beforeEach, describe, expect, it, vi } from "vitest";
const repository = vi.hoisted(() => ({ addSubscriber: vi.fn(), getSubscriberCount: vi.fn() }));
vi.mock("@/lib/waitlist", () => repository);
import { GET, POST } from "../src/app/api/waitlist/route";
import { normalizeEmail } from "../src/lib/waitlist-validation";

let sequence = 0;
const request = (body: unknown, ip = `test-${sequence++}`) => new Request("http://localhost/api/waitlist", {
  method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(body),
});
beforeEach(() => vi.resetAllMocks());
describe("email submissions", () => {
  it("normalizes emails before storage", async () => {
    repository.addSubscriber.mockResolvedValue(undefined);
    const response = await POST(request({ email: "  Guest+Cafe@Example.COM  " }));
    expect(response.status).toBe(200);
    expect(repository.addSubscriber).toHaveBeenCalledWith("guest+cafe@example.com");
    expect(await response.json()).toEqual({ success: true });
  });
  it.each(["bad", "@example.com", "a..b@example.com", "a@example", "a@-host.com", "a\n@example.com", "x".repeat(65) + "@example.com", null, 123])("rejects invalid email %s", async email => {
    expect(normalizeEmail(email)).toBeNull();
    expect((await POST(request({ email }))).status).toBe(400);
    expect(repository.addSubscriber).not.toHaveBeenCalled();
  });
  it("does not claim success or leak database details when persistence fails", async () => {
    repository.addSubscriber.mockRejectedValue(new Error("postgresql://private:secret@host"));
    const response = await POST(request({ email: "test@example.com" }));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret");
  });
  it("never returns emails in the public count response", async () => {
    repository.getSubscriberCount.mockResolvedValue(7);
    const response = await GET();
    expect(await response.json()).toEqual({ count: 7 });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("reports unavailable rather than inventing a count", async () => {
    repository.getSubscriberCount.mockRejectedValue(new Error("offline"));
    expect((await GET()).status).toBe(503);
  });
  it("discards honeypot submissions", async () => {
    expect((await POST(request({ email: "test@example.com", website: "spam" }))).status).toBe(200);
    expect(repository.addSubscriber).not.toHaveBeenCalled();
  });
  it("rejects oversized bodies without Content-Length", async () => {
    expect((await POST(request({ email: "x".repeat(3000) }))).status).toBe(413);
    expect(repository.addSubscriber).not.toHaveBeenCalled();
  });
  it("limits repeated submissions", async () => {
    for (let i = 0; i < 10; i++) expect((await POST(request({ email: "test@example.com" }, "limited-ip"))).status).toBe(200);
    expect((await POST(request({ email: "test@example.com" }, "limited-ip"))).status).toBe(429);
  });
  it("rejects malformed JSON", async () => {
    const response = await POST(new Request("http://localhost/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }));
    expect(response.status).toBe(400);
  });
});
