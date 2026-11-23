import assert from 'node:assert/strict';
import test from 'node:test';
import { getRecoverableTestnetPayment } from '../lib/pi-payment.mjs';

function payment(overrides = {}) {
  return {
    identifier: 'pi_payment_123456',
    user_uid: 'app-user-uid',
    amount: 0.1,
    network: 'Pi Testnet',
    direction: 'user_to_app',
    metadata: { planId: 'testnet_payment_0_1_demo', app: 'foresight-paths', network: 'Pi Testnet' },
    status: { developer_approved: true, transaction_verified: false, developer_completed: false, cancelled: false, user_cancelled: false },
    transaction: { txid: 'testnet-tx-abc', verified: false },
    ...overrides,
  };
}

test('accepts only the app-scoped approved Pi Testnet U2A payment returned by Pi', () => {
  assert.deepEqual(getRecoverableTestnetPayment(payment(), 'pi_payment_123456'), {
    paymentId: 'pi_payment_123456',
    userUid: 'app-user-uid',
    planId: 'testnet_payment_0_1_demo',
    amountPi: '0.1',
    developerApproved: true,
    txid: 'testnet-tx-abc',
  });
});

test('rejects a different payment id or network', () => {
  assert.equal(getRecoverableTestnetPayment(payment(), 'another-payment'), null);
  assert.equal(getRecoverableTestnetPayment(payment({ network: 'Pi Network' }), 'pi_payment_123456'), null);
});

test('rejects wrong direction, app metadata, plan, or server-known amount', () => {
  assert.equal(getRecoverableTestnetPayment(payment({ direction: 'app_to_user' }), 'pi_payment_123456'), null);
  assert.equal(getRecoverableTestnetPayment(payment({ metadata: { planId: 'testnet_payment_0_1_demo', app: 'other-app', network: 'Pi Testnet' } }), 'pi_payment_123456'), null);
  assert.equal(getRecoverableTestnetPayment(payment({ amount: 1 }), 'pi_payment_123456'), null);
  assert.equal(getRecoverableTestnetPayment(payment({ metadata: { planId: 'unrecognized', app: 'foresight-paths', network: 'Pi Testnet' } }), 'pi_payment_123456'), null);
});

test('allows an unapproved but submitted payment so the server can approve it during recovery', () => {
  const result = getRecoverableTestnetPayment(payment({ status: { developer_approved: false } }), 'pi_payment_123456');
  assert.equal(result?.developerApproved, false);
});

test('rejects cancelled or unsubmitted payments', () => {
  assert.equal(getRecoverableTestnetPayment(payment({ status: { developer_approved: true, cancelled: true } }), 'pi_payment_123456'), null);
  assert.equal(getRecoverableTestnetPayment(payment({ transaction: null }), 'pi_payment_123456'), null);
});
