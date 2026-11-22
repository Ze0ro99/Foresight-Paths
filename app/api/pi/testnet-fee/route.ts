import { stroopsToPi } from '@/lib/pi-fee.mjs';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type LedgerResponse = {
  _embedded?: { records?: Array<{ sequence?: string; base_fee_in_stroops?: string; closed_at?: string }> };
};

export async function GET() {
  try {
    const response = await fetch(
      'https://api.testnet.minepi.com/ledgers?order=desc&limit=1',
      { cache: 'no-store', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(9000) },
    );
    if (!response.ok) {
      return NextResponse.json(
        { network: 'Pi Testnet', status: 'unavailable', upstreamStatus: response.status },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const payload = (await response.json()) as LedgerResponse;
    const ledger = payload._embedded?.records?.[0];
    if (!ledger?.base_fee_in_stroops || !ledger.sequence) {
      return NextResponse.json(
        { network: 'Pi Testnet', status: 'unavailable', reason: 'Latest ledger fee data missing.' },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return NextResponse.json(
      {
        network: 'Pi Testnet',
        status: 'connected',
        ledgerSequence: ledger.sequence,
        baseFeeStroops: ledger.base_fee_in_stroops,
        baseFeePi: stroopsToPi(ledger.base_fee_in_stroops),
        ledgerClosedAt: ledger.closed_at ?? null,
        fetchedAtUtc: new Date().toISOString(),
        source: 'https://api.testnet.minepi.com/ledgers',
        mode: 'read-only; no signing or transfers',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const errorCode = error instanceof Error ? error.name : 'UnknownError';
    console.warn('Pi Testnet Horizon fee request failed', { errorCode });
    return NextResponse.json(
      { network: 'Pi Testnet', status: 'unavailable', errorCode, reason: 'Testnet Horizon could not be reached.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
