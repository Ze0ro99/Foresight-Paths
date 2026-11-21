'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Eye, Layers, Sigma, Link2 } from 'lucide-react';
import { SEMIOTIC_MARKERS } from '@/lib/seed-data';
import { SCENARIO_META } from '@/lib/trajectory-engine';
import {
  getReliabilityCopy,
  getScenarioCopy,
  getThreatCopy,
  localizeMarker,
} from '@/lib/i18n';
import {
  AppLocale,
  ForecastBranch,
  LiveEvent,
  MathTrajectoryMetrics,
  ReliabilityGrade,
} from '@/lib/types';
import DecoderLabSection from './DecoderLabSection';

interface SemioticsOSINTViewProps {
  locale: AppLocale;
  events: LiveEvent[];
  mathMetrics: MathTrajectoryMetrics;
  forecasts: ForecastBranch[];
}

const SEMIOTIC_UI: Record<
  AppLocale,
  {
    sectionTitle: string;
    sectionSubtitle: string;
    map1Title: string;
    map1Tag: string;
    map1Alt: string;
    map1Fallback: string;
    map2Title: string;
    map2Tag: string;
    map2Alt: string;
    map2Fallback: string;
    observedNodes: string;
    mapBadgeEco: string;
    mapBadgeQ: string;
    visualLabel: string;
    meaningLabel: string;
    threatLabel: string;
    pairedHeading: string;
    analyzeSymbolAria: string;
    analyzeNodeAria: string;
    piTitlePrefix: string;
    piSubtitle: string;
    tNextHeading: string;
    reliabilityHeading: string;
    eventsRecordedSuffix: string;
  }
> = {
  ar: {
    sectionTitle: 'التحليل السيميائي المتقاطع: خريطة المجلة (2027) × خريطة QAnon المتشعبة',
    sectionSubtitle:
      'ربط تفاعلي بين الرموز الاقتصادية والجيوسياسية في غلاف المجلة وبين عقد التشعب السردي في خريطة QAnon ضمن نموذج سيناريو الفيلم وتحليل الأنماط التضليلية.',
    map1Title: 'الخريطة 1: غلاف المجلة الاستشرافي (2027)',
    map1Tag: 'المؤشرات الكلية',
    map1Alt: 'غلاف مجلة The Economist The World Ahead 2027 مع الدائرة الحمراء حول رمز ΠΣV',
    map1Fallback: 'خريطة المجلة 2027 (ΠΣV والشبكات)',
    map2Title: 'الخريطة 2: خريطة QAnon وتشعب السرديات',
    map2Tag: 'طوبولوجيا العقد',
    map2Alt: 'خريطة تشعب السرديات والعقد المترابطة (QAnon / Great Awakening Mind-Map)',
    map2Fallback: 'خريطة تشعب السرديات QAnon',
    observedNodes: 'العقد المرصودة عبر الخريطتين',
    mapBadgeEco: 'خريطة المجلة',
    mapBadgeQ: 'خريطة QAnon',
    visualLabel: 'العنصر البصري: ',
    meaningLabel: 'التحليل البنيوي والسينمائي: ',
    threatLabel: 'آلية التهديد المرتبطة: ',
    pairedHeading: 'العقدة المقابلة في الخريطة الأخرى:',
    analyzeSymbolAria: 'تحليل الرمز',
    analyzeNodeAria: 'تحليل العقدة',
    piTitlePrefix: 'الآليات الحسابية والمعادلات الرياضية باستخدام باي',
    piSubtitle: 'تُحسب المعادلات لحظياً لقياس تزامن الموجات وتوقع المسارات القادمة في سيناريو الفيلم',
    tNextHeading: 'النتائج المستنتجة: توقع المسارات القادمة (T+Next)',
    reliabilityHeading: 'مصفوفة موثوقية المصادر وتصفية الضوضاء (Source Reliability Matrix)',
    eventsRecordedSuffix: 'أحداث مسجلة',
  },
  en: {
    sectionTitle: 'Dual-Map Cross-Correlation: The Economist 2027 × Branching QAnon Map',
    sectionSubtitle:
      'Interactive correlation linking economic/geopolitical symbols on the 2027 magazine cover with QAnon narrative branching nodes inside the realistic foresight & disinformation model.',
    map1Title: 'Map 1: The World Ahead 2027 Cover',
    map1Tag: 'Macro Indicators',
    map1Alt: 'The Economist The World Ahead 2027 cover highlighting the red circle around ΠΣV',
    map1Fallback: 'Economist 2027 Cover Map (ΠΣV & Grids)',
    map2Title: 'Map 2: QAnon / Great Awakening Branching Map',
    map2Tag: 'Node Topology',
    map2Alt: 'Branching conspiracy narrative mind-map (QAnon / Great Awakening)',
    map2Fallback: 'QAnon Branching Narrative Map',
    observedNodes: 'Detected Nodes Across Both Maps',
    mapBadgeEco: 'Magazine Cover',
    mapBadgeQ: 'QAnon Map',
    visualLabel: 'Visual Element: ',
    meaningLabel: 'Structural & Film Analysis: ',
    threatLabel: 'Linked Threat Mechanism: ',
    pairedHeading: 'Paired Node on Counterpart Map:',
    analyzeSymbolAria: 'Inspect symbol',
    analyzeNodeAria: 'Inspect node',
    piTitlePrefix: 'Pi-Harmonic Calculus & Trajectory Equations',
    piSubtitle: 'Evaluated in real time to measure wave synchronization and project T+Next branches',
    tNextHeading: 'Projected Outputs: Next Trajectories (T+Next)',
    reliabilityHeading: 'OSINT Source Reliability Matrix & Noise Filtering',
    eventsRecordedSuffix: 'logged events',
  },
  fr: {
    sectionTitle: 'Corrélation Sémiotique Croisée : Couverture 2027 × Carte QAnon',
    sectionSubtitle:
      'Liaison interactive entre les symboles économiques de la couverture 2027 et les nœuds narratifs QAnon pour modéliser trajectoires et désinformation.',
    map1Title: 'Carte 1 : Couverture Prospective (2027)',
    map1Tag: 'Indicateurs Macro',
    map1Alt: 'Couverture The World Ahead 2027 avec le sigle ΠΣV cerclé de rouge',
    map1Fallback: 'Couverture 2027 (ΠΣV & Réseaux)',
    map2Title: 'Carte 2 : Graphe Narratif QAnon',
    map2Tag: 'Topologie',
    map2Alt: 'Carte mentale des ramifications QAnon / Great Awakening',
    map2Fallback: 'Carte ramifiée QAnon',
    observedNodes: 'Nœuds Détectés sur les Deux Cartes',
    mapBadgeEco: 'Couverture 2027',
    mapBadgeQ: 'Carte QAnon',
    visualLabel: 'Élément visuel : ',
    meaningLabel: 'Analyse structurelle & film : ',
    threatLabel: 'Mécanisme de menace : ',
    pairedHeading: 'Nœud miroir sur l’autre carte :',
    analyzeSymbolAria: 'Analyser le symbole',
    analyzeNodeAria: 'Analyser le nœud',
    piTitlePrefix: 'Équations & Calcul Harmonique avec Pi',
    piSubtitle: 'Calculées en continu pour mesurer la synchronisation et projeter T+Next',
    tNextHeading: 'Résultats Projetés : Prochaines Trajectoires (T+Next)',
    reliabilityHeading: 'Matrice de Fiabilité OSINT & Filtrage du Bruit',
    eventsRecordedSuffix: 'faits enregistrés',
  },
  id: {
    sectionTitle: 'Korelasi Semiotik Ganda: Sampul Majalah 2027 × Peta QAnon',
    sectionSubtitle:
      'Penghubung interaktif simbol ekonomi-geopolitik sampul 2027 dengan simpul narasi QAnon dalam model skenario film & pemantauan disinformasi.',
    map1Title: 'Peta 1: Sampul Prospektif (2027)',
    map1Tag: 'Indikator Makro',
    map1Alt: 'Sampul The World Ahead 2027 menyoroti lingkaran merah di simbol ΠΣV',
    map1Fallback: 'Peta Sampul 2027 (ΠΣV & Jaringan)',
    map2Title: 'Peta 2: Peta Percabangan Narasi QAnon',
    map2Tag: 'Topologi Simpul',
    map2Alt: 'Peta pikiran percabangan narasi QAnon / Great Awakening',
    map2Fallback: 'Peta Narasi QAnon',
    observedNodes: 'Simpul Terdeteksi di Kedua Peta',
    mapBadgeEco: 'Sampul 2027',
    mapBadgeQ: 'Peta QAnon',
    visualLabel: 'Elemen Visual: ',
    meaningLabel: 'Analisis Struktural & Film: ',
    threatLabel: 'Mekanisme Ancaman Terkait: ',
    pairedHeading: 'Simpul Pasangan di Peta Lawan:',
    analyzeSymbolAria: 'Analisis simbol',
    analyzeNodeAria: 'Analisis simpul',
    piTitlePrefix: 'Persamaan Matematis & Kalkulus Harmonik Pi',
    piSubtitle: 'Dihitung real-time untuk mengukur sinkronisasi gelombang dan memproyeksikan jalur T+Next',
    tNextHeading: 'Hasil Proyeksi: Lintasan Berikutnya (T+Next)',
    reliabilityHeading: 'Matriks Keandalan Sumber OSINT & Penyaringan Kebisingan',
    eventsRecordedSuffix: 'kejadian tercatat',
  },
  vi: {
    sectionTitle: 'Đối Chiếu Ký Hiệu Học Kép: Bìa Tạp Chí 2027 × Bản Đồ QAnon',
    sectionSubtitle:
      'Liên kết tương tác giữa các biểu tượng kinh tế – địa chính trị trên bìa 2027 và các nút phân nhánh tường thuật QAnon trong mô hình dự báo.',
    map1Title: 'Bản Đồ 1: Bìa Dự Báo Thế Giới (2027)',
    map1Tag: 'Chỉ Số Vĩ Mô',
    map1Alt: 'Bìa tạp chí The World Ahead 2027 với vòng tròn đỏ quanh ký hiệu ΠΣV',
    map1Fallback: 'Bản đồ Bìa 2027 (ΠΣV & Mạng lưới)',
    map2Title: 'Bản Đồ 2: Bản Đồ Phân Nhánh QAnon',
    map2Tag: 'Cấu Trúc Nút',
    map2Alt: 'Bản đồ tư duy phân nhánh QAnon / Great Awakening',
    map2Fallback: 'Bản đồ Phân nhánh QAnon',
    observedNodes: 'Các Nút Ghi Nhận Trên Hai Bản Đồ',
    mapBadgeEco: 'Bìa Tạp Chí',
    mapBadgeQ: 'Bản Đồ QAnon',
    visualLabel: 'Yếu tố trực quan: ',
    meaningLabel: 'Phân tích cấu trúc & phim: ',
    threatLabel: 'Cơ chế đe dọa liên quan: ',
    pairedHeading: 'Nút đối ứng trên bản đồ kia:',
    analyzeSymbolAria: 'Phân tích biểu tượng',
    analyzeNodeAria: 'Phân tích nút',
    piTitlePrefix: 'Phương Trình Toán Học & Điều Hòa Pi',
    piSubtitle: 'Tính toán tức thời để đo đồng bộ sóng và dự báo các nhánh T+Next',
    tNextHeading: 'Kết Quả Suy Luận: Quỹ Đạo Sắp Tới (T+Next)',
    reliabilityHeading: 'Ma Trận Độ Tin Cậy Nguồn OSINT & Lọc Nhiễu',
    eventsRecordedSuffix: 'sự kiện đã ghi',
  },
};

export default function SemioticsOSINTView({
  locale,
  events,
  mathMetrics,
  forecasts,
}: SemioticsOSINTViewProps) {
  const ui = SEMIOTIC_UI[locale];
  const localizedMarkers = useMemo(
    () => SEMIOTIC_MARKERS.map((m) => localizeMarker(m, locale)),
    [locale]
  );

  const [activeMarkerId, setActiveMarkerId] = useState<string>(
    SEMIOTIC_MARKERS[0].id
  );
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  const activeMarker =
    localizedMarkers.find((m) => m.id === activeMarkerId) ?? localizedMarkers[0];

  const pairedMarker =
    localizedMarkers.find((m) => m.id === activeMarker.pairedMarkerId) ?? null;

  const grades: ReliabilityGrade[] = ['A1', 'B2', 'C3', 'D4'];
  const arrowChar = locale === 'ar' ? '←' : '→';

  return (
    <div className="space-y-6">
      {/* Dual-Map Cross-Correlation Workspace */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#2B2856] pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">{ui.sectionTitle}</h2>
            <p className="mt-1 text-sm text-[#A5B4FC]">{ui.sectionSubtitle}</p>
          </div>
          <div className="font-latin-math text-xs font-semibold text-[#C084FC]">
            CQ×E = {mathMetrics.crossMapResonance} · π = {mathMetrics.piConstant}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Artifact 1: The World Ahead 2027 */}
          <div className="lg:col-span-4 rounded-md border border-[#2B2856] bg-[#0C0D16] p-3.5">
            <div className="flex min-h-[36px] items-start justify-between gap-2 pb-2.5 text-xs">
              <span className="font-bold text-white">{ui.map1Title}</span>
              <span className="shrink-0 text-[#A5B4FC]">{ui.map1Tag}</span>
            </div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded border border-[#2B2856] bg-[#07070B]">
              {!img1Error ? (
                <Image
                  src="/assets/aistudio/IMG_20261117_105818_368_8df8ec94.jpg"
                  alt={ui.map1Alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  referrerPolicy="no-referrer"
                  className="object-contain"
                  onError={() => setImg1Error(true)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-xs text-[#A5B4FC]">
                  <Layers className="h-6 w-6 mb-2" aria-hidden="true" />
                  <span>{ui.map1Fallback}</span>
                </div>
              )}

              {localizedMarkers
                .filter((m) => m.artifactId === 'economist_2027')
                .map((marker) => {
                  const isSelected = marker.id === activeMarker.id;
                  const isPaired = pairedMarker?.id === marker.id;
                  return (
                    <button
                      key={marker.id}
                      type="button"
                      onClick={() => setActiveMarkerId(marker.id)}
                      aria-label={`${ui.analyzeSymbolAria} ${marker.title}`}
                      style={{
                        left: `${marker.xPercent}%`,
                        top: `${marker.yPercent}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className={`absolute h-7 w-7 rounded-md border-2 text-[10px] font-latin-math font-bold transition-transform hover:scale-110 ${
                        isSelected
                          ? 'border-white bg-[#DC2626] text-white scale-115 shadow-lg'
                          : isPaired
                          ? 'border-white bg-[#7C3AED] text-white scale-110'
                          : 'border-[#312E81] bg-[#0C0D16]/90 text-white'
                      }`}
                    >
                      {marker.code.slice(3, 5)}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Artifact 2: QAnon / Great Awakening Narrative Map */}
          <div className="lg:col-span-4 rounded-md border border-[#2B2856] bg-[#0C0D16] p-3.5">
            <div className="flex min-h-[36px] items-start justify-between gap-2 pb-2.5 text-xs">
              <span className="font-bold text-white">{ui.map2Title}</span>
              <span className="shrink-0 text-[#A5B4FC]">{ui.map2Tag}</span>
            </div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded border border-[#2B2856] bg-[#07070B]">
              {!img2Error ? (
                <Image
                  src="/assets/aistudio/________________129d90e0.jpg"
                  alt={ui.map2Alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  referrerPolicy="no-referrer"
                  className="object-contain"
                  onError={() => setImg2Error(true)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-xs text-[#A5B4FC]">
                  <Layers className="h-6 w-6 mb-2" aria-hidden="true" />
                  <span>{ui.map2Fallback}</span>
                </div>
              )}

              {localizedMarkers
                .filter((m) => m.artifactId === 'narrative_map')
                .map((marker) => {
                  const isSelected = marker.id === activeMarker.id;
                  const isPaired = pairedMarker?.id === marker.id;
                  return (
                    <button
                      key={marker.id}
                      type="button"
                      onClick={() => setActiveMarkerId(marker.id)}
                      aria-label={`${ui.analyzeNodeAria} ${marker.title}`}
                      style={{
                        left: `${marker.xPercent}%`,
                        top: `${marker.yPercent}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className={`absolute h-7 w-7 rounded-md border-2 text-[10px] font-latin-math font-bold transition-transform hover:scale-110 ${
                        isSelected
                          ? 'border-white bg-[#DC2626] text-white scale-115 shadow-lg'
                          : isPaired
                          ? 'border-white bg-[#7C3AED] text-white scale-110'
                          : 'border-[#312E81] bg-[#0C0D16]/90 text-white'
                      }`}
                    >
                      Q{marker.code.slice(3, 4)}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Interactive Marker & Cross-Paired Analysis */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pe-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white pb-1">
                <Eye className="h-4 w-4 text-[#E11D48]" aria-hidden="true" />
                <span>{ui.observedNodes}</span>
              </div>
              {localizedMarkers.map((m) => {
                const active = m.id === activeMarker.id;
                const paired = pairedMarker?.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMarkerId(m.id)}
                    className={`w-full rounded border px-3 py-2 text-start text-xs transition-colors ${
                      active
                        ? 'border-[#DC2626] bg-[#2D0A18] text-white'
                        : paired
                        ? 'border-[#7C3AED] bg-[#2E1065]/60 text-white'
                        : 'border-[#2B2856] bg-[#0C0D16] text-[#E5E7EB] hover:border-[#7C3AED]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-latin-math text-[#C084FC]">
                        {m.code} · w={m.piWeight}
                      </span>
                      <span className="text-[#A5B4FC]">
                        {m.artifactId === 'economist_2027'
                          ? ui.mapBadgeEco
                          : ui.mapBadgeQ}
                      </span>
                    </div>
                    <div className="mt-0.5 font-semibold">{m.title}</div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-md border border-[#2B2856] bg-[#121329] p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-latin-math text-[11px] font-semibold text-[#FDA4AF]">
                  {activeMarker.code} · π-weight {activeMarker.piWeight}
                </span>
                <span
                  className="font-semibold"
                  style={{
                    color: SCENARIO_META[activeMarker.linkedScenario].color,
                  }}
                >
                  {getScenarioCopy(activeMarker.linkedScenario, locale).title}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                {activeMarker.title}
              </h3>
              <p className="text-[#CBD5E1]">
                <strong className="text-white">{ui.visualLabel}</strong>
                {activeMarker.visualElement}
              </p>
              <p className="text-[#E5E7EB] leading-relaxed">
                <strong className="text-white">{ui.meaningLabel}</strong>
                {activeMarker.institutionalMeaning}
              </p>
              <div className="border-t border-[#2B2856] pt-2 text-[#A5B4FC]">
                <strong className="text-white">{ui.threatLabel}</strong>
                {getThreatCopy(activeMarker.linkedThreat, locale).label}
              </div>

              {pairedMarker && (
                <div className="rounded border border-[#7C3AED]/50 bg-[#2E1065]/40 p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C084FC]">
                    <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{ui.pairedHeading}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMarkerId(pairedMarker.id)}
                    className="mt-1 text-start text-xs font-bold text-white hover:text-[#C084FC]"
                  >
                    {pairedMarker.title} ({pairedMarker.code}) {arrowChar}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pi Mathematical Equations & Forecast Projections Breakdown */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2856] pb-3.5">
          <div className="flex items-center gap-2">
            <Sigma className="h-5 w-5 text-[#C084FC]" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">
              {ui.piTitlePrefix} (π = {mathMetrics.piConstant})
            </h3>
          </div>
          <span className="text-xs text-[#A5B4FC]">{ui.piSubtitle}</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {mathMetrics.equationSteps.map((step) => (
            <div
              key={step.id}
              className="rounded-md border border-[#2B2856] bg-[#0C0D16] p-4 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">{step.name}</span>
                <span className="font-latin-math text-base font-bold text-[#C084FC]">
                  {step.computedValue} {step.unit}
                </span>
              </div>
              <div className="mt-2 rounded border border-[#1E1B4B] bg-[#121329] px-3 py-2 font-latin-math text-xs text-[#E0E7FF]">
                {step.formula}
              </div>
              <p className="mt-2 leading-relaxed text-[#CBD5E1]">
                {step.interpretation}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-[#2B2856] pt-4">
          <h4 className="text-sm font-bold text-white">{ui.tNextHeading}</h4>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {forecasts.map((fc) => (
              <div
                key={fc.id}
                className="rounded-md border border-[#2B2856] bg-[#0C0D16] p-3.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-latin-math font-bold text-[#C084FC]">
                    {fc.horizonLabel}
                  </span>
                  <span
                    className="font-mono-tabular font-bold"
                    style={{ color: SCENARIO_META[fc.targetScenario].color }}
                  >
                    {fc.probability}% · {getScenarioCopy(fc.targetScenario, locale).title}
                  </span>
                </div>
                <div className="mt-1.5 font-bold text-white">{fc.title}</div>
                <p className="mt-1 text-[#A5B4FC]">{fc.triggerCondition}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OSINT Source Reliability Matrix */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <h3 className="text-base font-bold text-white">{ui.reliabilityHeading}</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {grades.map((g) => {
            const count = events.filter((e) => e.reliabilityGrade === g).length;
            return (
              <div
                key={g}
                className="rounded border border-[#2B2856] bg-[#0C0D16] p-3.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-latin-math text-sm font-bold text-[#C084FC]">
                    {g}
                  </span>
                  <span className="font-mono-tabular text-[#A5B4FC]">
                    {count} {ui.eventsRecordedSuffix}
                  </span>
                </div>
                <div className="mt-1.5 font-medium text-[#E5E7EB]">
                  {getReliabilityCopy(g, locale)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <DecoderLabSection locale={locale} />
    </div>
  );
}
