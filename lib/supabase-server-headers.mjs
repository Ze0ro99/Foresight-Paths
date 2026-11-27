/**
 * Server-only Supabase Data API headers.
 *
 * Modern sb_secret_* keys are opaque API keys, not JWTs. Send them via
 * apikey only. Legacy service_role keys are JWTs and can also be sent as
 * Authorization: Bearer for backward compatibility.
 */
export function getSupabaseServerHeaders(apiKey) {
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!key) throw new Error('A Supabase server API key is required.');

  const headers = { apikey: key };
  const isLegacyJwt = key.split('.').length === 3;

  if (isLegacyJwt) {
    headers.Authorization = 'Bearer ' + key;
  }

  return headers;
}
