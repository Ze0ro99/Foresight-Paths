/**
 * Server-only Supabase Data API headers.
 *
 * Modern sb_secret_* keys are opaque API keys, not JWTs. Send them via
 * apikey only. Legacy service_role keys are JWTs and can also be sent as
 * Authorization: Bearer for backward compatibility.
 */
export function getSupabaseServerKeyKind(apiKey) {
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!key) return 'missing';
  if (key.startsWith('sb_secret_')) return 'secret_key';
  if (key.startsWith('sb_publishable_')) return 'publishable_key';
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) return 'legacy_service_role_jwt';
  return 'unrecognized';
}

export function getSupabaseServerHeaders(apiKey) {
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!key) throw new Error('A Supabase server API key is required.');
  const keyKind = getSupabaseServerKeyKind(key);
  if (keyKind !== 'secret_key' && keyKind !== 'legacy_service_role_jwt') {
    throw new Error('An elevated Supabase server key is required for private RPCs.');
  }

  const headers = { apikey: key };
  const isLegacyJwt = keyKind === 'legacy_service_role_jwt';

  if (isLegacyJwt) {
    headers.Authorization = 'Bearer ' + key;
  }

  return headers;
}
