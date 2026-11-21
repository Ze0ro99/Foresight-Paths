'use client';

import React from 'react';
import { Sparkles, ShieldAlert, Film, ArrowLeft } from 'lucide-react';
import {
  HypothesisId,
  LiveEvent,
  ScenarioProbabilities,
} from '@/lib/types';
import {
  HYPOTHESIS_META,
  PLATFORM_LAYER_META,
  RELIABILITY_LABELS,
  SCENARIO_META,
  SECTOR_LABELS,
  THREAT_MECHANISM_META,
  TRACK_LABELS,
} from '@/lib/trajectory-engine';

interface EventDetailInspectorProps {
  event: LiveEvent | null;
  probabilities: ScenarioProbabilities;
  geodesicSpanFromParentKm?: number | null;
  onRunDeepAiAnalysis: (event: LiveEvent) => void;
  isAnalyzingAi: boolean;
  onOpenFilmTab: () => void;
}

export default function EventDetailInspector({
  event,
  probabilities,
  geodesicSpanFromParentKm,
  onRunDeepAiAnalysis,
  isAnalyzingAi,
  onOpenFilmTab,
}: EventDetailInspectorProps) {
  if (!event) {
    return (
      <aside className="rounded-lg border border-[#2B2856] bg-[#101124] p-6 text-center">
        <p className="text-sm text-[#A5B4FC]">
          اختر حدثاً من خريطة المسارات لعرض التحليل التفصيلي ومصفوفة الفرضيات ومشهده السينمائي.
        </p>
      </aside>
    );
  }

  const hypothesisIds: HypothesisId[] = [
    'human_error',
    'infra_failure',
    'cyber_attack',
    'disinfo_cascade',
  ];

  const polarityLabel = (p: 'falsifies' | 'neutral' | 'supports') => {
    if (p === 'falsifies') return 'نافي (يفنّد)';
    if (p === 'supports') return 'داعم';
    return 'محايد';
  };

  const polarityColor = (p: 'falsifies' | 'neutral' | 'supports') => {
    if (p === 'falsifies') return 'text-[#FB7185] font-semibold';
    if (p === 'supports') return 'text-[#34D399] font-semibold';
    return 'text-[#A5B4FC]';
  };

  const dominantMeta = SCENARIO_META[probabilities.dominant];
  const threatMeta = THREAT_MECHANISM_META[event.threatMechanism];

  return (
    <aside
      aria-label="التحليل التفصيلي للحدث المختار"
      className="rounded-lg border border-[#2B2856] bg-[#101124]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#2B2856] p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A5B4FC] tabular-nums">
            <span>الحدث #{event.sequence}</span>
            <span aria-hidden="true">·</span>
            <span className="font-latin-math">{event.timestamp}</span>
            <span aria-hidden="true">·</span>
            <span>{SECTOR_LABELS[event.sector]}</span>
            <span aria-hidden="true">·</span>
            <span>{PLATFORM_LAYER_META[event.platformLayer].shortLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-latin-math text-[#C084FC]">
              {event.coordinates.city} ({event.coordinates.lat.toFixed(2)}°,{' '}
              {event.coordinates.lng.toFixed(2)}°)
            </span>
          </div>
          <h3 className="mt-1.5 text-lg font-bold text-white">
            {event.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#D1D5DB]">
            {event.summary}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onRunDeepAiAnalysis(event)}
          disabled={isAnalyzingAi}
          className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-md border border-[#9333EA] bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {isAnalyzingAi ? 'جارٍ التحليل المعمق...' : 'تحديث التحليل عبر Gemini'}
          </span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 border-b border-[#1E1B4B] bg-[#0C0D16] px-5 py-3.5 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <div className="text-[11px] font-medium text-[#A5B4FC]">
            آلية التهديد المرصودة
          </div>
          <div className="mt-0.5 text-xs font-semibold text-[#FDA4AF]">
            {threatMeta.shortLabel}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-[#A5B4FC]">
            المنصة والمركز الشبكي
          </div>
          <div className="mt-0.5 text-xs font-semibold text-white">
            {PLATFORM_LAYER_META[event.platformLayer].shortLabel} ·{' '}
            <span className="font-latin-math text-[#C084FC]">
              {event.coordinates.asnOrHub}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-[#A5B4FC]">
            موثوقية المصدر
          </div>
          <div className="mt-0.5 text-xs font-semibold text-white">
            {RELIABILITY_LABELS[event.reliabilityGrade]}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-[#A5B4FC]">
            نقطة الفشل الوحيدة (SPOF)
          </div>
          <div className="mt-0.5 text-xs font-semibold text-white">
            {event.spofNode}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-[#A5B4FC]">
            العدوى المالية والزمن
          </div>
          <div className="mt-0.5 font-latin-math text-xs font-semibold text-white">
            {event.marketImpactBps} bps · +{event.latencySpikeMs} ms
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-[#A5B4FC]">
            الامتداد الكروي والتضليل
          </div>
          <div className="mt-0.5 font-mono-tabular text-xs font-semibold text-[#C084FC]">
            {geodesicSpanFromParentKm != null
              ? `${geodesicSpanFromParentKm} km · `
              : ''}
            تضليل {event.disinfoVelocity}% · {dominantMeta.title}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
        {/* Forensic & ACH breakdown */}
        <div>
          <h4 className="text-sm font-bold text-white">
            التدقيق الجنائي وتقييم النفي (ACH) للحدث
          </h4>
          <p className="mt-1.5 text-xs leading-relaxed text-[#A5B4FC]">
            {event.technicalDetails} · المصدر: {event.sourceName}
          </p>

          <div className="mt-3 divide-y divide-[#1E1B4B] rounded-md border border-[#2B2856] bg-[#0C0D16]">
            {hypothesisIds.map((hId) => {
              const cell = event.achEvidence[hId];
              return (
                <div
                  key={hId}
                  className="flex items-start justify-between gap-3 px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {HYPOTHESIS_META[hId].label}
                    </div>
                    <div className="mt-0.5 text-[#CBD5E1]">{cell.note}</div>
                  </div>
                  <div className="shrink-0 text-left">
                    <div className={polarityColor(cell.polarity)}>
                      {polarityLabel(cell.polarity)}
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#A5B4FC]">
                      وزن {cell.weight}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Red Teaming & Realistic Global Film Beat */}
        <div className="flex flex-col justify-between gap-4">
          <div className="rounded-md border border-[#2B2856] bg-[#121329] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldAlert className="h-4 w-4 text-[#E11D48]" aria-hidden="true" />
              <span>المراجعة النظيرة الداخلية (Red Teaming)</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#E5E7EB]">
              {event.redTeamCounter}
            </p>
          </div>

          {event.filmScene && (
            <div className="rounded-md border border-[#2B2856] bg-[#0C0D16] p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#C084FC]">
                  <Film className="h-4 w-4" aria-hidden="true" />
                  <span>
                    مشهد سيناريو الفيلم المرتبط (الفصل {event.filmScene.act})
                  </span>
                </div>
                <span className="font-latin-math text-[11px] text-[#A5B4FC]">
                  {event.filmScene.timecode}
                </span>
              </div>
              <h5 className="mt-2 text-sm font-bold text-white">
                {event.filmScene.title}
              </h5>
              <div className="mt-1 text-xs text-[#A5B4FC]">
                {event.filmScene.location}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#D1D5DB]">
                {event.filmScene.dramaticConflict}
              </p>
              <blockquote className="mt-2.5 border-t border-[#1E1B4B] pt-2 text-xs italic text-white">
                {event.filmScene.dialogueExcerpt}
              </blockquote>
              <button
                type="button"
                onClick={onOpenFilmTab}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#C084FC] hover:text-white"
              >
                <span>عرض سيناريو الفيلم العالمي كاملاً</span>
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
