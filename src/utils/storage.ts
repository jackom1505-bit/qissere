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

/* ── Discovered secrets ── */
export function isSecretUnlocked(id: string): boolean {
  return read<boolean>(`qissare_secret_${id}`, false);
}

export function unlockSecret(id: string): void {
  write(`qissare_secret_${id}`, true);
}
