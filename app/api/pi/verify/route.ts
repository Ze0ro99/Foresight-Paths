import { NextRequest, NextResponse } from 'next/server';

const PI_API_BASE = 'https://api.minepi.com/v2';
const AUTHORITATIVE_PLAN_PRICES_PI: Record<string, number> = {
  micro_0_0001_batch: 0.0001,
  prepaid_0_1_credit: 0.1,
  premium_risk_studio: 1.0,
};

type PiUser = { uid?: string; username?: string };
type PiPayment = {
  identifier?: string;
  user_uid?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
  status?: {
    developer_approved?: boolean;
    transaction_verified?: boolean;
    developer_completed?: boolean;
    cancelled?: boolean;
  };
  transaction?: { txid?: string } | null;
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
  const expectedAmount = AUTHORITATIVE_PLAN_PRICES_PI[planId];
  return (
    payment.user_uid === user.uid &&
    typeof payment.amount === 'number' &&
    Math.abs(payment.amount - expectedAmount) < 1e-9 &&
    payment.metadata?.planId === planId &&
    payment.status?.cancelled !== true
  );
}

function isPaymentReleaseEnabled() {
  const sandboxMode = process.env.PI_SANDBOX_MODE !== 'false';
  return (
    process.env.PI_PAYMENTS_ENABLED === 'true' &&
    process.env.PI_ENTITLEMENT_LEDGER_ENABLED === 'true' &&
    (sandboxMode || process.env.PI_MAINNET_PAYMENTS_APPROVED === 'true')
  );
}

export async function GET() {
  const sandboxMode = process.env.PI_SANDBOX_MODE !== 'false';
  const configured = Boolean(
    process.env.PI_API_KEY &&
    process.env.PI_API_KEY !== 'MY_PI_PLATFORM_SERVER_API_KEY'
  );
  const paymentEnabled = configured && isPaymentReleaseEnabled();
  return NextResponse.json({
    service: 'Pi verification gateway',
    status: !configured
      ? 'awaiting_server_key'
      : paymentEnabled
        ? 'payment_release_enabled'
        : 'payments_disabled_pending_release_gates',
    sandboxMode,
    paymentFlow: paymentEnabled
      ? 'server_verified_approval_and_completion'
      : 'disabled_until_ledger_and_release_approval',
    paymentEnabled,
    plans: AUTHORITATIVE_PLAN_PRICES_PI,
    note: paymentEnabled
      ? 'Settlement verification is active; entitlements still require durable ledger confirmation.'
      : 'Payment approval and completion are disabled until the durable ledger and explicit release flags are configured.',
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
        'Pi payment approval and completion are disabled until a durable order/entitlement ledger is deployed and the release flags are explicitly enabled.'
      );
    }
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey || apiKey === 'MY_PI_PLATFORM_SERVER_API_KEY') {
      return unavailable('Server-side Pi Platform API key is not configured.');
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
      if (!user) return unavailable('Pi identity verification failed.', 401);

      const paymentPath = '/payments/' + encodeURIComponent(body.paymentId);
      const before = await piRequest<PiPayment>(paymentPath, apiKey);
      if (!before.ok || !validatePayment(before.data, user, body.planId)) {
        return unavailable(
          'Pi payment ownership, plan metadata, amount, or status did not match the server-side order.',
          409
        );
      }

      if (action === 'payment_approve') {
        if (before.data.status?.developer_approved) {
          return NextResponse.json({
            approved: true,
            idempotent: true,
            paymentId: body.paymentId,
            planId: body.planId,
            authoritativePricePi: AUTHORITATIVE_PLAN_PRICES_PI[body.planId],
          });
        }
        const approval = await piRequest<PiPayment>(paymentPath + '/approve', apiKey, {
          method: 'POST',
        });
        if (!approval.ok || !approval.data) {
          return unavailable('Pi did not confirm server-side payment approval.', 502);
        }
        return NextResponse.json({
          approved: true,
          paymentId: body.paymentId,
          planId: body.planId,
          authoritativePricePi: AUTHORITATIVE_PLAN_PRICES_PI[body.planId],
          mode: 'live_pi_api',
        });
      }

      const txid = body.txid as string;
      if (
        before.data.status?.developer_completed &&
        before.data.status?.transaction_verified &&
        before.data.transaction?.txid === txid
      ) {
        return NextResponse.json({
          completed: true,
          verified: true,
          idempotent: true,
          paymentId: body.paymentId,
          txid,
          planId: body.planId,
        });
      }
      if (before.data.transaction?.txid && before.data.transaction.txid !== txid) {
        return unavailable('The supplied txid does not match the Pi payment record.', 409);
      }

      const completion = await piRequest<PiPayment>(paymentPath + '/complete', apiKey, {
        method: 'POST',
        body: JSON.stringify({ txid }),
      });
      if (!completion.ok) {
        return unavailable('Pi did not confirm server-side payment completion.', 502);
      }

      const readBack = await piRequest<PiPayment>(paymentPath, apiKey);
      const verified =
        readBack.ok &&
        validatePayment(readBack.data, user, body.planId) &&
        readBack.data.status?.transaction_verified === true &&
        readBack.data.status?.developer_completed === true &&
        readBack.data.transaction?.txid === txid;

      if (!verified) {
        return unavailable(
          'Pi completion was submitted, but authoritative read-back is not yet verified. No entitlement was granted.',
          502
        );
      }

      return NextResponse.json({
        completed: true,
        verified: true,
        paymentId: body.paymentId,
        txid,
        planId: body.planId,
        authoritativePricePi: AUTHORITATIVE_PLAN_PRICES_PI[body.planId],
        entitlementGranted: false,
        note: 'Payment settlement is verified. Product entitlements remain unavailable until a durable order ledger is configured.',
      });
    } catch {
      return unavailable('Pi payment service is temporarily unavailable.', 502);
    }
  }

  if (action === 'rewarded_ad_verify') {
    return unavailable(
      'Rewarded-ad verification is disabled until a trusted ad callback is implemented and verified server-side.'
    );
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
