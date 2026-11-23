import { NextResponse } from 'next/server';
import { GDELT_BROAD_QUERY, GDELT_REFRESH_INTERVAL_SECONDS, classifyGdeltUpstreamError, parseGdeltResponse } from '@/lib/gdelt.mjs';

export const dynamic = 'force-dynamic';
export const maxDuration = 20;
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

type RefreshClaim = 'claimed' | 'rate_limited' | 'unavailable' | 'not_configured';
type PersistedNewsRow = {
  category?: string;
  title?: string;
  canonical_url?: string;
  source_domain?: string;
  language_code?: string | null;
  source_country?: string | null;
  observed_at?: string;
};

async function claimNewsRefresh(): Promise<RefreshClaim> {
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
    const response = await fetch(`${base}/rest/v1/rpc/claim_source_refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        p_source_key: 'gdelt-doc',
        p_min_interval_seconds: GDELT_REFRESH_INTERVAL_SECONDS,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      console.warn('GDELT refresh lease unavailable', { status: response.status });
      return 'unavailable';
    }
    return (await response.json()) === true ? 'claimed' : 'rate_limited';
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'UnknownError';
    console.warn('GDELT refresh lease failed', { reason });
    return 'unavailable';
  }
}

async function loadPersistedNews(): Promise<NewsItem[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) return [];

  const params = new URLSearchParams({
    select: 'category,title,canonical_url,source_domain,language_code,source_country,observed_at',
    observed_at: 'gte.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    order: 'observed_at.desc',
    limit: '50',
  });
  try {
    const response = await fetch(`${base}/rest/v1/news_items?${params}`, {
      headers: { apikey: key, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return [];
    const rows = await response.json() as PersistedNewsRow[];
    if (!Array.isArray(rows)) return [];

    return rows.flatMap((row) => {
      if (!row.title || !row.canonical_url || !row.observed_at) return [];
      let url: URL;
      try {
        url = new URL(row.canonical_url);
      } catch {
        return [];
      }
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return [];
      const observedMs = Date.parse(row.observed_at);
      if (!Number.isFinite(observedMs) || observedMs > Date.now() + 300000) return [];
      const category = typeof row.category === 'string' &&
        Object.prototype.hasOwnProperty.call(labels, row.category)
        ? row.category as Category
        : 'other';
      return [{
        id: url.toString(),
        category,
        categoryLabel: labels[category],
        title: row.title.slice(0, 500),
        url: url.toString(),
        observedAt: new Date(observedMs).toISOString(),
        sourceDomain: (row.source_domain || url.hostname).slice(0, 160),
        language: row.language_code || null,
        sourceCountry: row.source_country || null,
        source: 'GDELT DOC 2.0 (cached)',
      }];
    });
  } catch {
    return [];
  }
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
  try {
    const response = await fetch(`${base}/rest/v1/rpc/ingest_news_batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_source_key: 'gdelt-doc', p_rows: rows }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return 'write_failed';
    return `persisted:${await response.json() as number}`;
  } catch {
    return 'unavailable';
  }
}

export async function GET() {
  const refreshClaim = await claimNewsRefresh();
  let sourceError: string | null = null;
  let sourceCauseCode: string | null = null;
  let sourceHttpStatus: number | null = null;
  if (refreshClaim === 'rate_limited') sourceError = 'GDELT_REFRESH_THROTTLED';
  if (refreshClaim === 'unavailable') sourceError = 'GDELT_REFRESH_GUARD_UNAVAILABLE';

  const params = new URLSearchParams({
    query: GDELT_BROAD_QUERY,
    mode: 'ArtList',
    format: 'json',
    maxrecords: '30',
    sort: 'DateDesc',
    timespan: '7d',
  });
  let articles: NewsItem[] = [];
  if (refreshClaim === 'claimed' || refreshClaim === 'not_configured') {
    try {
      const response = await fetch('https://api.gdeltproject.org/api/v2/doc/doc?' + params, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: GDELT_REFRESH_INTERVAL_SECONDS },
      });
      if (!response.ok) {
        sourceHttpStatus = response.status;
        const rawPayload = await response.text().catch(() => '');
        const classified = classifyGdeltUpstreamError(
          response.status,
          response.headers.get('content-type') ?? '',
          rawPayload,
        );
        sourceError = classified === 'GDELT_INVALID_RESPONSE'
          ? 'GDELT_HTTP_' + response.status
          : classified;
        console.warn('GDELT global news request returned an upstream error', {
          status: response.status,
          sourceError,
          preview: rawPayload.slice(0, 160).replace(/\s+/g, ' '),
        });
      } else {
        sourceHttpStatus = response.status;
        const rawPayload = await response.text();
        let payload: { articles: Article[] } | null = null;
        try {
          payload = parseGdeltResponse(rawPayload) as { articles: Article[] };
        } catch {
          sourceError = classifyGdeltUpstreamError(
            response.status,
            response.headers.get('content-type') ?? '',
            rawPayload,
          );
          console.warn('GDELT global news response was not valid JSON', {
            status: response.status,
            contentType: response.headers.get('content-type') ?? 'unknown',
            sourceError,
            preview: rawPayload.slice(0, 160).replace(/\s+/g, ' '),
          });
        }
        articles = (Array.isArray(payload?.articles) ? payload.articles : []).flatMap((article) => {
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
      const details = error as Error & { cause?: { code?: string } };
      sourceCauseCode = typeof details.cause?.code === 'string'
        ? details.cause.code.slice(0, 80)
        : null;
      sourceError = 'GDELT_' + reason;
      console.warn('GDELT global news fetch failed', { reason, causeCode: sourceCauseCode });
    }
  }

  const freshUnique = [...new Map(articles.map((article) => [article.url, article])).values()]
    .sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt))
    .slice(0, 50);
  const cachedNews = freshUnique.length === 0 ? await loadPersistedNews() : [];
  const staleFallback = freshUnique.length === 0 && cachedNews.length > 0;
  const unique = freshUnique.length > 0 ? freshUnique : cachedNews;
  const categoryCounts = Object.fromEntries(
    (Object.keys(labels) as Category[]).map((category) => [category, unique.filter((article) => article.category === category).length]),
  );
  const categoriesRequested = Object.keys(labels).filter((category) => category !== 'other');
  const persistence = sourceError
    ? staleFallback ? 'served_stale_cache' : 'skipped_source_unavailable'
    : freshUnique.length === 0
      ? staleFallback ? 'served_stale_cache' : 'no_new_articles'
      : await persistNews(freshUnique);

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
    sourceCauseCode,
    sourceHttpStatus,
    staleFallback,
    articles: unique,
    note: 'GDELT indexes global news but is not exhaustive or a guaranteed real-time wire service. The timestamp shown is the feed observation time, not necessarily the publisher publication time. Categories are preliminary title-keyword labels; open the original publisher to verify facts.',
  }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
