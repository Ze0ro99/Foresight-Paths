'use client';

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import {
  AppLocale,
  EpistemicTier,
  EventDraftInput,
  LiveEvent,
  PlatformLayerId,
  QKeyDomainId,
  ReliabilityGrade,
  ResearchTrack,
  SectorType,
  ThreatMechanismId,
} from '@/lib/types';
import {
  DEFAULT_COORDS_BY_SECTOR,
  validateEventInput,
} from '@/lib/trajectory-engine';
import { EPISTEMIC_TIER_META, QKEY_DOMAINS } from '@/lib/decoder-engine';
import {
  UI_COPY,
  getEpistemicCopy,
  getPlatformCopy,
  getQKeyCopy,
  getReliabilityCopy,
  getSectorCopy,
  getThreatCopy,
  getTrackCopy,
} from '@/lib/i18n';

interface AddEventModalProps {
  open: boolean;
  locale: AppLocale;
  existingEvents: LiveEvent[];
  onClose: () => void;
  onSubmitEvent: (draft: EventDraftInput, useAi: boolean) => Promise<void>;
  isSubmitting: boolean;
}

const SECTORS: SectorType[] = ['telecom', 'finance', 'aviation', 'energy', 'media'];
const TRACKS: ResearchTrack[] = ['osint', 'ach', 'semiotics', 'contagion'];
const THREATS: ThreatMechanismId[] = [
  'bgp_spof',
  'algo_contagion',
  'narrative_swarm',
  'supply_choke',
  'ai_amplification',
];
const PLATFORMS: PlatformLayerId[] = [
  'cloud_routing',
  'financial_hft',
  'social_swarm',
  'energy_maritime',
  'discourse_media',
];
const GRADES: ReliabilityGrade[] = ['A1', 'B2', 'C3', 'D4'];
const TIERS = Object.keys(EPISTEMIC_TIER_META) as EpistemicTier[];

export default function AddEventModal({
  open,
  locale,
  existingEvents,
  onClose,
  onSubmitEvent,
  isSubmitting,
}: AddEventModalProps) {
  const copy = UI_COPY[locale];
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [sector, setSector] = useState<SectorType>('telecom');
  const [track, setTrack] = useState<ResearchTrack>('osint');
  const [threatMechanism, setThreatMechanism] =
    useState<ThreatMechanismId>('bgp_spof');
  const [platformLayer, setPlatformLayer] =
    useState<PlatformLayerId>('cloud_routing');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState(DEFAULT_COORDS_BY_SECTOR.telecom.lat);
  const [lng, setLng] = useState(DEFAULT_COORDS_BY_SECTOR.telecom.lng);
  const [coordsEdited, setCoordsEdited] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [reliabilityGrade, setReliabilityGrade] =
    useState<ReliabilityGrade>('B2');
  const [spofNode, setSpofNode] = useState('');
  const [parentEventId, setParentEventId] = useState<string>(
    existingEvents[existingEvents.length - 1]?.id ?? ''
  );
  const [marketImpactBps, setMarketImpactBps] = useState(35);
  const [latencySpikeMs, setLatencySpikeMs] = useState(180);
  const [disinfoVelocity, setDisinfoVelocity] = useState(40);
  const [epistemicTier, setEpistemicTier] =
    useState<EpistemicTier>('plausible');
  const [qKeyDomain, setQKeyDomain] = useState<QKeyDomainId>('trump_era');
  const [useAi, setUseAi] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const fallbackCity =
    locale === 'ar'
      ? DEFAULT_COORDS_BY_SECTOR[sector].city
      : DEFAULT_COORDS_BY_SECTOR[sector].regionCode;

  const displayedCity = coordsEdited ? city : fallbackCity;

  const handleSectorChange = (newSector: SectorType) => {
    setSector(newSector);
    const defaultLayerBySector: Record<SectorType, PlatformLayerId> = {
      telecom: 'cloud_routing',
      finance: 'financial_hft',
      aviation: 'energy_maritime',
      energy: 'energy_maritime',
      media: 'social_swarm',
    };
    setPlatformLayer(defaultLayerBySector[newSector]);
    if (!coordsEdited) {
      const def = DEFAULT_COORDS_BY_SECTOR[newSector];
      setLat(def.lat);
      setLng(def.lng);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const draft: EventDraftInput = {
      title,
      summary,
      sector,
      track,
      threatMechanism,
      platformLayer,
      epistemicTier,
      qKeyDomain,
      city: displayedCity,
      lat: Number(lat),
      lng: Number(lng),
      sourceName,
      reliabilityGrade,
      spofNode,
      parentEventId: parentEventId || null,
      marketImpactBps: Number(marketImpactBps) || 0,
      latencySpikeMs: Number(latencySpikeMs) || 0,
      disinfoVelocity: Number(disinfoVelocity) || 0,
    };

    const validation = validateEventInput(draft, locale);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    await onSubmitEvent(draft, useAi);
    setTitle('');
    setSummary('');
    setCity('');
    setSourceName('');
    setSpofNode('');
    setCoordsEdited(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-event-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#312E81] bg-[#101124] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2B2856] px-5 py-4">
          <h2
            id="add-event-dialog-title"
            className="text-base font-bold text-white"
          >
            {copy.addModalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeLabel}
            className="rounded p-1.5 text-[#A5B4FC] hover:bg-[#191B38] hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 text-xs">
          <div>
            <label
              htmlFor="ev-title"
              className="block font-semibold text-white"
            >
              {copy.addTitleLabel}
            </label>
            <input
              id="ev-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={copy.addTitlePh}
              className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-sm text-white placeholder:text-[#6366F1]/70 focus:border-[#9333EA] focus:outline-none"
            />
            {errors.title && (
              <p role="alert" className="mt-1 text-[#FB7185]">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ev-summary"
              className="block font-semibold text-white"
            >
              {copy.addSummaryLabel}
            </label>
            <textarea
              id="ev-summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={copy.addSummaryPh}
              className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-sm text-white placeholder:text-[#6366F1]/70 focus:border-[#9333EA] focus:outline-none"
            />
            {errors.summary && (
              <p role="alert" className="mt-1 text-[#FB7185]">
                {errors.summary}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="ev-sector"
                className="block font-semibold text-white"
              >
                {copy.addSectorLabel}
              </label>
              <select
                id="ev-sector"
                value={sector}
                onChange={(e) => handleSectorChange(e.target.value as SectorType)}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              >
                {SECTORS.map((k) => (
                  <option key={k} value={k}>
                    {getSectorCopy(k, locale)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ev-track"
                className="block font-semibold text-white"
              >
                {copy.addTrackLabel}
              </label>
              <select
                id="ev-track"
                value={track}
                onChange={(e) => setTrack(e.target.value as ResearchTrack)}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              >
                {TRACKS.map((k) => (
                  <option key={k} value={k}>
                    {getTrackCopy(k, locale).label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ev-threat"
                className="block font-semibold text-white"
              >
                {copy.addThreatLabel}
              </label>
              <select
                id="ev-threat"
                value={threatMechanism}
                onChange={(e) =>
                  setThreatMechanism(e.target.value as ThreatMechanismId)
                }
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              >
                {THREATS.map((k) => (
                  <option key={k} value={k}>
                    {getThreatCopy(k, locale).short}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="ev-platform"
                className="block font-semibold text-white"
              >
                {copy.addPlatformLabel}
              </label>
              <select
                id="ev-platform"
                value={platformLayer}
                onChange={(e) =>
                  setPlatformLayer(e.target.value as PlatformLayerId)
                }
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              >
                {PLATFORMS.map((k) => (
                  <option key={k} value={k}>
                    {getPlatformCopy(k, locale).label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-1">
              <label
                htmlFor="ev-city"
                className="block font-semibold text-white"
              >
                {copy.addCityLabel}
              </label>
              <input
                id="ev-city"
                type="text"
                value={displayedCity}
                onChange={(e) => {
                  setCoordsEdited(true);
                  setCity(e.target.value);
                }}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-2.5 py-2 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-1">
              <label
                htmlFor="ev-lat"
                className="block font-semibold text-white"
              >
                {copy.addLatLabel}
              </label>
              <input
                id="ev-lat"
                type="number"
                step="any"
                min={-90}
                max={90}
                value={lat}
                onChange={(e) => {
                  setCoordsEdited(true);
                  setLat(Number(e.target.value));
                }}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-2.5 py-2 font-latin-math text-xs text-white"
              />
            </div>
            <div className="sm:col-span-1">
              <label
                htmlFor="ev-lng"
                className="block font-semibold text-white"
              >
                {copy.addLngLabel}
              </label>
              <input
                id="ev-lng"
                type="number"
                step="any"
                min={-180}
                max={180}
                value={lng}
                onChange={(e) => {
                  setCoordsEdited(true);
                  setLng(Number(e.target.value));
                }}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-2.5 py-2 font-latin-math text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ev-source"
                className="block font-semibold text-white"
              >
                {copy.addSourceLabel}
              </label>
              <input
                id="ev-source"
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder={copy.addSourcePh}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white placeholder:text-[#6366F1]/70"
              />
              {errors.sourceName && (
                <p role="alert" className="mt-1 text-[#FB7185]">
                  {errors.sourceName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="ev-grade"
                className="block font-semibold text-white"
              >
                {copy.addGradeLabel}
              </label>
              <select
                id="ev-grade"
                value={reliabilityGrade}
                onChange={(e) =>
                  setReliabilityGrade(e.target.value as ReliabilityGrade)
                }
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              >
                {GRADES.map((k) => (
                  <option key={k} value={k}>
                    {getReliabilityCopy(k, locale)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ev-spof"
                className="block font-semibold text-white"
              >
                {copy.addSpofLabel}
              </label>
              <input
                id="ev-spof"
                type="text"
                value={spofNode}
                onChange={(e) => setSpofNode(e.target.value)}
                placeholder={copy.addSpofPh}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white placeholder:text-[#6366F1]/70"
              />
              {errors.spofNode && (
                <p role="alert" className="mt-1 text-[#FB7185]">
                  {errors.spofNode}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="ev-parent"
                className="block font-semibold text-white"
              >
                {copy.addParentLabel}
              </label>
              <select
                id="ev-parent"
                value={parentEventId}
                onChange={(e) => setParentEventId(e.target.value)}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              >
                <option value="">{copy.addParentIndependent}</option>
                {existingEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    #{ev.sequence} — {ev.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="ev-latency"
                className="block font-semibold text-white"
              >
                {copy.addLatencyLabel}
              </label>
              <input
                id="ev-latency"
                type="number"
                min={0}
                max={5000}
                value={latencySpikeMs}
                onChange={(e) => setLatencySpikeMs(Number(e.target.value))}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 font-mono-tabular text-xs text-white"
              />
            </div>
            <div>
              <label
                htmlFor="ev-bps"
                className="block font-semibold text-white"
              >
                {copy.addBpsLabel}
              </label>
              <input
                id="ev-bps"
                type="number"
                min={0}
                max={500}
                value={marketImpactBps}
                onChange={(e) => setMarketImpactBps(Number(e.target.value))}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 font-mono-tabular text-xs text-white"
              />
            </div>
            <div>
              <label
                htmlFor="ev-disinfo"
                className="block font-semibold text-white"
              >
                {copy.addDisinfoLabel}
              </label>
              <input
                id="ev-disinfo"
                type="number"
                min={0}
                max={100}
                value={disinfoVelocity}
                onChange={(e) => setDisinfoVelocity(Number(e.target.value))}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 font-mono-tabular text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ev-epistemic"
                className="block font-semibold text-white"
              >
                {copy.addEpistemicLabel}
              </label>
              <select
                id="ev-epistemic"
                value={epistemicTier}
                onChange={(e) =>
                  setEpistemicTier(e.target.value as EpistemicTier)
                }
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              >
                {TIERS.map((tierKey) => (
                  <option key={tierKey} value={tierKey}>
                    {getEpistemicCopy(tierKey, locale).label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="ev-qkey"
                className="block font-semibold text-white"
              >
                {copy.addQKeyLabel}
              </label>
              <select
                id="ev-qkey"
                value={qKeyDomain}
                onChange={(e) => setQKeyDomain(e.target.value as QKeyDomainId)}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              >
                {QKEY_DOMAINS.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    Q-{domain.index} — {getQKeyCopy(domain.id, locale)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 rounded border border-[#7C3AED]/50 bg-[#2E1065]/30 p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="h-4 w-4 accent-[#9333EA]"
            />
            <Sparkles className="h-4 w-4 text-[#C084FC]" aria-hidden="true" />
            <span className="font-medium text-white">{copy.addAiCheckbox}</span>
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-[#2B2856] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[#312E81] bg-[#0C0D16] px-4 py-2 text-xs font-medium text-[#E0E7FF] hover:border-[#7C3AED]"
            >
              {copy.addCancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#DC2626] px-5 py-2 text-xs font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-50"
            >
              {isSubmitting ? copy.addSubmittingBtn : copy.addSubmitBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
