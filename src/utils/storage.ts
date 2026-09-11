// Minimal persistence for the cinematic pre-launch experience.

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/* ── Chapter One waitlist ── */
const CH1_BASE = 1268;
const CH1_KEY = "qissare_ch1_extra";

export function getChapterOneCount(): number {
  return CH1_BASE + read<number>(CH1_KEY, 0);
}

export function hasJoinedChapterOne(): boolean {
  return read<boolean>("qissare_ch1_joined", false);
}

export function joinChapterOne(): number {
  if (!hasJoinedChapterOne()) {
    write(CH1_KEY, read<number>(CH1_KEY, 0) + 1);
    write("qissare_ch1_joined", true);
  }
  return getChapterOneCount();
}

/* ── Discovered secrets ── */
export function isSecretUnlocked(id: string): boolean {
  return read<boolean>(`qissare_secret_${id}`, false);
}

export function unlockSecret(id: string): void {
  write(`qissare_secret_${id}`, true);
}
