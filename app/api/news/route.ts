import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
type Category = 'disasters' | 'conflict' | 'politics' | 'economy' | 'health' | 'cyber' | 'science' | 'energy';
type Article = { title?: string; url?: string; seendate?: string; domain?: string; language?: string; sourcecountry?: string };
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
const labels: Record<Category,string> = {
  disasters:'الكوارث والطوارئ', conflict:'النزاعات والأمن', politics:'السياسة والدبلوماسية',
  economy:'الاقتصاد والأسواق', health:'الصحة والأوبئة', cyber:'الأمن السيبراني',
  science:'العلوم والتقنية', energy:'الطاقة والبنية التحتية',
};
function timestamp(value?: string): string | null {
  if (!value || !/^\d{8}T\d{6}Z$/.test(value)) return null;
  const iso = value.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, '$1-$2-$3T$4:$5:$6Z');
  const ms = Date.parse(iso);
  return Number.isFinite(ms) && ms <= Date.now() + 300000 ? new Date(ms).toISOString() : null;
}
export async function GET() {
  const categories = Object.keys(queries) as Category[];
  const results = await Promise.allSettled(categories.map(async (category) => {
    const params = new URLSearchParams({ query: queries[category], mode: 'ArtList', format: 'json', maxrecords: '8', sort: 'DateDesc' });
    const response = await fetch('https://api.gdeltproject.org/api/v2/doc/doc?' + params, { signal: AbortSignal.timeout(7000), next: { revalidate: 120 } });
    if (!response.ok) throw new Error('GDELT HTTP ' + response.status);
    const payload = await response.json() as { articles?: Article[] };
    return (Array.isArray(payload.articles) ? payload.articles : []).flatMap((a) => {
      let url: URL;
      try { url = new URL(a.url || ''); } catch { return []; }
      const publishedAt = timestamp(a.seendate);
      if (!publishedAt || !a.title || !['https:', 'http:'].includes(url.protocol)) return [];
      return [{ id: url.toString(), category, categoryLabel: labels[category], title: a.title.slice(0,500), url: url.toString(), publishedAt, sourceDomain: (a.domain || url.hostname).slice(0,160), language: a.language || null, sourceCountry: a.sourcecountry || null, source: 'GDELT DOC 2.0' }];
    });
  }));
  const articles = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  const unique = [...new Map(articles.map(a => [a.url,a])).values()].sort((a,b) => Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,50);
  const unavailable = results.flatMap((r,i) => r.status === 'rejected' ? [categories[i]] : []);
  return NextResponse.json({
    fetchedAtUtc: new Date().toISOString(), source: 'GDELT DOC 2.0', coverage: 'partial',
    categoriesRequested: categories, categoriesUnavailable: unavailable, articles: unique,
    note: 'GDELT indexes global news but is not exhaustive or a guaranteed real-time wire service. Timestamps are feed observation times; open the original publisher to verify facts.',
  }, { headers: { 'Cache-Control': 'public, s-maxage=90, stale-while-revalidate=180' } });
}
