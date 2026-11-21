'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  Film,
  Compass,
  AlertTriangle,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import { AppLocale, FullScenarioDossier, LiveEvent } from '@/lib/types';
import { SCENARIO_META } from '@/lib/trajectory-engine';
import { EPISTEMIC_TIER_META } from '@/lib/decoder-engine';
import { buildEventVerificationPayload } from '@/lib/pi-ecosystem-engine';
import { UI_COPY, getEpistemicCopy, getQKeyCopy } from '@/lib/i18n';

interface ScenarioDetailDrawerProps {
  locale: AppLocale;
  dossier: FullScenarioDossier | null;
  onClose: () => void;
  onAnalyzeEventWithAi: (event: LiveEvent) => void;
  onSimulateNextWithAi: () => void;
  isAnalyzingAi: boolean;
  onOpenBackendMechanics: () => void;
}

export default function ScenarioDetailDrawer({
  locale,
  dossier,
  onClose,
  onAnalyzeEventWithAi,
  onSimulateNextWithAi,
  isAnalyzingAi,
  onOpenBackendMechanics,
}: ScenarioDetailDrawerProps) {
  const [shaState, setShaState] = useState<{
    dossierId: string;
    hex: string;
  } | null>(null);
  const copy = UI_COPY[locale];

  useEffect(() => {
    if (!dossier) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dossier, onClose]);

  if (!dossier) return null;

  const scMeta = SCENARIO_META[dossier.scenarioId];
  const tierMeta = EPISTEMIC_TIER_META[dossier.epistemicTier];
  const tierCopy = getEpistemicCopy(dossier.epistemicTier, locale);
  const qkCopy = getQKeyCopy(dossier.qKeyDomain, locale);

  const shaDigest =
    shaState?.dossierId === dossier.id ? shaState.hex : null;

  const handleComputeDigest = async () => {
    const raw = dossier.sourceEvent
      ? buildEventVerificationPayload(dossier.sourceEvent)
      : JSON.stringify({
          id: dossier.id,
          headline: dossier.headline,
          coords: dossier.coordinatesLabel,
        });
    const encoded = new TextEncoder().encode(raw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setShaState({ dossierId: dossier.id, hex });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scenario-dossier-title"
      className="fixed inset-0 z-40 flex justify-end bg-black/55 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: locale === 'ar' ? -28 : 28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[560px] flex-col overflow-x-hidden border-x border-[#312E81] bg-[#0B0B14] shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#2B2856] bg-[#101124] px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className="font-bold"
                style={{
                  color: dossier.kind === 'forecast' ? '#C084FC' : '#FB7185',
                }}
              >
                {dossier.badgeLabel}
              </span>
              <span aria-hidden="true" className="text-[#6366F1]">
                ·
              </span>
              <span className="font-semibold" style={{ color: scMeta.color }}>
                {copy.scenarioPrefix} {dossier.scenarioTitle} ({dossier.scenarioProbability}%)
              </span>
              <span aria-hidden="true" className="text-[#6366F1]">
                ·
              </span>
              <span className="font-semibold" style={{ color: tierMeta.color }}>
                {tierCopy.label}
              </span>
            </div>
            <h2
              id="scenario-dossier-title"
              className="mt-1.5 text-lg font-bold leading-snug text-white"
            >
              {dossier.headline}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#A5B4FC]">
              <Compass className="h-3.5 w-3.5 text-[#E11D48] shrink-0" aria-hidden="true" />
              <span>{dossier.subheadline}</span>
              <span className="font-latin-math text-[11px] text-[#C084FC]">
                ({dossier.coordinatesLabel})
              </span>
              <span className="text-[11px] text-[#CBD5E1]">
                · Q-KEY: {qkCopy.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeLabel}
            className="shrink-0 rounded-md border border-[#2B2856] bg-[#0C0D16] p-2 text-[#A5B4FC] hover:border-[#E11D48] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Full Scenario Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
          {/* Executive Full Scenario Summary */}
          <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-4">
            <div className="text-[11px] font-bold text-[#C084FC]">
              {copy.drawerSummaryHeading}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-[#F3F4F6]">
              {dossier.executiveNarrative}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-[#1E1B4B] pt-3 sm:grid-cols-2">
              <div>
                <span className="text-[#A5B4FC]">{copy.drawerPlatformLabel}</span>
                <span className="font-semibold text-white">
                  {dossier.platformLabel}
                </span>
              </div>
              <div>
                <span className="text-[#A5B4FC]">{copy.drawerThreatLabel}</span>
                <span className="font-semibold text-[#FDA4AF]">
                  {dossier.threatLabel}
                </span>
              </div>
            </div>
          </section>

          {/* Step-by-step Complete Scenario Progression */}
          <section>
            <h3 className="text-sm font-bold text-white">
              {copy.drawerStagesHeading}
            </h3>
            <div className="mt-2.5 space-y-2.5">
              {dossier.stages.map((stage) => (
                <div
                  key={stage.phase}
                  className="rounded-md border border-[#2B2856] bg-[#101124] p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#C084FC]">
                      {stage.phase}
                    </span>
                    <span className="font-latin-math text-[11px] text-[#A5B4FC]">
                      {stage.timeframe}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">
                    {stage.title}
                  </div>
                  <p className="mt-1 leading-relaxed text-[#CBD5E1]">
                    {stage.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Triggers, Dual-Map Insight & Cryptographic SHA-256 Digest */}
          <section className="rounded-md border border-[#2B2856] bg-[#121329] p-4 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
              <span>{copy.drawerVerifyHeading}</span>
            </div>
            <p className="leading-relaxed text-[#E5E7EB]">
              <strong className="text-white">{copy.drawerMainTrigger}</strong>
              {dossier.triggerOrCause}
            </p>
            <p className="leading-relaxed text-[#FDA4AF]">
              <strong className="text-white">{copy.drawerEarlyWarning}</strong>
              {dossier.earlyWarning}
            </p>
            <p className="border-t border-[#1E1B4B] pt-2 leading-relaxed text-[#C7D2FE]">
              <strong className="text-white">{copy.drawerDualMapLink}</strong>
              {dossier.dualMapInsight}
            </p>
            <p className="text-[11px] text-[#CBD5E1]">
              <strong style={{ color: tierMeta.color }}>
                {copy.drawerEpistemicTierLabel} ({tierCopy.label}):{' '}
              </strong>
              {tierCopy.rule}
            </p>

            <div className="border-t border-[#1E1B4B] pt-2.5">
              <button
                type="button"
                onClick={() => void handleComputeDigest()}
                className="inline-flex items-center gap-1.5 rounded border border-[#312E81] bg-[#0C0D16] px-3 py-1.5 text-[11px] font-semibold text-[#E0E7FF] hover:border-[#16A34A]"
              >
                <Fingerprint className="h-3.5 w-3.5 text-[#4ADE80]" aria-hidden="true" />
                <span>{copy.drawerShaButton}</span>
              </button>
              {shaDigest && (
                <div
                  dir="ltr"
                  className="mt-2 break-all rounded bg-[#07070B] px-2.5 py-1.5 font-latin-math text-[10px] text-[#4ADE80]"
                >
                  SHA-256: {shaDigest}
                </div>
              )}
            </div>
          </section>

          {/* Synchronized Global Film Scene */}
          <section className="rounded-md border border-[#312E81] bg-[#101124] p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-[#C084FC]">
                <Film className="h-4 w-4" aria-hidden="true" />
                <span>
                  {copy.drawerFilmHeading} ({copy.drawerActPrefix} {dossier.filmScene.act})
                </span>
              </div>
              <span className="font-latin-math text-[11px] text-[#A5B4FC]">
                {dossier.filmScene.timecode}
              </span>
            </div>
            <h4 className="mt-2 text-sm font-bold text-white">
              {dossier.filmScene.title}
            </h4>
            <div className="mt-0.5 text-[11px] text-[#A5B4FC]">
              {dossier.filmScene.location}
            </div>
            <p className="mt-2 leading-relaxed text-[#D1D5DB]">
              {dossier.filmScene.dramaticConflict}
            </p>
            <blockquote className="mt-2.5 border-t border-[#1E1B4B] pt-2.5 text-sm font-medium text-white">
              {dossier.filmScene.dialogueExcerpt}
            </blockquote>
          </section>

          {/* Quiet Expandable Backend Mechanics Preview */}
          <details className="rounded-md border border-[#1E1B4B] bg-[#0C0D16] p-3.5">
            <summary className="cursor-pointer font-semibold text-[#A5B4FC] hover:text-white">
              {copy.drawerBackendSummary}
            </summary>
            <p className="mt-2 leading-relaxed text-[#CBD5E1]">
              {dossier.backendSummary}
            </p>
            <button
              type="button"
              onClick={onOpenBackendMechanics}
              className="mt-2.5 inline-flex items-center gap-1.5 font-semibold text-[#C084FC] hover:text-white"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{copy.drawerOpenBackendBtn}</span>
              {locale === 'ar' ? (
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </details>
        </div>

        {/* Sticky Drawer Footer CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2B2856] bg-[#101124] px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#312E81] bg-[#0C0D16] px-4 py-2 text-xs font-medium text-[#E0E7FF] hover:border-[#7C3AED]"
          >
            {copy.backToMap}
          </button>

          {dossier.sourceEvent ? (
            <button
              type="button"
              onClick={() => onAnalyzeEventWithAi(dossier.sourceEvent!)}
              disabled={isAnalyzingAi}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {isAnalyzingAi ? copy.drawerUpdatingGemini : copy.drawerDeepenGemini}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSimulateNextWithAi}
              disabled={isAnalyzingAi}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {isAnalyzingAi ? copy.drawerPredictingGemini : copy.drawerPredictGemini}
              </span>
            </button>
          )}
        </div>
      </motion.aside>
    </div>
  );
}
