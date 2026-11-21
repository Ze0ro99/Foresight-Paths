import { NextResponse } from 'next/server';

/**
 * Cloud-agent execution is intentionally disabled.
 *
 * This endpoint must remain fail-closed until server-side telemetry
 * validation, calibrated risk scoring, and independently verifiable
 * Pi payment settlement are implemented and tested.
 */
export async function POST() {
  return NextResponse.json(
    {
      status: 'not_ready',
      error:
        'Cloud agent execution is disabled until telemetry is validated server-side and payment settlement is independently verified. No agent run or payment occurred.',
    },
    { status: 503 }
  );
}
