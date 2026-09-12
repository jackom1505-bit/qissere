import { addSubscriber, getSubscriberCount } from "@/lib/waitlist";
import { normalizeEmail } from "@/lib/waitlist-validation";
import { allowRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  try {
    return json({ count: await getSubscriberCount() });
  } catch (error) {
    console.error("Waitlist count error:", error);
    return json({ error: "The waitlist is temporarily unavailable." }, 503);
  }
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Expected JSON." }, 415);
  if (Number(request.headers.get("content-length")) > 2048) return json({ error: "Request too large." }, 413);
  // A bounded stream also limits requests without a Content-Length header.
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Missing request body." }, 400);
    const decoder = new TextDecoder();
    let text = "";
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 2048) { await reader.cancel(); return json({ error: "Request too large." }, 413); }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch { return json({ error: "Invalid request." }, 400); }
  if (!body || typeof body !== "object") return json({ error: "Invalid request." }, 400);
  const input = body as Record<string, unknown>;
  if (input.website) return json({ success: true }); // Honeypot, never stored.
  const email = normalizeEmail(input.email);
  if (!email) return json({ error: "Please enter a valid email address." }, 400);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowRequest(`signup:${ip}`, 10, 60000)) return json({ error: "Too many attempts. Please try again in a minute." }, 429);
  try {
    await addSubscriber(email);
    // Identical response for new and existing emails avoids disclosing membership.
    return json({ success: true });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return json({ error: "We couldn’t save your email. Please try again shortly." }, 503);
  }
}
