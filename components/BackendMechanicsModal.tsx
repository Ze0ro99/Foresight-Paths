'use client';

import React, { useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import {
  AppLocale,
  ForecastBranch,
  GlobalSensedSignal,
  HypothesisRanking,
  LiveEvent,
  MathTrajectoryMetrics,
  PlatformImpactSummary,
  RedTeamNote,
  ScenarioProbabilities,
  TrajectoryGraph,
} from '@/lib/types';
import { UI_COPY } from '@/lib/i18n';
import SemioticsOSINTView from './SemioticsOSINTView';
import ACHMatrixView from './ACHMatrixView';
import RiskAgentGeneratorView from './RiskAgentGeneratorView';
import ProtocolGatewayView from './ProtocolGatewayView';
import CloudAgentView from './CloudAgentView';
import FilmScenarioView from './FilmScenarioView';

export type BackendTab =
  | 'semiotics'
  | 'ach'
  | 'risk_gen'
  | 'protocol'
  | 'cloud_agent'
  | 'film';

interface BackendMechanicsModalProps {
  open: boolean;
  onClose: () => void;
  activeTab: BackendTab;
  onChangeTab: (tab: BackendTab) => void;
  locale: AppLocale;
  events: LiveEvent[];
  globalSignals: GlobalSensedSignal[];
  graph: TrajectoryGraph;
  probabilities: ScenarioProbabilities;
  mathMetrics: MathTrajectoryMetrics;
  forecasts: ForecastBranch[];
  achRankings: HypothesisRanking[];
  platformMatrix: PlatformImpactSummary[];
  redTeamNotes: RedTeamNote[];
  onAddRedTeamNote: (note: Omit<RedTeamNote, 'id' | 'createdAt'>) => void;
  selectedEventId: string | null;
  onSelectEventOnMap: (eventId: string) => void;
  onSelectEncryptedNodeOnMap: (nodeId: string) => void;
  isStreaming: boolean;
  onToggleStream: () => void;
  onStepForward: () => void;
  onResetTimeline: () => void;
  onSimulateAiEvent: () => void;
  isSimulatingAi: boolean;
  hasMoreSeedEvents: boolean;
}

export default function BackendMechanicsModal({
  open,
  onClose,
  activeTab,
  onChangeTab,
  locale,
  events,
  globalSignals,
  graph,
  probabilities,
  mathMetrics,
  forecasts,
  achRankings,
  platformMatrix,
  redTeamNotes,
  onAddRedTeamNote,
  selectedEventId,
  onSelectEventOnMap,
  onSelectEncryptedNodeOnMap,
  isStreaming,
  onToggleStream,
  onStepForward,
  onResetTimeline,
  onSimulateAiEvent,
  isSimulatingAi,
  hasMoreSeedEvents,
}: BackendMechanicsModalProps) {
  const copy = UI_COPY[locale];

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const tabs: { id: BackendTab; label: string }[] = [
    { id: 'semiotics', label: copy.tabSemiotics },
    { id: 'ach', label: copy.tabAch },
    { id: 'risk_gen', label: copy.tabRiskGen },
    { id: 'protocol', label: copy.tabProtocol },
    { id: 'cloud_agent', label: copy.tabCloudAgent },
    { id: 'film', label: copy.tabFilm },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="backend-mechanics-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-[1400px] flex-col overflow-hidden rounded-lg border border-[#312E81] bg-[#07070B] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2856] bg-[#0B0B14] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-4 w-4 text-[#C084FC]" aria-hidden="true" />
            <h2
              id="backend-mechanics-title"
              className="text-base font-bold text-white"
            >
              {copy.backendModalTitle}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeTab(t.id)}
                className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === t.id
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-[#A5B4FC] hover:bg-[#191B38] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeLabel}
            className="rounded-md border border-[#2B2856] bg-[#101124] p-1.5 text-[#A5B4FC] hover:border-[#E11D48] hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'semiotics' && (
            <SemioticsOSINTView
              locale={locale}
              events={events}
              mathMetrics={mathMetrics}
              forecasts={forecasts}
            />
          )}

          {activeTab === 'ach' && (
            <ACHMatrixView
              locale={locale}
              events={events}
              rankings={achRankings}
              redTeamNotes={redTeamNotes}
              onAddRedTeamNote={onAddRedTeamNote}
            />
          )}

          {activeTab === 'risk_gen' && (
            <RiskAgentGeneratorView
              locale={locale}
              events={events}
              graph={graph}
              probabilities={probabilities}
              mathMetrics={mathMetrics}
              forecasts={forecasts}
              platformMatrix={platformMatrix}
              selectedEventId={selectedEventId}
              onSelectEventOnMap={(id) => {
                onSelectEventOnMap(id);
                onClose();
              }}
              isStreaming={isStreaming}
              onToggleStream={onToggleStream}
              onStepForward={onStepForward}
              onResetTimeline={onResetTimeline}
              onSimulateAiEvent={onSimulateAiEvent}
              isSimulatingAi={isSimulatingAi}
              hasMoreSeedEvents={hasMoreSeedEvents}
            />
          )}

          {activeTab === 'protocol' && (
            <ProtocolGatewayView
              locale={locale}
              eventsCount={events.length}
              signalsCount={globalSignals.length}
            />
          )}

          {activeTab === 'cloud_agent' && (
            <CloudAgentView
              locale={locale}
              activeSignals={globalSignals}
              onSelectEncryptedNodeOnMap={(nodeId) => {
                onSelectEncryptedNodeOnMap(nodeId);
                onClose();
              }}
            />
          )}

          {activeTab === 'film' && (
            <FilmScenarioView
              locale={locale}
              events={events}
              probabilities={probabilities}
              onSelectEventOnMap={(id) => {
                onSelectEventOnMap(id);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
