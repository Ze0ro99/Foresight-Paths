import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TABLES = {
  sources: 'source_registry?select=source_key,display_name,source_type,enabled,last_success_at,coverage_note&enabled=eq.true&order=source_type.asc',
  agents: 'agent_templates?select=template_key,name,description,category,capability_level,testnet_enabled,mainnet_enabled,safety_notes&order=category.asc',
  news: 'news_items?select=id,category,title,canonical_url,source_domain,published_at,evidence_class&order=published_at.desc.nullslast&limit=6',
  hazards: 'hazard_events?select=id,hazard_type,title,severity_label,latitude,longitude,occurred_at,source_url,status&order=occurred_at.desc.nullslast&limit=6',
  risks: 'risk_assessments?select=id,title,summary,risk_score,confidence,evidence_class,generated_at,is_demo&order=generated_at.desc&limit=4',
};

async function readTable<T>(base: string, key: string, table: string): Promise<T[]> {
  const response = await fetch(`${base}/rest/v1/${table}`, {
    headers: { apikey: key, Accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`);
  return (await response.json()) as T[];
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) {
    return NextResponse.json(
      { status: 'unconfigured', message: 'Supabase preview configuration is missing.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const entries = await Promise.allSettled(
    Object.entries(TABLES).map(async ([name, table]) => [
      name,
      await readTable<unknown>(base, key, table),
    ] as const),
  );
  const data: Record<string, unknown[]> = {};
  const unavailable: string[] = [];
  for (const entry of entries) {
    if (entry.status === 'fulfilled') data[entry.value[0]] = entry.value[1];
    else unavailable.push(Object.keys(TABLES)[entries.indexOf(entry)]);
  }

  return NextResponse.json(
    {
      status: unavailable.length === 0 ? 'connected' : 'partial',
      project: 'foresight-paths-dev',
      data,
      unavailable,
      fetchedAtUtc: new Date().toISOString(),
      note: 'Public read-only project data. Payment intents and ledger records remain in a private schema.',
    },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } },
  );
}
