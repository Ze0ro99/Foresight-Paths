'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Globe2, Layers, Compass, Network } from 'lucide-react';
import {
  ForecastBranch,
  GeodesicArc,
  LiveEvent,
  MathTrajectoryMetrics,
  PlatformImpactSummary,
  PlatformLayerId,
} from '@/lib/types';
import {
  PLATFORM_LAYER_META,
  SCENARIO_META,
  THREAT_MECHANISM_META,
} from '@/lib/trajectory-engine';

interface GeoCoordinatesRadarProps {
  events: LiveEvent[];
  geodesicArcs: GeodesicArc[];
  platformMatrix: PlatformImpactSummary[];
  forecasts: ForecastBranch[];
  mathMetrics: MathTrajectoryMetrics;
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

const MAP_W = 1000;
const MAP_H = 480;

function projectEquirectangular(lat: number, lng: number): { x: number; y: number } {
  const clampedLat = Math.max(-82, Math.min(82, lat));
  const clampedLng = Math.max(-180, Math.min(180, lng));
  return {
    x: Number((((clampedLng + 180) / 360) * MAP_W).toFixed(2)),
    y: Number((((90 - clampedLat) / 180) * MAP_H).toFixed(2)),
  };
}

function buildGeodesicCurve(
  from: { x: number; y: number },
  to: { x: number; y: number },
  index = 0
): { d: string; midX: number; midY: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  const stagger = index % 2 === 0 ? 0 : 28;
  const archOffset = Math.min(115, Math.max(24, dist * 0.24) + stagger);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - archOffset;
  return {
    d: `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`,
    midX,
    midY: (from.y + to.y) / 2 - archOffset * 0.56,
  };
}

// Clean equirectangular continental silhouettes (1000x480 coordinate space)
const CONTINENT_PATHS: { id: string; d: string }[] = [
  {
    id: 'north-america',
    d: 'M 78 72 L 155 58 L 240 62 L 295 82 L 325 112 L 295 142 L 285 168 L 265 190 L 245 212 L 222 222 L 205 205 L 185 192 L 160 175 L 135 142 L 96 115 Z',
  },
  {
    id: 'greenland',
    d: 'M 335 32 L 392 26 L 418 48 L 385 78 L 348 72 Z',
  },
  {
    id: 'south-america',
    d: 'M 262 230 L 315 232 L 368 258 L 392 292 L 365 342 L 332 392 L 308 426 L 292 418 L 285 362 L 272 308 L 252 268 Z',
  },
  {
    id: 'europe',
    d: 'M 465 72 L 520 58 L 575 64 L 592 98 L 568 128 L 542 135 L 512 138 L 486 132 L 468 112 Z',
  },
  {
    id: 'africa',
    d: 'M 472 156 L 535 152 L 582 175 L 615 205 L 622 245 L 598 292 L 574 352 L 545 362 L 520 318 L 508 268 L 478 242 L 458 205 Z',
  },
  {
    id: 'asia',
    d: 'M 588 64 L 690 54 L 820 58 L 912 78 L 935 112 L 892 142 L 855 162 L 828 195 L 785 212 L 745 224 L 710 212 L 668 208 L 628 192 L 595 160 L 582 115 Z',
  },
  {
    id: 'maritime-se-asia',
    d: 'M 768 232 L 802 228 L 822 246 L 788 254 Z M 835 236 L 868 238 L 872 255 L 838 252 Z',
  },
  {
    id: 'australia',
    d: 'M 808 296 L 875 288 L 916 312 L 908 358 L 856 368 L 812 346 Z',
  },
];

export default function GeoCoordinatesRadar({
  events,
  geodesicArcs,
  platformMatrix,
  forecasts,
  mathMetrics,
  selectedEventId,
  onSelectEvent,
}: GeoCoordinatesRadarProps) {
  const [activeLayerFilter, setActiveLayerFilter] =
    useState<PlatformLayerId | 'all'>('all');

  const filteredEvents = useMemo(() => {
    if (activeLayerFilter === 'all') return events;
    return events.filter((e) => e.platformLayer === activeLayerFilter);
  }, [events, activeLayerFilter]);

  const lastEvent = events[events.length - 1] ?? null;

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? lastEvent,
    [events, selectedEventId, lastEvent]
  );

  // Compute true map coordinates + non-overlapping label anchor positions for nearby hubs
  const positionedPins = useMemo(() => {
    const placed: {
      event: LiveEvent;
      trueX: number;
      trueY: number;
      labelX: number;
      labelY: number;
      offset: boolean;
    }[] = [];

    const candidateOffsets: [number, number][] = [
      [0, -24],
      [62, 0],
      [-62, 0],
      [0, 24],
      [58, -22],
      [-58, 22],
      [58, 22],
      [-58, -22],
    ];

    for (const ev of filteredEvents) {
      const pt = projectEquirectangular(ev.coordinates.lat, ev.coordinates.lng);
      let lx = pt.x;
      let ly = pt.y;
      let usedOffset = false;

      const overlaps = (cx: number, cy: number) =>
        placed.some(
          (p) => Math.abs(p.labelX - cx) < 92 && Math.abs(p.labelY - cy) < 26
        );

      if (overlaps(lx, ly)) {
        for (const [dx, dy] of candidateOffsets) {
          const tx = Math.max(58, Math.min(MAP_W - 58, pt.x + dx));
          const ty = Math.max(22, Math.min(MAP_H - 22, pt.y + dy));
          if (!overlaps(tx, ty)) {
            lx = tx;
            ly = ty;
            usedOffset = true;
            break;
          }
        }
      }

      placed.push({
        event: ev,
        trueX: pt.x,
        trueY: pt.y,
        labelX: lx,
        labelY: ly,
        offset: usedOffset,
      });
    }

    return placed;
  }, [filteredEvents]);

  return (
    <section
      data-testid="geo-coordinates-radar"
      aria-label="رادار الإحداثيات الجغرافية ومصفوفة المنصات"
      className="scroll-mt-20 rounded-lg border border-[#2B2856] bg-[#101124]"
    >
      {/* Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2B2856] px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <Globe2 className="h-4 w-4 text-[#C084FC]" aria-hidden="true" />
          <h2 className="text-base font-bold text-white">
            رادار الإحداثيات الكروية والانتشار عبر المنصات
          </h2>
          <span className="text-xs text-[#A5B4FC] tabular-nums">
            إجمالي المدى الكروي:{' '}
            <span className="font-latin-math font-bold text-[#FDA4AF]">
              {mathMetrics.totalGeodesicSpanKm.toLocaleString('en-US')} km
            </span>
          </span>
        </div>

        {/* Platform Layer Quick Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveLayerFilter('all')}
            className={`whitespace-nowrap shrink-0 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              activeLayerFilter === 'all'
                ? 'bg-[#7C3AED] text-white'
                : 'text-[#A5B4FC] hover:bg-[#191B38] hover:text-white'
            }`}
          >
            كل المنصات ({events.length})
          </button>
          {platformMatrix.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveLayerFilter(layer.id)}
              className={`whitespace-nowrap shrink-0 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                activeLayerFilter === layer.id
                  ? 'bg-[#DC2626] text-white'
                  : 'text-[#A5B4FC] hover:bg-[#191B38] hover:text-white'
              }`}
            >
              {PLATFORM_LAYER_META[layer.id].shortLabel} ({layer.eventCount})
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid: Equirectangular Geodesic Map (7 cols) + 5-Layer Platform Matrix (5 cols) */}
      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-12">
        {/* Left/Right in RTL: World Geodesic Map */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div
            dir="ltr"
            className="relative w-full overflow-hidden rounded-md border border-[#2B2856] bg-[#07070B]"
          >
            <div className="relative aspect-[1000/480] w-full">
              <svg
                viewBox={`0 0 ${MAP_W} ${MAP_H}`}
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {/* Latitude & Longitude Graticule */}
                {[-60, -30, 0, 30, 60].map((lat) => {
                  const y = ((90 - lat) / 180) * MAP_H;
                  return (
                    <line
                      key={`lat-${lat}`}
                      x1="0"
                      y1={y}
                      x2={MAP_W}
                      y2={y}
                      stroke={lat === 0 ? '#312E81' : '#161835'}
                      strokeWidth={lat === 0 ? 1.1 : 0.7}
                      strokeDasharray={lat === 0 ? '6 4' : undefined}
                    />
                  );
                })}
                {[-120, -60, 0, 60, 120].map((lng) => {
                  const x = ((lng + 180) / 360) * MAP_W;
                  return (
                    <line
                      key={`lng-${lng}`}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2={MAP_H}
                      stroke={lng === 0 ? '#312E81' : '#161835'}
                      strokeWidth={lng === 0 ? 1.1 : 0.7}
                      strokeDasharray={lng === 0 ? '6 4' : undefined}
                    />
                  );
                })}

                {/* Continental Silhouettes */}
                {CONTINENT_PATHS.map((c) => (
                  <path
                    key={c.id}
                    d={c.d}
                    fill="#121430"
                    stroke="#2B2856"
                    strokeWidth="1.2"
                  />
                ))}

                {/* Geodesic Propagation Arcs between Live Events */}
                {geodesicArcs.map((arc, idx) => {
                  const p1 = projectEquirectangular(
                    arc.fromCoords.lat,
                    arc.fromCoords.lng
                  );
                  const p2 = projectEquirectangular(
                    arc.toCoords.lat,
                    arc.toCoords.lng
                  );
                  const curve = buildGeodesicCurve(p1, p2, idx);
                  return (
                    <g key={arc.id}>
                      <motion.path
                        d={curve.d}
                        fill="none"
                        stroke={arc.highlighted ? '#E11D48' : '#7C3AED'}
                        strokeWidth={arc.highlighted ? 2.4 : 1.5}
                        initial={{ pathLength: 0.15, opacity: 0.4 }}
                        animate={{
                          pathLength: 1,
                          opacity: arc.highlighted ? 1 : 0.75,
                        }}
                        transition={{ duration: 0.65, ease: 'easeOut' }}
                      />
                      <text
                        x={curve.midX}
                        y={curve.midY - 4}
                        textAnchor="middle"
                        fill={arc.highlighted ? '#FDA4AF' : '#C084FC'}
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                      >
                        {arc.distanceKm}km
                      </text>
                    </g>
                  );
                })}

                {/* Forecast Projected Target Vectors from Latest Event */}
                {lastEvent &&
                  forecasts.slice(0, 2).map((fc) => {
                    const pStart = projectEquirectangular(
                      lastEvent.coordinates.lat,
                      lastEvent.coordinates.lng
                    );
                    const pEnd = projectEquirectangular(
                      fc.projectedCoords.lat,
                      fc.projectedCoords.lng
                    );
                    const curve = buildGeodesicCurve(pStart, pEnd);
                    return (
                      <path
                        key={`fc-arc-${fc.id}`}
                        d={curve.d}
                        fill="none"
                        stroke={SCENARIO_META[fc.targetScenario].color}
                        strokeWidth="1.5"
                        strokeDasharray="5 4"
                        strokeOpacity="0.85"
                      />
                    );
                  })}

                {/* True coordinate anchor dots & leader lines for dispersed pins */}
                {positionedPins.map((pin) => {
                  const isSelected = pin.event.id === selectedEventId;
                  return (
                    <g key={`anchor-${pin.event.id}`}>
                      {pin.offset && (
                        <line
                          x1={pin.trueX}
                          y1={pin.trueY}
                          x2={pin.labelX}
                          y2={pin.labelY}
                          stroke={isSelected ? '#E11D48' : '#6366F1'}
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}
                      <circle
                        cx={pin.trueX}
                        cy={pin.trueY}
                        r={isSelected ? 4.2 : 3}
                        fill={isSelected ? '#E11D48' : '#C084FC'}
                        stroke="#07070B"
                        strokeWidth="1.2"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Accessible Interactive Coordinate Pins for Live Events */}
              {positionedPins.map(({ event: ev, labelX, labelY }) => {
                const leftPct = (labelX / MAP_W) * 100;
                const topPct = (labelY / MAP_H) * 100;
                const isSelected = ev.id === selectedEventId;

                return (
                  <button
                    key={ev.id}
                    type="button"
                    dir="rtl"
                    onClick={() => onSelectEvent(ev.id)}
                    aria-label={`إحداثية الحدث ${ev.sequence}: ${ev.coordinates.city} (${ev.coordinates.lat.toFixed(2)}, ${ev.coordinates.lng.toFixed(2)})`}
                    aria-pressed={isSelected}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`group absolute z-10 flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48] ${
                      isSelected
                        ? 'z-20 border-[#E11D48] bg-[#2D0A18] text-white shadow-lg'
                        : 'border-[#6366F1]/70 bg-[#101124]/95 text-[#E0E7FF] hover:border-[#C084FC]'
                    }`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        isSelected ? 'bg-[#E11D48]' : 'bg-[#C084FC]'
                      }`}
                    />
                    <span className="whitespace-nowrap">
                      #{ev.sequence} {ev.coordinates.city}
                    </span>
                  </button>
                );
              })}

              {/* Forecast Target Coordinate Markers */}
              {forecasts.slice(0, 2).map((fc) => {
                const pt = projectEquirectangular(
                  fc.projectedCoords.lat,
                  fc.projectedCoords.lng
                );
                const leftPct = (pt.x / MAP_W) * 100;
                const topPct = (pt.y / MAP_H) * 100;
                const scMeta = SCENARIO_META[fc.targetScenario];
                return (
                  <div
                    key={`fc-pin-${fc.id}`}
                    dir="rtl"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      transform: 'translate(-50%, -50%)',
                      borderColor: scMeta.color,
                    }}
                    className="pointer-events-none absolute z-10 rounded border border-dashed bg-[#07070B]/90 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  >
                    <span style={{ color: scMeta.color }}>{fc.horizonLabel}</span>{' '}
                    <span>{fc.projectedCoords.city}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Selected Coordinate Telemetry Strip */}
          {selectedEvent && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#1E1B4B] bg-[#0C0D16] px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2 text-white">
                <Compass className="h-4 w-4 text-[#E11D48]" aria-hidden="true" />
                <span className="font-bold">
                  العقدة المختارة #{selectedEvent.sequence}: {selectedEvent.coordinates.city}
                </span>
                <span className="text-[#A5B4FC]">
                  ({PLATFORM_LAYER_META[selectedEvent.platformLayer].shortLabel})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 font-latin-math text-[11px] text-[#C084FC]">
                <span>
                  LAT {selectedEvent.coordinates.lat.toFixed(4)}° · LNG{' '}
                  {selectedEvent.coordinates.lng.toFixed(4)}°
                </span>
                <span className="text-[#A5B4FC]">
                  {selectedEvent.coordinates.regionCode} · {selectedEvent.coordinates.asnOrHub}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right/Left in RTL: 5-Layer Platform Stress Matrix */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3 rounded-md border border-[#1E1B4B] bg-[#0C0D16] p-4">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#1E1B4B] pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Layers className="h-4 w-4 text-[#C084FC]" aria-hidden="true" />
                <span>مصفوفة إجهاد المنصات الخمس (Platform Layers)</span>
              </div>
              <span className="font-latin-math text-[11px] text-[#A5B4FC]">
                Haversine · π
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {platformMatrix.map((layer) => {
                const threat = THREAT_MECHANISM_META[layer.dominantThreat];
                const isSelectedLayer = activeLayerFilter === layer.id;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() =>
                      setActiveLayerFilter((prev) =>
                        prev === layer.id ? 'all' : layer.id
                      )
                    }
                    className={`w-full rounded border p-2.5 text-right transition-colors ${
                      isSelectedLayer
                        ? 'border-[#E11D48] bg-[#1F0B18]'
                        : 'border-[#1E1B4B] bg-[#121329] hover:border-[#7C3AED]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-white">
                        {layer.label}
                      </span>
                      <span className="font-latin-math font-bold text-[#FDA4AF]">
                        {layer.pressurePct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-sm bg-[#07070B]">
                      <div
                        className="h-full rounded-sm transition-all duration-500"
                        style={{
                          width: `${layer.pressurePct}%`,
                          backgroundColor:
                            layer.pressurePct >= 70
                              ? '#E11D48'
                              : layer.pressurePct >= 45
                              ? '#9333EA'
                              : '#6366F1',
                        }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-[#A5B4FC]">
                      <span>آلية: {threat.shortLabel}</span>
                      <span className="tabular-nums">
                        {layer.eventCount} أحداث نشطة
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#1E1B4B] pt-2.5 text-[11px] leading-relaxed text-[#CBD5E1]">
            <div className="flex items-center gap-1.5 font-semibold text-[#C084FC]">
              <Network className="h-3.5 w-3.5" aria-hidden="true" />
              <span>اقتران المسافة الكروية بباي (π/180)</span>
            </div>
            <p className="mt-1 text-[#A5B4FC]">
              تُحسب كل قفزة جغرافية عبر قانون هافرسين الكروي وتُربط بسرعة الانتقال بين المنصات السحابية والمالية ومنصات السرديات.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
