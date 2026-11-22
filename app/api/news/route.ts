import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
type Category = 'disasters' | 'conflict' | 'politics' | 'economy' | 'health' | 'cyber' | 'science' | 'energy' | 'other';
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

const labels: Record<Category, string> = {
  disasters: 'الكوارث والطوارئ',
  conflict: 'النزاعات والأمن',
  politics: 'السياسة والدبلوماسية',
  economy: 'الاقتصاد والأسواق',
  health: 'الصحة والأوبئة',
  cyber: 'الأمن السيبراني',
  science: 'العلوم والتقنية',
  energy: 'الطاقة والبنية التحتية',
  other: 'أخبار متنوعة',
};

const broadQuery = [
  'earthquake OR flood OR wildfire OR hurricane OR volcano OR tsunami OR disaster',
  'war OR conflict OR ceasefire OR missile OR invasion',
  'election OR parliament OR government OR diplomacy OR sanctions',
  'inflation OR central bank OR markets OR trade OR recession',
  'outbreak OR epidemic OR pandemic OR public health',
  'cyberattack OR ransomware OR data breach OR vulnerability OR outage',
  'science OR space OR research OR technology OR artificial intelligence',
  'oil OR gas OR electricity OR power grid OR renewable energy',
].join(' OR ');

function classifyArticle(title: string): Category {
  const value = title.toLowerCase();
  if (/earthquake|flood|wildfire|hurricane|cyclone|volcano|tsunami|disaster|tornado|landslide/.test(value)) return 'disasters';
  if (/war |war:|conflict|ceasefire|missile|invasion|armed forces|military strike/.test(value)) return 'conflict';
  if (/cyber|ransomware|data breach|hacked|hackers|vulnerability|malware/.test(value)) return 'cyber';
  if (/outbreak|epidemic|pandemic|public health|virus|vaccine|hospital|disease/.test(value)) return 'health';
  if (/election|parliament|government|diplomacy|sanction|president|minister|policy/.test(value)) return 'politics';
  if (/oil |gas |electricity|power grid|renewable|solar|wind energy|energy/.test(value)) return 'energy';
  if (/inflation|central bank|market|trade|recession|economy|economic|stocks|finance/.test(value)) return 'economy';
  if (/science|space|research|technology|artificial intelligence|robot|quantum/.test(value)) return 'science';
  return 'other';
}

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
    if (!(await claimResponse.json())) return 'rate_limited';
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
      metadata: { provider: 'GDELT DOC 2.0', timestamp_kind: 'feed_observation', classification: 'title_keyword_rules' },
    }));
    const response = await fetch(`${base}/rest/v1/rpc/ingest_news_batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_source_key: 'gdelt-doc', p_rows: rows }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return 'write_failed';
    return `persisted:${await response.json() as number}`;
  } catch {
    return 'unavailable';
  }
}

export async function GET() {
  const params = new URLSearchParams({
    query: broadQuery,
    mode: 'ArtList',
    format: 'json',
    maxrecords: '50',
    sort: 'DateDesc',
  });
  let articles: NewsItem[] = [];
  let sourceError: string | null = null;
  try {
    const response = await fetch('https://api.gdeltproject.org/api/v2/doc/doc?' + params, {
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 120 },
    });
    if (!response.ok) {
      sourceError = 'GDELT_HTTP_' + response.status;
    } else {
      const payload = await response.json() as { articles?: Article[] };
      articles = (Array.isArray(payload.articles) ? payload.articles : []).flatMap((article) => {
        let url: URL;
        try {
          url = new URL(article.url || '');
        } catch {
          return [];
        }
        const observedAt = timestamp(article.seendate);
        if (!observedAt || !article.title || !['https:', 'http:'].includes(url.protocol) || url.username || url.password) return [];
        const category = classifyArticle(article.title);
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
    }
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'UnknownError';
    sourceError = 'GDELT_' + reason;
    console.warn('GDELT global news fetch failed', { reason });
  }

  const unique = [...new Map(articles.map((article) => [article.url, article])).values()]
    .sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt))
    .slice(0, 50);
  const categoryCounts = Object.fromEntries(
    (Object.keys(labels) as Category[]).map((category) => [category, unique.filter((article) => article.category === category).length]),
  );
  const categoriesRequested = Object.keys(labels).filter((category) => category !== 'other');
  const persistence = await persistNews(unique);

  return NextResponse.json({
    fetchedAtUtc: new Date().toISOString(),
    source: 'GDELT DOC 2.0',
    coverage: 'partial',
    persistence,
    classificationMethod: 'title_keyword_rules',
    categoriesRequested,
    categoriesWithoutResults: categoriesRequested.filter((category) => categoryCounts[category as Category] === 0),
    categoryCounts,
    categoriesUnavailable: sourceError ? categoriesRequested : [],
    sourceError,
    articles: unique,
    note: 'GDELT indexes global news but is not exhaustive or a guaranteed real-time wire service. The timestamp shown is the feed observation time, not necessarily the publisher publication time. Categories are preliminary title-keyword labels; open the original publisher to verify facts.',
  }, { headers: { 'Cache-Control': 'public, s-maxage=90, stale-while-revalidate=180' } });
}
