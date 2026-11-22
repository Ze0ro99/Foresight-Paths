'use client';

import { useCallback, useEffect, useState } from 'react';

type Article = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  url: string;
  publishedAt: string;
  sourceDomain: string;
  source: string;
};

type NewsPayload = {
  fetchedAtUtc: string;
  articles: Article[];
  categoriesUnavailable: string[];
  note: string;
};

const CATEGORY_ORDER = [
  'الكوارث والطوارئ',
  'النزاعات والأمن',
  'السياسة والدبلوماسية',
  'الاقتصاد والأسواق',
  'الصحة والأوبئة',
  'الأمن السيبراني',
  'العلوم والتقنية',
  'الطاقة والبنية التحتية',
];

export default function LiveNewsPanel({ locale }: { locale: string }) {
  const [payload, setPayload] = useState<NewsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isArabic = locale === 'ar';

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/news', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as NewsPayload;
      if (!Array.isArray(data.articles)) throw new Error('Invalid news response');
      setPayload(data);
      setError(null);
    } catch {
      setError(isArabic ? 'تعذر تحديث موجز الأخبار حالياً.' : 'News feed is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, [isArabic]);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 120_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const groups = CATEGORY_ORDER.map((label) => ({
    label,
    articles: (payload?.articles ?? []).filter((article) => article.categoryLabel === label),
  })).filter((group) => group.articles.length > 0);

  return (
    <section aria-label={isArabic ? 'الأخبار العالمية الحية' : 'Live global news'} className="mx-4 my-4 rounded-xl border border-cyan-400/15 bg-[#0C111B] p-4 md:mx-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-white">{isArabic ? 'موجز الأخبار والأحداث العالمية' : 'Global news and events'}</h2>
          <p className="mt-1 text-[11px] text-white/50">{isArabic ? 'مصادر صحفية مفهرسة عبر GDELT · تحديث تلقائي كل دقيقتين' : 'GDELT-indexed publishers · refreshes every two minutes'}</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="rounded-md border border-cyan-300/20 px-3 py-1.5 text-xs text-cyan-100 disabled:opacity-50">
          {loading ? (isArabic ? 'جارٍ التحديث…' : 'Refreshing…') : (isArabic ? 'تحديث الآن' : 'Refresh now')}
        </button>
      </div>
      {error && <p role="status" className="mb-3 text-xs text-amber-200">{error}</p>}
      {payload && (
        <>
          <div className="mb-3 flex flex-wrap gap-2 text-[10px] text-white/50">
            <span>{isArabic ? 'النتائج' : 'Articles'}: {payload.articles.length}</span>
            <span>·</span>
            <span>{isArabic ? 'آخر جلب' : 'Fetched'}: {new Date(payload.fetchedAtUtc).toLocaleTimeString(isArabic ? 'ar' : 'en', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</span>
            <span>·</span>
            <span>{isArabic ? 'التغطية جزئية' : 'Partial coverage'}</span>
          </div>
          {groups.length === 0 && <p className="text-xs text-white/60">{isArabic ? 'لا توجد مقالات متاحة في هذه اللحظة.' : 'No articles are currently available.'}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <div key={group.label} className="min-w-0">
                <h3 className="mb-2 border-b border-white/10 pb-1 text-xs font-semibold text-cyan-100">{group.label}</h3>
                <ul className="space-y-2">
                  {group.articles.slice(0, 5).map((article) => (
                    <li key={article.id} className="text-xs">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="leading-relaxed text-white/85 hover:text-cyan-200 hover:underline">{article.title}</a>
                      <div className="mt-0.5 flex flex-wrap gap-2 text-[10px] text-white/40">
                        <span>{article.sourceDomain}</span>
                        <time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleString(isArabic ? 'ar' : 'en', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', timeZoneName: 'short' })}</time>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-white/10 pt-3 text-[10px] leading-relaxed text-white/40">{payload.note}</p>
        </>
      )}
    </section>
  );
}
