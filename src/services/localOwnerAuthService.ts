const LOCAL_OWNER_AUTH_URL = String(import.meta.env.VITE_LOCAL_OWNER_AUTH_URL || "").replace(/\/+$/, "");
const LOCAL_OWNER_UNLOCK_ENABLED = String(import.meta.env.VITE_ENABLE_LOCAL_OWNER_UNLOCK || "").toLowerCase() === "true";

export interface LocalOwnerStatus {
  enabled: boolean;
  unlocked: boolean;
  expiresAt: string | null;
}

interface UnlockResponse {
  unlocked?: boolean;
  expiresAt?: string | null;
  error?: string;
}

export function isLocalOwnerUnlockConfigured(): boolean {
  return LOCAL_OWNER_UNLOCK_ENABLED && Boolean(LOCAL_OWNER_AUTH_URL);
}

function requireLocalOwnerAuthUrl(): string {
  if (!isLocalOwnerUnlockConfigured()) {
    throw new Error("Local owner unlock is not configured for this build.");
  }
  return LOCAL_OWNER_AUTH_URL;
}

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getLocalOwnerStatus(): Promise<LocalOwnerStatus> {
  const baseUrl = requireLocalOwnerAuthUrl();
  const response = await fetch(`${baseUrl}/api/local-owner/status`, {
    credentials: "include",
  });
  const payload = await readJson<LocalOwnerStatus & { error?: string }>(response);
  if (!response.ok) {
    throw new Error(payload?.error || "Could not check local owner unlock status.");
  }
  return {
    enabled: Boolean(payload?.enabled),
    unlocked: Boolean(payload?.unlocked),
    expiresAt: payload?.expiresAt || null,
  };
}

export async function unlockLocalOwner(password: string): Promise<LocalOwnerStatus> {
  const baseUrl = requireLocalOwnerAuthUrl();
  const response = await fetch(`${baseUrl}/api/local-owner/unlock`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const payload = await readJson<UnlockResponse>(response);
  if (!response.ok) {
    throw new Error(payload?.error || "Local owner unlock failed.");
  }
  return {
    enabled: true,
    unlocked: Boolean(payload?.unlocked),
    expiresAt: payload?.expiresAt || null,
  };
}

export async function lockLocalOwner(): Promise<void> {
  const baseUrl = requireLocalOwnerAuthUrl();
  const response = await fetch(`${baseUrl}/api/local-owner/lock`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const payload = await readJson<{ error?: string }>(response);
    throw new Error(payload?.error || "Could not lock local owner access.");
  }
}
