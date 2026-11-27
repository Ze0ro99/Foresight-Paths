export type SupabaseAdminCredential = {
  key: string;
  legacy: boolean;
};

function legacyJwtRole(key: string): string | null {
  const parts = key.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function getSupabaseAdminCredential(
  secretKeysRaw: string | undefined,
  legacyServiceRoleKey: string | undefined,
): SupabaseAdminCredential | null {
  if (secretKeysRaw) {
    try {
      const parsed = JSON.parse(secretKeysRaw) as Record<string, unknown>;
      const secret = parsed.default;
      if (typeof secret === "string" && secret.startsWith("sb_secret_") && secret.length > 20) {
        return { key: secret, legacy: false };
      }
    } catch {
      // Do not allow malformed secret-key dictionaries to fall through as admin keys.
    }
  }

  const legacy = typeof legacyServiceRoleKey === "string" ? legacyServiceRoleKey.trim() : "";
  if (legacy.length <= 20 || legacyJwtRole(legacy) !== "service_role") return null;
  return { key: legacy, legacy: true };
}
