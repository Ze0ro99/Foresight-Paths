/** @type {Readonly<Record<string, string>>} */
export const AUTHORITATIVE_PLAN_PRICES_PI = Object.freeze({
  testnet_payment_0_1_demo: '0.1',
  testnet_payment_1_0_demo: '1',
});

export function getRecoverableTestnetPayment(payment, requestedPaymentId) {
  if (!payment || typeof payment !== 'object' || typeof requestedPaymentId !== 'string') return null;
  const planId = typeof payment.metadata?.planId === 'string' ? payment.metadata.planId : '';
  const expectedAmount = AUTHORITATIVE_PLAN_PRICES_PI[planId];
  const txid = payment.transaction?.txid;

  if (
    !expectedAmount ||
    payment.identifier !== requestedPaymentId ||
    typeof payment.user_uid !== 'string' ||
    payment.user_uid.trim().length === 0 ||
    payment.network !== 'Pi Testnet' ||
    payment.direction !== 'user_to_app' ||
    payment.metadata?.app !== 'foresight-paths' ||
    payment.metadata?.network !== 'Pi Testnet' ||
    typeof payment.amount !== 'number' ||
    !Number.isFinite(payment.amount) ||
    Number(payment.amount.toFixed(7)) !== Number(expectedAmount) ||
    payment.status?.developer_approved !== true ||
    payment.status?.cancelled === true ||
    payment.status?.user_cancelled === true ||
    typeof txid !== 'string' ||
    txid.trim().length === 0 ||
    txid.length > 200
  ) {
    return null;
  }

  return {
    paymentId: payment.identifier,
    userUid: payment.user_uid,
    planId,
    amountPi: expectedAmount,
    txid,
  };
}
