import { NextResponse } from 'next/server';
import { normalizeCisaKevCatalog } from '@/lib/cisa-kev.mjs';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

const CISA_KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const CISA_CATALOG_PAGE = 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog';

export async function GET() {
  try {
    const response = await fetch(CISA_KEV_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      return NextResponse.json(
        { status: 'unavailable', source: 'CISA KEV', sourceHttpStatus: response.status, vulnerabilities: [] },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const raw = await response.json() as unknown;
    const catalog = normalizeCisaKevCatalog(raw, 50);
    if (!catalog) {
      return NextResponse.json(
        { status: 'unavailable', source: 'CISA KEV', sourceError: 'INVALID_CISA_CATALOG', vulnerabilities: [] },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    return NextResponse.json({
      status: 'ok',
      source: 'CISA Known Exploited Vulnerabilities',
      sourceUrl: CISA_CATALOG_PAGE,
      feedUrl: CISA_KEV_URL,
      fetchedAtUtc: new Date().toISOString(),
      ...catalog,
      note: 'Inclusion in KEV means CISA lists this CVE as known exploited. It does not prove that a particular asset is affected; verify vendor, product, version, and exposure before taking action.',
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'UnknownError';
    console.warn('CISA KEV catalog request failed', { reason });
    return NextResponse.json(
      { status: 'unavailable', source: 'CISA KEV', sourceError: 'CISA_KEV_' + reason, vulnerabilities: [] },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
