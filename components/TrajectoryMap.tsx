'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  Filter,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import {
  AppLocale,
  ForecastBranch,
  LiveEvent,
  MathTrajectoryMetrics,
  ResearchTrack,
  ScenarioProbabilities,
  TrajectoryEdge,
  TrajectoryGraph,
  TrajectoryNode,
} from '@/lib/types';
import { SCENARIO_META } from '@/lib/trajectory-engine';
import {
  getScenarioCopy,
  getThreatCopy,
  getTrackCopy,
} from '@/lib/i18n';

interface TrajectoryMapProps {
  locale: AppLocale;
  events: LiveEvent[];
  graph: TrajectoryGraph;
  probabilities: ScenarioProbabilities;
  mathMetrics: MathTrajectoryMetrics;
  forecasts: ForecastBranch[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  isStreaming: boolean;
  onToggleStream: () => void;
  onStepForward: () => void;
  onResetTimeline: () => void;
  onSimulateAiEvent: () => void;
  isSimulatingAi: boolean;
  hasMoreSeedEvents: boolean;
}

const LANE_BANDS: {
  track: ResearchTrack;
  y: number;
  accent: string;
}[] = [
  { track: 'osint', y: 108, accent: '#6366F1' },
  { track: 'ach', y: 202, accent: '#E11D48' },
  { track: 'semiotics', y: 296, accent: '#9333EA' },
  { track: 'contagion', y: 390, accent: '#10B981' },
];

const TRAJECTORY_UI: Record<
  AppLocale,
  {
    sectionAria: string;
    heading: string;
    observedLabel: string;
    piHarmonicLabel: string;
    cascadeRiskLabel: string;
    pauseStream: string;
    startStream: string;
    nextEvent: string;
    aiBusy: string;
    aiIdle: string;
    resetAria: string;
    resetShort: string;
    filterLabel: string;
    allTracks: string;
    edgeLegend: string;
    colTracks: string;
    colEvents: string;
    colSpof: string;
    colScenarios: string;
    colForecast: string;
    eventAriaPrefix: string;
    forecastTag: string;
    dominantTag: string;
    altTag: string;
    predictedHeading: string;
    threatLabel: string;
    mathHeading: string;
    weightsHeading: string;
  }
> = {
  ar: {
    sectionAria: 'خريطة المسارات اللحظية وآليات التهديدات',
    heading: 'خريطة المسارات اللحظية والتنبؤ بالتهديدات',
    observedLabel: 'أحداث مرصودة',
    piHarmonicLabel: 'معامل π التوافقي:',
    cascadeRiskLabel: 'خطر التصعيد:',
    pauseStream: 'إيقاف التدفق التنبؤي',
    startStream: 'تشغيل التدفق اللحظي',
    nextEvent: 'الحدث التالي',
    aiBusy: 'جارٍ الاستنتاج والتنبؤ...',
    aiIdle: 'استنتاج المسار القادم (Gemini مجاني)',
    resetAria: 'إعادة ضبط التسلسل الزمني للبدء',
    resetShort: 'إعادة',
    filterLabel: 'تصفية المسار:',
    allTracks: 'جميع المسارات',
    edgeLegend: 'سببي متصل (أحمر/نيلي) · عقدة تهديد متقطعة (أرجواني) · أفق التنبؤ القادم (خط متدرج)',
    colTracks: 'المسارات',
    colEvents: 'الأحداث اللحظية المتسلسلة',
    colSpof: 'آليات التهديد (SPOF)',
    colScenarios: 'السيناريوهات الكبرى',
    colForecast: 'التنبؤ القادم (π-Forecast)',
    eventAriaPrefix: 'حدث',
    forecastTag: 'تنبؤ قادم',
    dominantTag: 'المسار المرجّح',
    altTag: 'مسار بديل',
    predictedHeading: 'التنبؤ بالمسارات القادمة (بحسب تقاطع الخريطتين ومعادلات π)',
    threatLabel: 'آلية التهديد: ',
    mathHeading: 'المعادلات الرياضية التنبؤية (باي 3.14)',
    weightsHeading: 'توزيع أوزان السيناريوهات الثلاثة',
  },
  en: {
    sectionAria: 'Live Trajectory Graph and Threat Mechanisms',
    heading: 'Live Causal Trajectory Graph & Threat Projection',
    observedLabel: 'observed events',
    piHarmonicLabel: 'π-Harmonic:',
    cascadeRiskLabel: 'Cascade Risk:',
    pauseStream: 'Pause Stream',
    startStream: 'Start Live Stream',
    nextEvent: 'Next Event',
    aiBusy: 'Forecasting Trajectory...',
    aiIdle: 'Forecast Next (Free Gemini)',
    resetAria: 'Reset timeline to initial step',
    resetShort: 'Reset',
    filterLabel: 'Filter Track:',
    allTracks: 'All Tracks',
    edgeLegend: 'Causal Arc (Crimson/Indigo) · SPOF Link (Dashed Violet) · Forecast Vector (Gradient)',
    colTracks: 'Tracks',
    colEvents: 'Sequential Live Events',
    colSpof: 'Threat Nodes (SPOF)',
    colScenarios: 'Major Scenarios',
    colForecast: 'Next Forecast (π)',
    eventAriaPrefix: 'Event',
    forecastTag: 'Forecast',
    dominantTag: 'Leading Path',
    altTag: 'Alternative',
    predictedHeading: 'Predicted Next Trajectories (Dual-Map Intersection & π Calculus)',
    threatLabel: 'Threat Mechanism: ',
    mathHeading: 'Predictive Pi Mathematics (3.14)',
    weightsHeading: 'Scenario Probability Distribution',
  },
  fr: {
    sectionAria: 'Graphe des Trajectoires & Mécanismes de Menace',
    heading: 'Graphe Causal des Trajectoires & Projections',
    observedLabel: 'événements observés',
    piHarmonicLabel: 'Harmonique π :',
    cascadeRiskLabel: 'Risque Cascade :',
    pauseStream: 'Pause Flux',
    startStream: 'Démarrer Flux',
    nextEvent: 'Suivant',
    aiBusy: 'Calcul Gemini...',
    aiIdle: 'Prédire la Suite (Gemini Gratuit)',
    resetAria: 'Réinitialiser la chronologie',
    resetShort: 'Réinit.',
    filterLabel: 'Filtrer Voie :',
    allTracks: 'Toutes les Voies',
    edgeLegend: 'Lien causal (Rouge/Indigo) · Nœud SPOF (Violet) · Horizon prévu (Pointillé)',
    colTracks: 'Voies',
    colEvents: 'Événements Séquentiels',
    colSpof: 'Menaces (SPOF)',
    colScenarios: 'Scénarios Majeurs',
    colForecast: 'Prévision (π)',
    eventAriaPrefix: 'Événement',
    forecastTag: 'Prévision',
    dominantTag: 'Dominant',
    altTag: 'Alternatif',
    predictedHeading: 'Prochaines Trajectoires Projetées (Cartes + Équations π)',
    threatLabel: 'Mécanisme : ',
    mathHeading: 'Équations Prédictives Pi (3,14)',
    weightsHeading: 'Répartition des Trois Scénarios',
  },
  id: {
    sectionAria: 'Grafik Lintasan Langsung & Mekanisme Ancaman',
    heading: 'Peta Lintasan Kausal & Proyeksi Ancaman Langsung',
    observedLabel: 'kejadian terpantau',
    piHarmonicLabel: 'Harmonik π:',
    cascadeRiskLabel: 'Risiko Eskalasi:',
    pauseStream: 'Jeda Aliran',
    startStream: 'Mulai Aliran',
    nextEvent: 'Berikutnya',
    aiBusy: 'Memprediksi...',
    aiIdle: 'Prediksi Berikutnya (Gemini Gratis)',
    resetAria: 'Setel ulang garis waktu',
    resetShort: 'Ulang',
    filterLabel: 'Filter Jalur:',
    allTracks: 'Semua Jalur',
    edgeLegend: 'Busur Kausal (Merah/Indigo) · Simpul SPOF (Ungu) · Proyeksi (Garis Putus)',
    colTracks: 'Jalur',
    colEvents: 'Kejadian Berurutan',
    colSpof: 'Ancaman (SPOF)',
    colScenarios: 'Skenario Utama',
    colForecast: 'Proyeksi (π)',
    eventAriaPrefix: 'Kejadian',
    forecastTag: 'Proyeksi',
    dominantTag: 'Jalur Dominan',
    altTag: 'Alternatif',
    predictedHeading: 'Proyeksi Lintasan Berikutnya (Korelasi 2 Peta & Persamaan π)',
    threatLabel: 'Mekanisme Ancaman: ',
    mathHeading: 'Persamaan Prediktif Pi (3.14)',
    weightsHeading: 'Distribusi Bobot Tiga Skenario',
  },
  vi: {
    sectionAria: 'Đồ Thị Quỹ Đạo Trực Tiếp & Cơ Chế Đe Dọa',
    heading: 'Bản Đồ Quỹ Đạo Nhân Quả & Dự Báo Mối Đe Dọa',
    observedLabel: 'sự kiện đã ghi',
    piHarmonicLabel: 'Điều hòa π:',
    cascadeRiskLabel: 'Nguy cơ lan truyền:',
    pauseStream: 'Tạm Dừng',
    startStream: 'Chạy Trực Tiếp',
    nextEvent: 'Tiếp Theo',
    aiBusy: 'Đang suy luận...',
    aiIdle: 'Dự Báo Tiếp (Gemini Miễn Phí)',
    resetAria: 'Đặt lại dòng thời gian ban đầu',
    resetShort: 'Đặt lại',
    filterLabel: 'Lọc Luồng:',
    allTracks: 'Tất Cả Luồng',
    edgeLegend: 'Nhân quả (Đỏ/Chàm) · Nút SPOF (Tím) · Dự báo (Nét đứt)',
    colTracks: 'Luồng',
    colEvents: 'Chuỗi Sự Kiện Thực',
    colSpof: 'Điểm Lỗi (SPOF)',
    colScenarios: 'Kịch Bản Lớn',
    colForecast: 'Dự Báo (π)',
    eventAriaPrefix: 'Sự kiện',
    forecastTag: 'Dự báo',
    dominantTag: 'Chủ Đạo',
    altTag: 'Thay Thế',
    predictedHeading: 'Các Quỹ Đạo Sắp Tới (Bản Đồ Kép & Phương Trình π)',
    threatLabel: 'Cơ chế đe dọa: ',
    mathHeading: 'Phương Trình Dự Báo Pi (3.14)',
    weightsHeading: 'Phân Bổ Tỷ Trọng Ba Kịch Bản',
  },
};

const SVG_W = 1360;
const SVG_H = 500;

function getNodeHalfWidth(kind: TrajectoryNode['kind']): number {
  if (kind === 'event') return 66;
  if (kind === 'spof') return 72;
  if (kind === 'scenario') return 93;
  return 90;
}

function buildCubicPath(from: TrajectoryNode, to: TrajectoryNode): string {
  const startX = from.x + getNodeHalfWidth(from.kind);
  const endX = to.x - getNodeHalfWidth(to.kind);
  const dx = Math.max(24, Math.abs(endX - startX));
  const c1x = startX + dx * 0.45;
  const c2x = endX - dx * 0.45;
  return `M ${startX} ${from.y} C ${c1x} ${from.y}, ${c2x} ${to.y}, ${endX} ${to.y}`;
}

export default function TrajectoryMap({
  locale,
  events,
  graph,
  probabilities,
  mathMetrics,
  forecasts,
  selectedEventId,
  onSelectEvent,
  isStreaming,
  onToggleStream,
  onStepForward,
  onResetTimeline,
  onSimulateAiEvent,
  isSimulatingAi,
  hasMoreSeedEvents,
}: TrajectoryMapProps) {
  const ui = TRAJECTORY_UI[locale];
  const [trackFilter, setTrackFilter] = useState<ResearchTrack | 'all'>('all');
  const nodeDir = locale === 'ar' ? 'rtl' : 'ltr';

  const nodeById = useMemo(() => {
    const map = new Map<string, TrajectoryNode>();
    for (const n of graph.nodes) {
      map.set(n.id, n);
    }
    return map;
  }, [graph.nodes]);

  const visibleNodes = useMemo(() => {
    if (trackFilter === 'all') return graph.nodes;
    return graph.nodes.filter(
      (n) => n.kind !== 'event' || n.track === trackFilter
    );
  }, [graph.nodes, trackFilter]);

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes]
  );

  const visibleEdges = useMemo(
    () =>
      graph.edges.filter(
        (e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)
      ),
    [graph.edges, visibleNodeIds]
  );

  const edgeStroke = (edge: TrajectoryEdge) => {
    if (edge.kind === 'causal') {
      return edge.highlighted ? '#E11D48' : '#6366F1';
    }
    if (edge.kind === 'spof_link') {
      return edge.highlighted ? '#C084FC' : '#4338CA';
    }
    if (edge.kind === 'forecast_vector') {
      return edge.highlighted ? '#DC2626' : '#9333EA';
    }
    return edge.highlighted ? '#10B981' : '#312E81';
  };

  return (
    <section
      aria-label={ui.sectionAria}
      className="rounded-lg border border-[#2B2856] bg-[#101124]"
    >
      {/* Workspace Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2B2856] px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-bold text-white">{ui.heading}</h2>
          <span className="text-xs text-[#A5B4FC] tabular-nums">
            {events.length} {ui.observedLabel} · {ui.piHarmonicLabel}{' '}
            <span className="font-latin-math text-[#C084FC]">
              {mathMetrics.piPhaseHarmonic}
            </span>{' '}
            · {ui.cascadeRiskLabel}{' '}
            <span className="font-latin-math text-[#FB7185]">
              {mathMetrics.nextCascadeRiskPct}%
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleStream}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isStreaming
                ? 'border-[#E11D48] bg-[#E11D48]/15 text-[#FDA4AF]'
                : 'border-[#312E81] bg-[#16193B] text-white hover:border-[#7C3AED]'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{ui.pauseStream}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{ui.startStream}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onStepForward}
            disabled={!hasMoreSeedEvents}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-[#312E81] bg-[#0C0D16] px-3 py-1.5 text-xs font-medium text-[#E0E7FF] hover:border-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{ui.nextEvent}</span>
          </button>

          <button
            type="button"
            onClick={onSimulateAiEvent}
            disabled={isSimulatingAi}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-[#9333EA] bg-[#7C3AED] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isSimulatingAi ? ui.aiBusy : ui.aiIdle}</span>
          </button>

          <button
            type="button"
            onClick={onResetTimeline}
            aria-label={ui.resetAria}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-[#2B2856] bg-[#0C0D16] px-2.5 py-1.5 text-xs font-medium text-[#A5B4FC] hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{ui.resetShort}</span>
          </button>
        </div>
      </div>

      {/* Track Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E1B4B] bg-[#0C0D16] px-5 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#A5B4FC] me-2">
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            {ui.filterLabel}
          </span>
          <button
            type="button"
            onClick={() => setTrackFilter('all')}
            className={`whitespace-nowrap shrink-0 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              trackFilter === 'all'
                ? 'bg-[#7C3AED] text-white'
                : 'text-[#A5B4FC] hover:bg-[#191B38] hover:text-white'
            }`}
          >
            {ui.allTracks}
          </button>
          {LANE_BANDS.map((lane) => (
            <button
              key={lane.track}
              type="button"
              onClick={() => setTrackFilter(lane.track)}
              className={`whitespace-nowrap shrink-0 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                trackFilter === lane.track
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-[#A5B4FC] hover:bg-[#191B38] hover:text-white'
              }`}
            >
              {getTrackCopy(lane.track, locale)}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#A5B4FC] tabular-nums">{ui.edgeLegend}</div>
      </div>

      {/* Interactive SVG + Accessible HTML Button Overlay Canvas */}
      <div className="p-4 sm:p-5">
        <div
          dir="ltr"
          data-testid="trajectory-map"
          className="relative w-full overflow-x-auto rounded border border-[#2B2856] bg-[#07070B]"
        >
          <div className="relative min-w-[1100px] aspect-[1360/500] w-full">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="arrow-causal"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#E11D48" />
                </marker>
                <marker
                  id="arrow-indigo"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366F1" />
                </marker>
                <marker
                  id="arrow-forecast"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#C084FC" />
                </marker>
              </defs>

              <line x1="178" y1="24" x2="178" y2={SVG_H - 20} stroke="#1E1B4B" />
              <line
                x1="686"
                y1="24"
                x2="686"
                y2={SVG_H - 20}
                stroke="#2B2856"
                strokeDasharray="4 4"
              />
              <line
                x1="858"
                y1="24"
                x2="858"
                y2={SVG_H - 20}
                stroke="#2B2856"
                strokeDasharray="4 4"
              />
              <line
                x1="1085"
                y1="24"
                x2="1085"
                y2={SVG_H - 20}
                stroke="#7C3AED"
                strokeOpacity="0.55"
                strokeDasharray="4 4"
              />

              {LANE_BANDS.map((lane) => (
                <g key={lane.track}>
                  <line
                    x1="178"
                    y1={lane.y}
                    x2="676"
                    y2={lane.y}
                    stroke="#191B38"
                    strokeWidth="1"
                  />
                  <rect
                    x="14"
                    y={lane.y - 12}
                    width="4"
                    height="24"
                    rx="2"
                    fill={lane.accent}
                  />
                </g>
              ))}

              {visibleEdges.map((edge) => {
                const from = nodeById.get(edge.from);
                const to = nodeById.get(edge.to);
                if (!from || !to) return null;
                const d = buildCubicPath(from, to);
                const stroke = edgeStroke(edge);
                const isCausal = edge.kind === 'causal';
                const isForecast = edge.kind === 'forecast_vector';
                const strokeWidth = edge.highlighted
                  ? 2.8
                  : isCausal || isForecast
                  ? 2
                  : 1.4;

                return (
                  <motion.path
                    key={edge.id}
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={
                      edge.kind === 'spof_link'
                        ? '5 4'
                        : isForecast
                        ? '6 3'
                        : edge.kind === 'scenario_projection'
                        ? '2 3'
                        : undefined
                    }
                    markerEnd={
                      isCausal
                        ? edge.highlighted
                          ? 'url(#arrow-causal)'
                          : 'url(#arrow-indigo)'
                        : isForecast
                        ? 'url(#arrow-forecast)'
                        : undefined
                    }
                    initial={{ pathLength: 0.1, opacity: 0.35 }}
                    animate={{
                      pathLength: 1,
                      opacity: edge.highlighted ? 1 : 0.78,
                    }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                  />
                );
              })}
            </svg>

            <div className="pointer-events-none absolute inset-x-0 top-2 grid grid-cols-12 px-4 text-[11px] font-semibold text-[#A5B4FC]">
              <span className="col-span-2 text-start">{ui.colTracks}</span>
              <span className="col-span-4 text-center">{ui.colEvents}</span>
              <span className="col-span-2 text-center">{ui.colSpof}</span>
              <span className="col-span-2 text-center">{ui.colScenarios}</span>
              <span className="col-span-2 text-center text-[#C084FC]">
                {ui.colForecast}
              </span>
            </div>

            {LANE_BANDS.map((lane) => (
              <div
                key={`label-${lane.track}`}
                dir={nodeDir}
                style={{
                  top: `${(lane.y / SVG_H) * 100}%`,
                  left: '22px',
                  width: '146px',
                  transform: 'translateY(-50%)',
                }}
                className="pointer-events-none absolute text-start text-[11px] font-semibold text-[#C7D2FE]"
              >
                {getTrackCopy(lane.track, locale)}
              </div>
            ))}

            {visibleNodes.map((node) => {
              const leftPct = (node.x / SVG_W) * 100;
              const topPct = (node.y / SVG_H) * 100;

              if (node.kind === 'event') {
                const isSelected = node.id === selectedEventId;
                return (
                  <button
                    key={node.id}
                    type="button"
                    dir={nodeDir}
                    onClick={() => onSelectEvent(node.id)}
                    aria-label={`${ui.eventAriaPrefix} ${node.sequence}: ${node.label}`}
                    aria-pressed={isSelected}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-10 w-[130px] rounded-md border px-2.5 py-1.5 text-start transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48] ${
                      isSelected
                        ? 'border-[#E11D48] bg-[#2D0A18] text-white shadow-lg'
                        : 'border-[#312E81] bg-[#121329] text-[#F3F4F6] hover:border-[#9333EA]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono-tabular text-[#A5B4FC]">
                      <span>#{node.sequence}</span>
                      <span>{node.sublabel}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs font-semibold">
                      {node.label}
                    </div>
                  </button>
                );
              }

              if (node.kind === 'spof') {
                return (
                  <div
                    key={node.id}
                    dir={nodeDir}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-10 w-[142px] rounded border px-2.5 py-1.5 text-start ${
                      node.active
                        ? 'border-[#9333EA] bg-[#2E1065] text-white'
                        : 'border-[#312E81] bg-[#16193B] text-[#E0E7FF]'
                    }`}
                  >
                    <div className="truncate text-[10px] font-semibold text-[#C084FC]">
                      {node.sublabel}
                    </div>
                    <div className="mt-0.5 truncate text-xs font-semibold">
                      {node.label}
                    </div>
                  </div>
                );
              }

              if (node.kind === 'forecast') {
                const isTopForecast = node.active;
                return (
                  <div
                    key={node.id}
                    dir={nodeDir}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-10 w-[180px] rounded-md border border-dashed px-2.5 py-2 text-start ${
                      isTopForecast
                        ? 'border-[#E11D48] bg-[#1F0B18] text-white'
                        : 'border-[#7C3AED] bg-[#14102B] text-[#E0E7FF]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-semibold whitespace-nowrap">
                      <span className="text-[#C084FC]">{ui.forecastTag}</span>
                      <span className="font-mono-tabular text-[#FDA4AF]">
                        {node.sublabel}
                      </span>
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug">
                      {node.label}
                    </div>
                  </div>
                );
              }

              const scMeta = node.scenarioId
                ? SCENARIO_META[node.scenarioId]
                : null;
              const isDominant = node.active;
              return (
                <div
                  key={node.id}
                  dir={nodeDir}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: 'translate(-50%, -50%)',
                    borderColor: isDominant && scMeta ? scMeta.color : '#312E81',
                    backgroundColor:
                      isDominant && scMeta ? scMeta.bgTint : '#121329',
                  }}
                  className="absolute z-10 w-[186px] rounded-md border-2 px-3 py-2 text-start transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] font-semibold whitespace-nowrap">
                    <span style={{ color: scMeta?.color }}>
                      {isDominant ? ui.dominantTag : ui.altTag}
                    </span>
                    <span className="font-mono-tabular text-white">
                      {node.sublabel}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-white">
                    {node.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Predicted Next Trajectories + Threat Mechanisms + Pi Equations Summary */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-md border border-[#2B2856] bg-[#0C0D16] p-4">
            <div className="flex items-center justify-between gap-2 border-b border-[#1E1B4B] pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <TrendingUp className="h-4 w-4 text-[#C084FC]" aria-hidden="true" />
                <span>{ui.predictedHeading}</span>
              </div>
              <span className="font-latin-math text-xs text-[#C084FC]">
                π = {mathMetrics.piConstant}
              </span>
            </div>
            <div className="mt-3 space-y-2.5">
              {forecasts.map((fc) => {
                const threat = getThreatCopy(fc.threatMechanism, locale);
                const scMeta = SCENARIO_META[fc.targetScenario];
                const scCopy = getScenarioCopy(fc.targetScenario, locale);
                return (
                  <div
                    key={fc.id}
                    className="rounded border border-[#1E1B4B] bg-[#121329] p-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-white">{fc.title}</span>
                      <span
                        className="font-mono-tabular font-bold"
                        style={{ color: scMeta.color }}
                      >
                        {fc.horizonLabel} · {fc.probability}% ({scCopy.title})
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A5B4FC]">
                      <span>
                        {ui.threatLabel}
                        <span className="text-[#FDA4AF]">{threat.label}</span>
                      </span>
                      <span className="font-latin-math text-[#C084FC]">
                        {fc.projectedCoords.city} ({fc.projectedCoords.lat.toFixed(2)}°,{' '}
                        {fc.projectedCoords.lng.toFixed(2)}°)
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#CBD5E1]">
                      {fc.mapLinkSummary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-md border border-[#2B2856] bg-[#0C0D16] p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 border-b border-[#1E1B4B] pb-2.5 text-xs font-bold text-white">
                <ShieldAlert className="h-4 w-4 text-[#E11D48]" aria-hidden="true" />
                <span>{ui.mathHeading}</span>
              </div>
              <div className="mt-3 space-y-2">
                {mathMetrics.equationSteps.map((eq) => (
                  <div
                    key={eq.id}
                    className="rounded border border-[#1E1B4B] bg-[#121329] p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#E0E7FF]">
                        {eq.name}
                      </span>
                      <span className="font-latin-math font-bold text-[#C084FC]">
                        {eq.computedValue} {eq.unit}
                      </span>
                    </div>
                    <div
                      dir="ltr"
                      className="mt-1 font-latin-math text-[11px] text-[#A5B4FC]"
                    >
                      {eq.formula}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1E1B4B] pt-3">
              <div className="text-[11px] font-semibold text-[#A5B4FC]">
                {ui.weightsHeading}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                {(['adaptation', 'fragmentation', 'fragility'] as const).map(
                  (id) => (
                    <div
                      key={id}
                      className="rounded border border-[#1E1B4B] bg-[#121329] px-2 py-1.5"
                    >
                      <div className="text-[10px] text-[#CBD5E1]">
                        {getScenarioCopy(id, locale).title}
                      </div>
                      <div
                        className="mt-0.5 font-mono-tabular text-sm font-bold"
                        style={{ color: SCENARIO_META[id].color }}
                      >
                        {probabilities[id]}%
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
