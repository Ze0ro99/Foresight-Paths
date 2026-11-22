import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type GdeltArticle = {
  title?: string;
  url?: string;
  seendate?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
};

type NewsCategory =
  | 'disasters'
  | 'conflict'
  | 'politics'
  | 'economy'
  | 'health'
  | 'cyber'
  | 'science'
  | 'energy';

const CATEGORY_QUERIES: Record<NewsCategory, string> = {
  disasters: '(earthquake OR flood OR wildfire OR hurricane OR volcano OR tsunami)',
  conflict: '(war OR conflict OR ceasefire OR missile OR attack OR invasion)',
  politics: '(election OR parliament OR government OR diplomacy OR sanctions)',
  economy: '(inflation OR central bank OR markets OR trade OR recession)',
  health: '(outbreak OR epidemic OR pandemic OR public health OR vaccine)',
  cyber: '(cyberattack OR ransomware OR data breach OR vulnerability OR outage)',
  science: '(science OR space OR research OR technology OR artificial intelligence)',
  energy: '(oil OR gas OR electricity OR power grid OR renewable energy)',
};

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  disasters: 'الكوارث والطوارئ',
  conflict: 'النزاعات والأمن',
  politics: 'السياسة والدبلوماسية',
  economy: 'الاقتصاد والأسواق',
  health: 'الصحة والأوبئة',
  cyber: 'الأمن السيبراني',
  science: 'العلوم والتقنية',
  energy: 'الطاقة والبنية التحتية',
};

function parseGdeltDate(value?: string): string | null {
  if (!value || !/^\\d{8}T\\d{6}Z$/.test(value)) return null;
  const iso = value.replace(
    /^(\\d{4})(\\d{2})(\\d{2})T(\\d{2})(\\d{2})(\\d{2})Z$/,
    '$1-$2-$3T$4:$5:$6Z'
  );
  const time = Date.parse(iso);
  if (!Number.isFinite(time) || time > Date.now() + 5 * 60_000) return null;
  return new Date(time).toISOString();
}

function safeHttpUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const settled = await Promise.allSettled(
    (Object.keys(CATEGORY_QUERIES) as NewsCategory[]).map(async (category) => {
      const params = new URLSearchParams({
        query: CATEGORY_QUERIES[category],
        mode: 'ArtList',
        format: 'json',
        maxrecords: '8',
        sort: 'DateDesc',
      });
      const response = await fetch(
        `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`,
        { signal: AbortSignal.timeout(7000), next: { revalidate: 120 } }
      );
      if (!response.ok) throw new Error(`GDELT returned HTTP ${response.status}`);
      const payload = (await response.json()) as { articles?: GdeltArticle[] };
      const articles = Array.isArray(payload.articles) ? payload.articles : [];
      return articles.flatMap((article) => {
        const url = safeHttpUrl(article.url);
        const publishedAt = parseGdeltDate(article.seendate);
        const title = article.title?.trim();
        if (!url || !publishedAt || !title) return [];
        return [{
          id: url,
          category,
          categoryLabel: CATEGORY_LABELS[category],
          title: title.slice(0, 500),
          url,
          publishedAt,
          sourceDomain: (article.domain || new URL(url).hostname).slice(0, 160),
          language: article.language || null,
          sourceCountry: article.sourcecountry || null,
          source: 'GDELT DOC 2.0',
        }];
      });
    })
  );

  const articles = settled.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : []
  );
  const unique = Array.from(new Map(articles.map((article) => [article.url, article])).values())
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 50);
  const failedCategories = settled.flatMap((result, index) =>
    result.status === 'rejected'
      ? [(Object.keys(CATEGORY_QUERIES) as NewsCategory[])[index]]
      : []
  );

  return NextResponse.json(
    {
      fetchedAtUtc: new Date().toISOString(),
      source: 'GDELT DOC 2.0',
      coverage: 'partial',
      categoriesRequested: Object.keys(CATEGORY_QUERIES),
      categoriesUnavailable: failedCategories,
      articles: unique,
      note: 'GDELT indexes global news coverage but is not exhaustive or a guaranteed real-time wire service. Article timestamps and links are attributed to the source feed; relevance and factual accuracy require reading the original publisher.',
    },
    { headers: { 'Cache-Control': 'public, s-maxage=90, stale-while-revalidate=180' } }
  );
}
