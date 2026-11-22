import { NextRequest, NextResponse } from 'next/server';

const PI_API_BASE = 'https://api.minepi.com/v2';
const AUTHORITATIVE_PLAN_PRICES_PI: Record<string, string> = {
  testnet_payment_0_1_demo: '0.1',
  testnet_payment_1_0_demo: '1',
};

type PiUser = { uid?: string; username?: string };
type PiPayment = {
  identifier?: string;
  user_uid?: string;
  network?: 'Pi Network' | 'Pi Testnet';
  direction?: 'user_to_app' | 'app_to_user';
  amount?: number;
  metadata?: Record<string, unknown>;
  status?: {
    developer_approved?: boolean;
    transaction_verified?: boolean;
    developer_completed?: boolean;
    cancelled?: boolean;
    user_cancelled?: boolean;
  };
  transaction?: { txid?: string; verified?: boolean } | null;
};

type PaymentIntent = {
  id: string;
  pi_payment_id: string;
  pi_user_uid: string;
  amount_pi: string;
  plan_id: string;
  network: 'testnet';
  status: 'created' | 'approved' | 'completed' | 'cancelled' | 'failed' | 'reconciliation_required';
  pi_txid: string | null;
  transaction_verified: boolean;
};

function unavailable(message: string, status = 503) {
  return NextResponse.json(
    { verified: false, status: 'not_ready', error: message },
    { status }
  );
}

function getBearer(req: NextRequest) {
  return req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
}

function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function hasDurableLedger() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && key !== 'YOUR_SUPABASE_SERVICE_ROLE_KEY');
}

async function ledgerRpc<T>(name: string, body: Record<string, unknown>): Promise<T | null> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key || key === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') return null;
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Private ledger RPC failed: ${response.status}`);
  return (await response.json()) as T;
}

async function getPaymentIntent(paymentId: string): Promise<PaymentIntent | null> {
  return ledgerRpc<PaymentIntent | null>('get_pi_payment_intent', {
    p_payment_id: paymentId,
  });
}

async function syncPaymentIntent(input: {
  paymentId: string;
  userUid: string;
  amountPi: string;
  planId: string;
  status: 'created' | 'approved' | 'completed';
  txid?: string;
  transactionVerified?: boolean;
}): Promise<PaymentIntent | null> {
  return ledgerRpc<PaymentIntent>('sync_pi_payment_intent', {
    p_payment_id: input.paymentId,
    p_user_uid: input.userUid,
    p_amount_pi: input.amountPi,
    p_plan_id: input.planId,
    p_status: input.status,
    p_txid: input.txid ?? null,
    p_transaction_verified: input.transactionVerified ?? false,
  });
}

async function piRequest<T>(
  path: string,
  apiKey: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const response = await fetch(PI_API_BASE + path, {
    ...init,
    headers: {
      Authorization: 'Key ' + apiKey,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

async function verifyUser(accessToken: string): Promise<PiUser | null> {
  const response = await fetch(PI_API_BASE + '/me', {
    headers: { Authorization: 'Bearer ' + accessToken },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return null;
  const user = (await response.json().catch(() => null)) as PiUser | null;
  return user?.uid ? user : null;
}

function validatePayment(
  payment: PiPayment | null,
  user: PiUser,
  planId: string
): payment is PiPayment {
  if (!payment || !user.uid || !(planId in AUTHORITATIVE_PLAN_PRICES_PI)) return false;
  const expectedAmount = Number(AUTHORITATIVE_PLAN_PRICES_PI[planId]);
  return (
    payment.user_uid === user.uid &&
    payment.network === 'Pi Testnet' &&
    payment.direction === 'user_to_app' &&
    typeof payment.amount === 'number' &&
    Number.isFinite(payment.amount) &&
    Number(payment.amount.toFixed(7)) === expectedAmount &&
    payment.metadata?.planId === planId &&
    payment.status?.cancelled !== true &&
    payment.status?.user_cancelled !== true
  );
}

function isPaymentReleaseEnabled() {
  const sandboxMode = process.env.PI_SANDBOX_MODE !== 'false';
  return (
    sandboxMode &&
    process.env.PI_PAYMENTS_ENABLED === 'true' &&
    process.env.PI_ENTITLEMENT_LEDGER_ENABLED === 'true' &&
    hasDurableLedger()
  );
}

export async function GET() {
  const sandboxMode = process.env.PI_SANDBOX_MODE !== 'false';
  const configured = Boolean(
    process.env.PI_API_KEY &&
    process.env.PI_API_KEY !== 'MY_PI_PLATFORM_SERVER_API_KEY'
  );
  const ledgerConfigured = hasDurableLedger();
  const paymentEnabled = configured && ledgerConfigured && isPaymentReleaseEnabled();
  return NextResponse.json({
    service: 'Pi verification gateway',
    status: !configured
      ? 'awaiting_server_key'
      : !ledgerConfigured
        ? 'awaiting_private_ledger_credentials'
        : paymentEnabled
          ? 'testnet_payment_release_enabled'
          : 'payments_disabled_pending_release_gates',
    sandboxMode,
    ledgerConfigured,
    paymentFlow: paymentEnabled
      ? 'server_verified_approval_and_completion_with_durable_intent'
      : 'disabled_until_testnet_release_gates_pass',
    paymentEnabled,
    plans: AUTHORITATIVE_PLAN_PRICES_PI,
    note: 'Only Testnet/Sandbox is accepted by this gateway. A successful settlement is persisted, but no paid entitlement is granted by this route.',
  });
}

export async function POST(req: NextRequest) {
  let body: {
    action?: 'auth_me' | 'payment_approve' | 'payment_complete' | 'rewarded_ad_verify';
    planId?: string;
    paymentId?: string;
    txid?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const action = body.action ?? 'auth_me';
  const accessToken = getBearer(req);

  if (action === 'auth_me') {
    if (!accessToken) return unavailable('A Pi-authenticated bearer token is required.', 401);
    try {
      const user = await verifyUser(accessToken);
      if (!user) return unavailable('Pi identity verification failed.', 401);
      return NextResponse.json({
        verified: true,
        mode: 'live_pi_api',
        user: { uid: user.uid, username: user.username ?? null },
      });
    } catch {
      return unavailable('Pi identity service is temporarily unavailable.', 502);
    }
  }

  if (action === 'payment_approve' || action === 'payment_complete') {
    if (!isPaymentReleaseEnabled()) {
      return unavailable(
        'Pi Testnet payment processing is disabled until PI_API_KEY, the private Supabase ledger, and explicit Preview release flags are configured.'
      );
    }
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey || apiKey === 'MY_PI_PLATFORM_SERVER_API_KEY') {
      return unavailable('Testnet Server API Key is not configured.');
    }
    if (!accessToken) return unavailable('A verified Pi user session is required.', 401);
    if (!body.paymentId || !/^[A-Za-z0-9_-]{6,160}$/.test(body.paymentId)) {
      return NextResponse.json({ error: 'A valid paymentId is required.' }, { status: 400 });
    }
    if (!body.planId || !(body.planId in AUTHORITATIVE_PLAN_PRICES_PI)) {
      return NextResponse.json({ error: 'A valid server-priced planId is required.' }, { status: 400 });
    }
    if (action === 'payment_complete' && (!body.txid || body.txid.length > 200)) {
      return NextResponse.json({ error: 'A valid transaction txid is required.' }, { status: 400 });
    }

    try {
      const user = await verifyUser(accessToken);
      if (!user?.uid) return unavailable('Pi identity verification failed.', 401);

      const paymentPath = '/payments/' + encodeURIComponent(body.paymentId);
      const before = await piRequest<PiPayment>(paymentPath, apiKey);
      if (!before.ok || !validatePayment(before.data, user, body.planId)) {
        return unavailable(
          'Pi payment ownership, plan metadata, amount, or status did not match the server-side order.',
          409
        );
      }

      const expectedAmount = AUTHORITATIVE_PLAN_PRICES_PI[body.planId];

      if (action === 'payment_approve') {
        const created = await syncPaymentIntent({
          paymentId: body.paymentId,
          userUid: user.uid,
          amountPi: expectedAmount,
          planId: body.planId,
          status: 'created',
        });
        if (!created) return unavailable('The private payment ledger is not configured.', 503);
        if (created.status === 'completed') {
          return NextResponse.json({
            approved: true,
            completed: true,
            idempotent: true,
            paymentId: body.paymentId,
            planId: body.planId,
          });
        }
        if (!before.data.status?.developer_approved) {
          const approval = await piRequest<PiPayment>(paymentPath + '/approve', apiKey, {
            method: 'POST',
          });
          if (!approval.ok || !approval.data) {
            return unavailable('Pi did not confirm server-side payment approval.', 502);
          }
        }
        const approved = await syncPaymentIntent({
          paymentId: body.paymentId,
          userUid: user.uid,
          amountPi: expectedAmount,
          planId: body.planId,
          status: 'approved',
        });
        if (!approved || (approved.status !== 'approved' && approved.status !== 'completed')) {
          return unavailable('Pi approved the payment but durable ledger confirmation failed; retry for reconciliation.', 503);
        }
        return NextResponse.json({
          approved: true,
          idempotent: Boolean(before.data.status?.developer_approved),
          paymentId: body.paymentId,
          planId: body.planId,
          authoritativePricePi: expectedAmount,
          ledgerStatus: approved.status,
          mode: 'pi_testnet',
        });
      }

      const intent = await getPaymentIntent(body.paymentId);
      if (
        !intent ||
        intent.pi_user_uid !== user.uid ||
        intent.plan_id !== body.planId ||
        Number(intent.amount_pi) !== Number(expectedAmount) ||
        intent.network !== 'testnet'
      ) {
        return unavailable('No matching durable Testnet payment intent exists.', 409);
      }

      const txid = body.txid as string;
      if (intent.status === 'completed' && intent.transaction_verified && intent.pi_txid === txid) {
        return NextResponse.json({
          completed: true,
          verified: true,
          idempotent: true,
          paymentId: body.paymentId,
          txid,
          planId: body.planId,
          entitlementGranted: false,
        });
      }
      if (intent.status !== 'approved') {
        return unavailable('Payment intent must be approved before completion.', 409);
      }
      if (before.data.transaction?.txid && before.data.transaction.txid !== txid) {
        return unavailable('The supplied txid does not match the Pi payment record.', 409);
      }

      if (!before.data.status?.developer_completed || !before.data.status?.transaction_verified) {
        const completion = await piRequest<PiPayment>(paymentPath + '/complete', apiKey, {
          method: 'POST',
          body: JSON.stringify({ txid }),
        });
        if (!completion.ok) {
          return unavailable('Pi did not confirm server-side payment completion.', 502);
        }
      }

      const readBack = await piRequest<PiPayment>(paymentPath, apiKey);
      const verified =
        readBack.ok &&
        validatePayment(readBack.data, user, body.planId) &&
        readBack.data.status?.transaction_verified === true &&
        readBack.data.status?.developer_completed === true &&
        readBack.data.transaction?.txid === txid &&
        readBack.data.transaction?.verified === true;

      if (!verified) {
        return unavailable(
          'Pi completion was submitted, but authoritative read-back is not yet verified. No entitlement was granted.',
          502
        );
      }

      const completed = await syncPaymentIntent({
        paymentId: body.paymentId,
        userUid: user.uid,
        amountPi: expectedAmount,
        planId: body.planId,
        status: 'completed',
        txid,
        transactionVerified: true,
      });
      if (!completed || completed.status !== 'completed' || completed.pi_txid !== txid) {
        return unavailable('Pi settlement is verified, but durable ledger read-back failed. Retry for reconciliation.', 503);
      }

      return NextResponse.json({
        completed: true,
        verified: true,
        paymentId: body.paymentId,
        txid,
        planId: body.planId,
        authoritativePricePi: expectedAmount,
        ledgerStatus: completed.status,
        entitlementGranted: false,
        note: 'Testnet payment settlement and durable intent are verified. Product entitlements remain disabled pending a separately tested entitlement-delivery workflow.',
      });
    } catch {
      return unavailable('Pi Testnet payment or private ledger service is temporarily unavailable.', 502);
    }
  }

  if (action === 'rewarded_ad_verify') {
    return unavailable(
      'Rewarded-ad verification is disabled until a trusted ad callback is implemented and verified server-side.'
    );
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
