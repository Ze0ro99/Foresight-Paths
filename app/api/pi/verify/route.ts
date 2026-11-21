import { NextRequest, NextResponse } from 'next/server';

const AUTHORITATIVE_PLAN_PRICES_PI: Record<string, number> = {
  micro_0_0001_batch: 0.0001,
  prepaid_0_1_credit: 0.1,
  premium_risk_studio: 1.0,
  rewarded_ad_renewal: 0,
};

function unavailable(message: string, status = 503) {
  return NextResponse.json(
    { verified: false, status: 'not_ready', error: message },
    { status }
  );
}

export async function GET() {
  return NextResponse.json({
    service: 'Pi verification gateway',
    status: 'restricted_until_server_verification',
    sandboxMode: true,
    plans: AUTHORITATIVE_PLAN_PRICES_PI,
    note: 'No identity, payment, or ad reward is confirmed by this status endpoint.',
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
  const piApiKey = process.env.PI_API_KEY;
  const bearer = req.headers.get('authorization')?.match(/^Bearer\\s+(.+)$/i)?.[1]?.trim();

  if (action === 'auth_me') {
    if (!bearer) return unavailable('A Pi-authenticated bearer token is required.', 401);
    try {
      const response = await fetch('https://api.minepi.com/v2/me', {
        headers: { Authorization: `Bearer ${bearer}` },
        cache: 'no-store',
      });
      if (!response.ok) {
        return unavailable('Pi identity verification failed.', 401);
      }
      const user = await response.json();
      return NextResponse.json({ verified: true, mode: 'live_pi_api', user });
    } catch {
      return unavailable('Pi identity service is temporarily unavailable.', 502);
    }
  }

  if (action === 'payment_approve') {
    if (!piApiKey || piApiKey === 'MY_PI_PLATFORM_SERVER_API_KEY') {
      return unavailable('Server-side Pi payment approval is not configured.');
    }
    if (!body.paymentId) {
      return NextResponse.json({ error: 'paymentId is required.' }, { status: 400 });
    }
    const planId = body.planId && body.planId in AUTHORITATIVE_PLAN_PRICES_PI
      ? body.planId
      : 'micro_0_0001_batch';
    try {
      const response = await fetch(
        `https://api.minepi.com/v2/payments/${encodeURIComponent(body.paymentId)}/approve`,
        {
          method: 'POST',
          headers: { Authorization: `Key ${piApiKey}` },
          cache: 'no-store',
        }
      );
      if (!response.ok) {
        return unavailable('Pi payment approval was not confirmed by the Pi API.', 502);
      }
      return NextResponse.json({
        approved: true,
        paymentId: body.paymentId,
        planId,
        authoritativePricePi: AUTHORITATIVE_PLAN_PRICES_PI[planId],
        mode: 'live_pi_api',
        data: await response.json(),
      });
    } catch {
      return unavailable('Pi payment approval service is unavailable.', 502);
    }
  }

  if (action === 'payment_complete') {
    return unavailable(
      'Payment completion is disabled until server-side Pi transaction verification and read-back are implemented.'
    );
  }

  if (action === 'rewarded_ad_verify') {
    return unavailable(
      'Rewarded-ad verification is disabled until a trusted ad-provider callback can be verified server-side.'
    );
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
