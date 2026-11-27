import test from 'node:test';
import assert from 'node:assert/strict';
import { getSupabaseServerHeaders } from '../lib/supabase-server-headers.mjs';

test('sends a modern Supabase secret key through apikey only', () => {
  const headers = getSupabaseServerHeaders('sb_secret_example_key');
  assert.deepEqual(headers, { apikey: 'sb_secret_example_key' });
  assert.equal('Authorization' in headers, false);
});

test('keeps the legacy service-role JWT compatibility header', () => {
  const key = 'header.payload.signature';
  assert.deepEqual(getSupabaseServerHeaders(key), {
    apikey: key,
    Authorization: 'Bearer ' + key,
  });
});

test('trims API keys and rejects empty values', () => {
  assert.deepEqual(getSupabaseServerHeaders('  sb_secret_example_key  '), {
    apikey: 'sb_secret_example_key',
  });
  assert.throws(() => getSupabaseServerHeaders('  '), /required/);
});
