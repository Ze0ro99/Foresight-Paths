import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
type Category = 'disasters' | 'conflict' | 'politics' | 'economy' | 'health' | 'cyber' | 'science' | 'energy';
type Article = { title?: string; url?: string; seendate?: string; domain?: string; language?: string; sourcecountry?: string };
type NewsItem = {
  id: string;
  category: Category;
  categoryLabel: string;
  title: string;
  url: string;
  observedAt: string;
  sourceDomain: string;
  language: string | null;
  sourceCountry: string | null;
  source: string;
};
const queries: Record<Category, string> = {
  disasters: '(earthquake OR flood OR wildfire OR hurricane OR volcano OR tsunami)',
  conflict: '(war OR conflict OR ceasefire OR missile OR invasion)',
  politics: '(election OR parliament OR government OR diplomacy OR sanctions)',
  economy: '(inflation OR central bank OR markets OR trade OR recession)',
  health: '(outbreak OR epidemic OR pandemic OR public health)',
  cyber: '(cyberattack OR ransomware OR data breach OR vulnerability OR outage)',
  science: '(science OR space OR research OR technology OR artificial intelligence)',
  energy: '(oil OR gas OR electricity OR power grid OR renewable energy)',
};
const labels: Record<Category, string> = {
  disasters: 'الكوارث والطوارئ',
  conflict: 'النزاعات والأمن',
  politics: 'السياسة والدبلوماسية',
  economy: 'الاقتصاد والأسواق',
  health: 'الصحة والأوبئة',
  cyber: 'الأمن السيبراني',
  science: 'العلوم والتقنية',
  energy: 'الطاقة والبنية التحتية',
};

function timestamp(value?: string): string | null {
  if (!value || !/^\d{8}T\d{6}Z$/.test(value)) return null;
  const iso = value.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, '$1-$2-$3T$4:$5:$6Z');
  const ms = Date.parse(iso);
  return Number.isFinite(ms) && ms <= Date.now() + 300000 ? new Date(ms).toISOString() : null;
}

async function persistNews(articles: NewsItem[]): Promise<string> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key || key === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') return 'not_configured';

  const headers = {
    apikey: key,
    Authorization: 'Bearer ' + key,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  try {
    const claimResponse = await fetch(`${base}/rest/v1/rpc/claim_source_refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_source_key: 'gdelt-doc', p_min_interval_seconds: 90 }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!claimResponse.ok) return 'unavailable';
    const claimed = (await claimResponse.json()) as boolean;
    if (!claimed) return 'rate_limited';

    const rows = articles.map((article) => ({
      external_id: article.url,
      category: article.category,
      title: article.title,
      summary: null,
      canonical_url: article.url,
      source_domain: article.sourceDomain,
      language_code: article.language,
      source_country: article.sourceCountry,
      published_at: null,
      observed_at: article.observedAt,
      content_hash: null,
      evidence_class: 'unverified',
      metadata: { provider: 'GDELT DOC 2.0', timestamp_kind: 'feed_observation' },
    }));
    const ingestResponse = await fetch(`${base}/rest/v1/rpc/ingest_news_batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_source_key: 'gdelt-doc', p_rows: rows }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!ingestResponse.ok) return 'write_failed';
    const persisted = (await ingestResponse.json()) as number;
    return `persisted:${persisted}`;
  } catch {
    return 'unavailable';
  }
}

export async function GET() {
  const categories = Object.keys(queries) as Category[];
  const results = await Promise.allSettled(categories.map(async (category) => {
    const params = new URLSearchParams({
      query: queries[category],
      mode: 'ArtList',
      format: 'json',
      maxrecords: '8',
      sort: 'DateDesc',
    });
    const response = await fetch('https://api.gdeltproject.org/api/v2/doc/doc?' + params, {
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 120 },
    });
    if (!response.ok) throw new Error('GDELT HTTP ' + response.status);
    const payload = await response.json() as { articles?: Article[] };
    return (Array.isArray(payload.articles) ? payload.articles : []).flatMap((article) => {
      let url: URL;
      try {
        url = new URL(article.url || '');
      } catch {
        return [];
      }
      const observedAt = timestamp(article.seendate);
      if (!observedAt || !article.title || !['https:', 'http:'].includes(url.protocol)) return [];
      return [{
        id: url.toString(),
        category,
        categoryLabel: labels[category],
        title: article.title.slice(0, 500),
        url: url.toString(),
        observedAt,
        sourceDomain: (article.domain || url.hostname).slice(0, 160),
        language: article.language || null,
        sourceCountry: article.sourcecountry || null,
        source: 'GDELT DOC 2.0',
      }];
    });
  }));

  const articles = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  const unique = [...new Map(articles.map((article) => [article.url, article])).values()]
    .sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt))
    .slice(0, 50);
  const unavailable = results.flatMap((result, index) => result.status === 'rejected' ? [categories[index]] : []);
  const persistence = await persistNews(unique);

  return NextResponse.json({
    fetchedAtUtc: new Date().toISOString(),
    source: 'GDELT DOC 2.0',
    coverage: 'partial',
    persistence,
    categoriesRequested: categories,
    categoriesUnavailable: unavailable,
    articles: unique,
    note: 'GDELT indexes global news but is not exhaustive or a guaranteed real-time wire service. The timestamp shown is the feed observation time, not necessarily the publisher publication time; open the original publisher to verify facts.',
  }, { headers: { 'Cache-Control': 'public, s-maxage=90, stale-while-revalidate=180' } });
}
