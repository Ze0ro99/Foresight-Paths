import assert from 'node:assert/strict';
import test from 'node:test';
import { getPiGatewayReadiness } from '../lib/pi-readiness.mjs';

const configured = {
  PI_API_KEY: 'testnet-server-key',
  NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
  PI_SANDBOX_MODE: 'true',
  PI_PAYMENTS_ENABLED: 'true',
  PI_PAYMENT_INTENT_LEDGER_READY: 'true',
};

test('blank or whitespace server secrets are treated as missing', () => {
  const result = getPiGatewayReadiness({
    ...configured,
    PI_API_KEY: '   ',
    SUPABASE_SERVICE_ROLE_KEY: '',
  });
  assert.equal(result.paymentEnabled, false);
  assert.equal(result.status, 'awaiting_server_credentials');
  assert.deepEqual(result.missingRequirements.slice(0, 2), ['PI_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY']);
});

test('placeholder server keys never enable Testnet payment execution', () => {
  const result = getPiGatewayReadiness({
    ...configured,
    PI_API_KEY: 'MY_PI_PLATFORM_SERVER_API_KEY',
    SUPABASE_SERVICE_ROLE_KEY: 'YOUR_SUPABASE_SERVICE_ROLE_KEY',
  });
  assert.equal(result.paymentEnabled, false);
  assert.equal(result.status, 'awaiting_server_credentials');
});

test('Testnet payment execution requires both credentials and both Preview gates', () => {
  const result = getPiGatewayReadiness(configured);
  assert.equal(result.paymentEnabled, true);
  assert.equal(result.status, 'testnet_payment_release_enabled');
  assert.deepEqual(result.missingRequirements, []);
});

test('Mainnet mode cannot pass the Testnet payment release gate', () => {
  const result = getPiGatewayReadiness({
    ...configured,
    PI_SANDBOX_MODE: 'false',
  });
  assert.equal(result.paymentEnabled, false);
  assert.equal(result.status, 'sandbox_disabled');
  assert.ok(result.missingRequirements.includes('PI_SANDBOX_MODE=true'));
});

test('a missing payment-intent ledger flag keeps payments disabled', () => {
  const result = getPiGatewayReadiness({
    ...configured,
    PI_PAYMENT_INTENT_LEDGER_READY: 'false',
  });
  assert.equal(result.paymentEnabled, false);
  assert.equal(result.status, 'payments_disabled_pending_release_gates');
  assert.ok(result.missingRequirements.includes('PI_PAYMENT_INTENT_LEDGER_READY=true'));
});
