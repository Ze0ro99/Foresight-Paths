import {
  ACHEvidenceMap,
  AppLocale,
  EventDraftInput,
  FilmSceneBeat,
  ForecastBranch,
  FullScenarioDossier,
  GeoCoordinates,
  GeodesicArc,
  HypothesisId,
  HypothesisRanking,
  LiveEvent,
  MathTrajectoryMetrics,
  PlatformImpactSummary,
  PlatformLayerId,
  ReliabilityGrade,
  ResearchTrack,
  ScenarioDelta,
  ScenarioId,
  ScenarioProbabilities,
  SectorType,
  SelectedMapItem,
  SemioticMarker,
  ThreatMechanismId,
  TrajectoryEdge,
  TrajectoryGraph,
  TrajectoryNode,
} from './types';
import {
  getHypothesisCopy,
  getPlatformCopy,
  getReliabilityCopy,
  getScenarioCopy,
  getSectorCopy,
  getThreatCopy,
} from './i18n';
import { FORECAST_I18N } from './i18n-data';

export const PI_CONST = Math.PI; // 3.141592653589793
export const EARTH_RADIUS_KM = 6371;

export const RELIABILITY_WEIGHTS: Record<ReliabilityGrade, number> = {
  A1: 1.0,
  B2: 0.8,
  C3: 0.5,
  D4: 0.2,
};

export const RELIABILITY_LABELS: Record<ReliabilityGrade, string> = {
  A1: 'A1 — سجل تقني أولي موثق',
  B2: 'B2 — مصدر مؤسسي موثوق غالباً',
  C3: 'C3 — إشارة إعلامية غير محققة بالكامل',
  D4: 'D4 — ضوضاء سردية / ادعاء غير موثق',
};

export const SECTOR_LABELS: Record<SectorType, string> = {
  telecom: 'الاتصالات والربط',
  finance: 'المصارف والتسويات',
  aviation: 'الطيران والملاحة',
  energy: 'الطاقة والشبكات',
  media: 'الفضاء المعلوماتي',
};

export const TRACK_LABELS: Record<ResearchTrack, string> = {
  osint: 'المسار 1: OSINT والجنائي الرقمي',
  ach: 'المسار 2: الفرضيات المتنافسة ACH',
  semiotics: 'المسار 3: السيميائية والخرائط',
  contagion: 'المسار 4: العدوى المالية',
};

export const PLATFORM_LAYER_META: Record<
  PlatformLayerId,
  { label: string; shortLabel: string; defaultThreat: ThreatMechanismId }
> = {
  cloud_routing: {
    label: 'منصات التوجيه والسحابة (BGP / IAM)',
    shortLabel: 'البنية السحابية',
    defaultThreat: 'bgp_spof',
  },
  financial_hft: {
    label: 'منصات التسويات والتداول الخوارزمي',
    shortLabel: 'المقاصة والتداول',
    defaultThreat: 'algo_contagion',
  },
  social_swarm: {
    label: 'منصات التواصل والتضخيم السردي',
    shortLabel: 'منصات التواصل',
    defaultThreat: 'narrative_swarm',
  },
  energy_maritime: {
    label: 'منصات الموانئ والطاقة والطيران',
    shortLabel: 'الطاقة والملاحة',
    defaultThreat: 'supply_choke',
  },
  discourse_media: {
    label: 'منصات الخطاب الإعلامي والاستشراف',
    shortLabel: 'الإعلام والاستشراف',
    defaultThreat: 'ai_amplification',
  },
};

export const DEFAULT_COORDS_BY_SECTOR: Record<SectorType, GeoCoordinates> = {
  telecom: {
    lat: 50.1109,
    lng: 8.6821,
    city: 'فرانكفورت',
    regionCode: 'EU-CENTRAL',
    asnOrHub: 'DE-CIX',
  },
  finance: {
    lat: 51.5074,
    lng: -0.1278,
    city: 'لندن',
    regionCode: 'UK-FIN',
    asnOrHub: 'LCH-LD4',
  },
  aviation: {
    lat: 50.8503,
    lng: 4.3517,
    city: 'بروكسل',
    regionCode: 'EU-EUROCTRL',
    asnOrHub: 'BRU-ATC',
  },
  energy: {
    lat: 29.9668,
    lng: 32.5498,
    city: 'السويس',
    regionCode: 'MENA-SUEZ',
    asnOrHub: 'SeaMeWe-5',
  },
  media: {
    lat: 40.7128,
    lng: -74.006,
    city: 'نيويورك',
    regionCode: 'US-EAST',
    asnOrHub: 'NYC-IX',
  },
};

export const THREAT_MECHANISM_META: Record<
  ThreatMechanismId,
  { label: string; shortLabel: string; description: string; severityColor: string }
> = {
  bgp_spof: {
    label: 'اختناق التوجيه ونقاط الفشل الوحيدة (BGP / SPOF)',
    shortLabel: 'اختناق التوجيه SPOF',
    description: 'توقف متسلسل في المصادقة السحابية وتبادل المسارات القارية.',
    severityColor: '#E11D48',
  },
  algo_contagion: {
    label: 'العدوى الخوارزمية وهشاشة السيولة (ΠΣV)',
    shortLabel: 'عدوى السيولة ΠΣV',
    description: 'استجابة التداول الآلي لصدمات البيانات وتغير أنظمة المقاصة.',
    severityColor: '#9333EA',
  },
  narrative_swarm: {
    label: 'تشعب السرديات التضليلية والهندسة الاجتماعية',
    shortLabel: 'سرب السرديات Q-Map',
    description: 'تجميع الحوادث المتفرقة في شبكة ادعاءات مترابطة لتضخيم الذعر.',
    severityColor: '#DC2626',
  },
  supply_choke: {
    label: 'عزل ممرات الطاقة والموانئ اللوجستية',
    shortLabel: 'عزل ممرات الطاقة',
    description: 'إغلاق وقائي لبوابات البيانات مما يبطئ سلاسل الإمداد والشحن.',
    severityColor: '#F59E0B',
  },
  ai_amplification: {
    label: 'تسارع الأتمتة وتجاوز عتبات الحوكمة',
    shortLabel: 'تسارع الأتمتة والذكاء',
    description: 'اتساع الفجوة بين سرعة القرار الآلي وقدرة المراجعة البشرية.',
    severityColor: '#6366F1',
  },
};

export const SCENARIO_META: Record<
  ScenarioId,
  {
    id: ScenarioId;
    title: string;
    englishTitle: string;
    summary: string;
    color: string;
    bgTint: string;
    earlyWarning: string;
  }
> = {
  adaptation: {
    id: 'adaptation',
    title: 'التكيف الهيكلي',
    englishTitle: 'Structural Adaptation',
    summary:
      'استجابة تنظيمية وهندسية سريعة تفرض تعدد المزودين السحابيين وبروتوكولات عزل الأزمات.',
    color: '#10B981',
    bgTint: 'rgba(16, 185, 129, 0.12)',
    earlyWarning: 'إقرار معايير التبديل التلقائي بين السحب السيادية خلال 48 ساعة.',
  },
  fragmentation: {
    id: 'fragmentation',
    title: 'التشظي الرقمي',
    englishTitle: 'Digital Fragmentation',
    summary:
      'تفكك الشبكة العالمية إلى تكتلات إقليمية مغلقة وقيود صارمة على تدفق البيانات والسيولة.',
    color: '#E11D48',
    bgTint: 'rgba(225, 29, 72, 0.14)',
    earlyWarning: 'إغلاق بوابات التوجيه العابرة للقارات أو تقييد تسويات العملات الرقمية.',
  },
  fragility: {
    id: 'fragility',
    title: 'الهشاشة المزمنة',
    englishTitle: 'Chronic Fragility',
    summary:
      'اتساع فجوة التعقيد التقني مقابل الحوكمة، مما يُبقي الأسواق عرضة لصدمات متكررة.',
    color: '#9333EA',
    bgTint: 'rgba(147, 51, 234, 0.14)',
    earlyWarning: 'ارتفاع تقلب التداول الخوارزمي وتكرار أعطال نقاط الفشل الوحيدة.',
  },
};

export const HYPOTHESIS_META: Record<
  HypothesisId,
  { label: string; description: string }
> = {
  human_error: {
    label: 'خطأ بشري في تحديث برمجي',
    description: 'تعديل خاطئ في تهيئة الشبكة أو شهادات التشفير أثناء نشر تحديث روتيني.',
  },
  infra_failure: {
    label: 'إخفاق هيكلي في البنية المادية',
    description: 'انقطاع في الكابلات البحرية أو مراكز التبريد أو نقطة فشل وحيدة سحابية.',
  },
  cyber_attack: {
    label: 'عملية سيبرانية موجهة',
    description: 'استغلال متعمد لبروتوكولات التوجيه BGP أو هجوم سلاسل إمداد برمجية.',
  },
  disinfo_cascade: {
    label: 'تضخيم تضليلي لحدث محدود',
    description: 'عطل تقني جزئي تم تضخيمه عبر حملات هندسة اجتماعية لإحداث ذعر مالي.',
  },
};

/**
 * Computes Spherical Great-Circle Distance (km) between two coordinate pairs
 * using Pi (3.14159...) radian conversion and the Haversine formula.
 */
export function computeGreatCircleKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * PI_CONST) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c);
}

/**
 * Computes geodesic propagation arcs between parent -> child events on the world grid.
 */
export function computeGeodesicArcs(
  events: LiveEvent[],
  selectedEventId: string | null
): GeodesicArc[] {
  const arcs: GeodesicArc[] = [];
  for (const ev of events) {
    if (!ev.parentEventId) continue;
    const parent = events.find((p) => p.id === ev.parentEventId);
    if (!parent) continue;
    const distanceKm = computeGreatCircleKm(
      parent.coordinates.lat,
      parent.coordinates.lng,
      ev.coordinates.lat,
      ev.coordinates.lng
    );
    const dt = Math.max(1, ev.elapsedMinutes - parent.elapsedMinutes);
    const piPropagationIndex = Number(
      ((distanceKm / dt) * (PI_CONST / 100)).toFixed(2)
    );
    arcs.push({
      id: `arc-${parent.id}-${ev.id}`,
      fromEventId: parent.id,
      toEventId: ev.id,
      fromCoords: parent.coordinates,
      toCoords: ev.coordinates,
      distanceKm,
      piPropagationIndex,
      highlighted:
        ev.id === selectedEventId || parent.id === selectedEventId,
    });
  }
  return arcs;
}

/**
 * Aggregates live propagation pressure across the 5 platform layers.
 */
export function computePlatformImpactMatrix(
  events: LiveEvent[],
  locale: AppLocale = 'ar'
): PlatformImpactSummary[] {
  const layers: PlatformLayerId[] = [
    'cloud_routing',
    'financial_hft',
    'social_swarm',
    'energy_maritime',
    'discourse_media',
  ];

  return layers.map((layerId) => {
    const matched = events.filter((e) => e.platformLayer === layerId);
    const rawStress = matched.reduce((acc, ev) => {
      const w = RELIABILITY_WEIGHTS[ev.reliabilityGrade];
      return (
        acc +
        w *
          (ev.marketImpactBps * 0.55 +
            ev.disinfoVelocity * 0.45 +
            ev.latencySpikeMs * 0.08)
      );
    }, 0);

    const pressurePct =
      matched.length === 0
        ? 12
        : Math.min(98, Math.max(18, Math.round(rawStress / matched.length)));

    return {
      id: layerId,
      label: getPlatformCopy(layerId, locale).label,
      eventCount: matched.length,
      pressurePct,
      dominantThreat:
        matched[matched.length - 1]?.threatMechanism ??
        PLATFORM_LAYER_META[layerId].defaultThreat,
    };
  });
}

/**
 * Computes normalized scenario probabilities (sum === 100) from active events,
 * weighting each event's delta by its OSINT Source Reliability Grade (A1..D4).
 */
export function computeScenarioProbabilities(
  events: LiveEvent[]
): ScenarioProbabilities {
  let rawAdapt = 34;
  let rawFragm = 33;
  let rawFragi = 33;
  let totalMarketBps = 0;
  let maxDisinfo = 0;
  let verifiedCount = 0;

  for (const ev of events) {
    const reliabilityWeight = RELIABILITY_WEIGHTS[ev.reliabilityGrade];
    rawAdapt += ev.scenarioDelta.adaptation * reliabilityWeight;
    rawFragm += ev.scenarioDelta.fragmentation * reliabilityWeight;
    rawFragi += ev.scenarioDelta.fragility * reliabilityWeight;

    totalMarketBps += Math.max(0, ev.marketImpactBps) * reliabilityWeight;
    if (ev.disinfoVelocity > maxDisinfo) {
      maxDisinfo = ev.disinfoVelocity;
    }
    if (ev.reliabilityGrade === 'A1' || ev.reliabilityGrade === 'B2') {
      verifiedCount += 1;
    }
  }

  const flooredAdapt = Math.max(5, rawAdapt);
  const flooredFragm = Math.max(5, rawFragm);
  const flooredFragi = Math.max(5, rawFragi);
  const sum = flooredAdapt + flooredFragm + flooredFragi;

  const adaptation = Math.round((flooredAdapt / sum) * 100);
  const fragmentation = Math.round((flooredFragm / sum) * 100);
  const fragility = Math.max(0, 100 - adaptation - fragmentation);

  let dominant: ScenarioId = 'fragility';
  if (adaptation >= fragmentation && adaptation >= fragility) {
    dominant = 'adaptation';
  } else if (fragmentation >= adaptation && fragmentation >= fragility) {
    dominant = 'fragmentation';
  }

  const resilienceBase =
    events.length === 0
      ? 68
      : Math.round(
          Math.max(
            18,
            Math.min(
              94,
              52 +
                (adaptation - fragility) * 0.45 +
                (verifiedCount / Math.max(1, events.length)) * 18 -
                totalMarketBps * 0.08
            )
          )
        );

  return {
    adaptation,
    fragmentation,
    fragility,
    dominant,
    resilienceIndex: resilienceBase,
    disinfoPressure: Math.min(100, Math.round(maxDisinfo)),
    contagionRiskBps: Math.round(totalMarketBps),
  };
}

/**
 * Mathematical Trajectory Engine using Pi (3.14159265...) harmonic phase resonance,
 * base-Pi Shannon entropy, spherical geodesic span, and dual-map coupling.
 */
const EQ_LOCALE_TEXT: Record<
  AppLocale,
  {
    phaseName: string;
    phaseInterp: string;
    entropyName: string;
    entropyInterp: string;
    crossName: string;
    crossUnit: string;
    crossInterp: string;
    riskName: string;
    riskInterp: string;
  }
> = {
  ar: {
    phaseName: 'معادلة الطور التوافقي (Φπ)',
    phaseInterp: 'يقيس تزامن ذروة الأعطال التقنية مع موجات الضوضاء السردية عبر الدورة الزمنية.',
    entropyName: 'إنتروبيا تفرع المسارات (Hπ)',
    entropyInterp: 'كلما انخفضت القيمة عن 0.90 دلّ ذلك على حسم النظام اتجاهه نحو مسار مهيمن واحد.',
    crossName: 'اقتران الخريطتين (CQ×E)',
    crossUnit: 'معامل اقتران',
    crossInterp: 'يربط كثافة عقد التشعب في خريطة QAnon بمؤشرات المجلة (ΠΣV، الطاقة، والذكاء الاصطناعي).',
    riskName: 'موجة التصعيد والمدى الكروي (Rnext)',
    riskInterp: 'مؤشر الإنذار المركب لانتقال الأزمة عبر الإحداثيات الجغرافية والمنصات في النافذة القادمة.',
  },
  en: {
    phaseName: 'Pi Harmonic Phase Equation (Φπ)',
    phaseInterp: 'Measures temporal alignment between technical outage spikes and viral disinformation waves.',
    entropyName: 'Trajectory Branching Entropy (Hπ)',
    entropyInterp: 'Values below 0.90 indicate decisive convergence toward a dominant macro scenario.',
    crossName: 'Dual-Map Cross Coupling (CQ×E)',
    crossUnit: 'coupling index',
    crossInterp: 'Pairs Q-Map branching node weights against Economist 2027 vectors (ΠΣV, energy, AI).',
    riskName: 'Cascade Escalation & Geodesic Span (Rnext)',
    riskInterp: 'Composite early-warning index for cross-border shock propagation in the next window.',
  },
  fr: {
    phaseName: 'Équation de Phase Harmonique (Φπ)',
    phaseInterp: 'Mesure la synchronisation temporelle entre pannes techniques et vagues de désinformation.',
    entropyName: 'Entropie de Bifurcation (Hπ)',
    entropyInterp: 'Une valeur sous 0,90 indique une convergence décisive vers une trajectoire dominante.',
    crossName: 'Couplage des Deux Cartes (CQ×E)',
    crossUnit: 'indice couplé',
    crossInterp: 'Relie la densité des nœuds QAnon aux vecteurs de la couverture 2027 (ΠΣV, énergie, IA).',
    riskName: 'Indice d’Escalade & Portée Géodésique (Rnext)',
    riskInterp: 'Indicateur avancé de propagation des chocs à travers les coordonnées et plateformes.',
  },
  id: {
    phaseName: 'Persamaan Fase Harmonik (Φπ)',
    phaseInterp: 'Mengukur keselarasan lonjakan gangguan teknis dengan gelombang disinformasi di seluruh siklus.',
    entropyName: 'Entropi Percabangan Lintasan (Hπ)',
    entropyInterp: 'Nilai di bawah 0,90 menandakan sistem mengerucut ke satu lintasan makro dominan.',
    crossName: 'Korelasi Peta Ganda (CQ×E)',
    crossUnit: 'indeks korelasi',
    crossInterp: 'Menghubungkan simpul percabangan QAnon dengan vektor sampul 2027 (ΠΣV, energi, AI).',
    riskName: 'Gelombang Eskalasi & Bentang Geodesik (Rnext)',
    riskInterp: 'Indeks peringatan dini gabungan bagi penjalaran krisis lintas koordinat berikutnya.',
  },
  vi: {
    phaseName: 'Phương Trình Pha Điều Hòa (Φπ)',
    phaseInterp: 'Đo mức độ đồng bộ giữa đỉnh sự cố kỹ thuật và làn sóng nhiễu tin đồn theo thời gian.',
    entropyName: 'Entropy Phân Nhánh Quỹ Đạo (Hπ)',
    entropyInterp: 'Giá trị dưới 0,90 cho thấy hệ thống đang hội tụ rõ rệt về một kịch bản chủ đạo.',
    crossName: 'Liên Kết Bản Đồ Kép (CQ×E)',
    crossUnit: 'chỉ số liên kết',
    crossInterp: 'Kết nối mật độ nút phân nhánh QAnon với các véc-tơ bìa 2027 (ΠΣV, năng lượng, AI).',
    riskName: 'Chỉ Số Leo Thang & Phạm Vi Trắc Địa (Rnext)',
    riskInterp: 'Cảnh báo sớm tổng hợp về khả năng lan truyền khủng hoảng qua các tọa độ tiếp theo.',
  },
};

export function computePiTrajectoryMetrics(
  events: LiveEvent[],
  markers: SemioticMarker[],
  probabilities: ScenarioProbabilities,
  locale: AppLocale = 'ar'
): MathTrajectoryMetrics {
  const n = Math.max(1, events.length);

  let phaseAccum = 0;
  let marketMomentum = 0;
  for (const ev of events) {
    const w = RELIABILITY_WEIGHTS[ev.reliabilityGrade];
    const sinTerm = Math.abs(Math.sin((PI_CONST * (ev.elapsedMinutes + 15)) / 180));
    const cosTerm = Math.cos((PI_CONST * ev.disinfoVelocity) / 220);
    phaseAccum += w * (0.65 * sinTerm + 0.35 * cosTerm);
    marketMomentum += (ev.marketImpactBps * w) / (PI_CONST * 10);
  }
  const piPhaseHarmonic = Number(
    Math.min(3.14, Math.max(0.15, (phaseAccum / n) * PI_CONST)).toFixed(4)
  );

  const probsArr = [
    Math.max(0.01, probabilities.adaptation / 100),
    Math.max(0.01, probabilities.fragmentation / 100),
    Math.max(0.01, probabilities.fragility / 100),
  ];
  const rawEntropy = probsArr.reduce(
    (acc, p) => acc - p * (Math.log(p) / Math.log(PI_CONST)),
    0
  );
  const entropyBasePi = Number(rawEntropy.toFixed(4));

  const economistMarkers = markers.filter((m) => m.artifactId === 'economist_2027');
  const qanonMarkers = markers.filter((m) => m.artifactId === 'narrative_map');

  const econSum = economistMarkers.reduce((s, m) => s + m.piWeight, 0);
  const qanonSum = qanonMarkers.reduce((s, m) => s + m.piWeight, 0);

  const economistVectorIndex = Number(
    ((econSum / Math.max(1, economistMarkers.length)) * (1 + marketMomentum / PI_CONST)).toFixed(3)
  );
  const qanonClusterCoupling = Number(
    (
      (qanonSum / Math.max(1, qanonMarkers.length)) *
      (1 + probabilities.disinfoPressure / (100 * PI_CONST))
    ).toFixed(3)
  );

  const crossMapResonance = Number(
    (
      (economistVectorIndex * qanonClusterCoupling * PI_CONST) /
      (1 + entropyBasePi)
    ).toFixed(3)
  );

  const arcs = computeGeodesicArcs(events, null);
  const totalGeodesicSpanKm = arcs.reduce((sum, a) => sum + a.distanceKm, 0);

  const nextCascadeRiskPct = Math.min(
    96,
    Math.max(
      14,
      Math.round(
        (piPhaseHarmonic / PI_CONST) * 48 +
          probabilities.disinfoPressure * 0.28 +
          (1 - entropyBasePi) * 22
      )
    )
  );

  const eqText = EQ_LOCALE_TEXT[locale];

  return {
    piConstant: Number(PI_CONST.toFixed(6)),
    piPhaseHarmonic,
    entropyBasePi,
    crossMapResonance,
    qanonClusterCoupling,
    economistVectorIndex,
    nextCascadeRiskPct,
    totalGeodesicSpanKm,
    equationSteps: [
      {
        id: 'eq-phase',
        name: eqText.phaseName,
        formula: 'Φπ = (π / N) · Σ [ wᵢ · (0.65·|sin(π·tᵢ/180)| + 0.35·cos(π·Dᵢ/220)) ]',
        computedValue: piPhaseHarmonic,
        unit: 'rad·π',
        interpretation: eqText.phaseInterp,
      },
      {
        id: 'eq-entropy',
        name: eqText.entropyName,
        formula: 'Hπ = -Σ pₖ · ln(pₖ) / ln(π)',
        computedValue: entropyBasePi,
        unit: 'π-bits',
        interpretation: eqText.entropyInterp,
      },
      {
        id: 'eq-cross',
        name: eqText.crossName,
        formula: 'CQ×E = (V_Econ · V_QMap · π) / (1 + Hπ)',
        computedValue: crossMapResonance,
        unit: eqText.crossUnit,
        interpretation: eqText.crossInterp,
      },
      {
        id: 'eq-risk',
        name: eqText.riskName,
        formula: 'Rnext = 48·(Φπ/π) + 0.28·Dmax + 22·(1 - Hπ)',
        computedValue: nextCascadeRiskPct,
        unit: '%',
        interpretation: eqText.riskInterp,
      },
    ],
  };
}

/**
 * Projects the top 3 upcoming trajectory branches with projected target coordinates.
 */
export function generateNextForecasts(
  events: LiveEvent[],
  probabilities: ScenarioProbabilities,
  metrics: MathTrajectoryMetrics,
  locale: AppLocale = 'ar'
): ForecastBranch[] {
  const lastElapsed = events[events.length - 1]?.elapsedMinutes ?? 0;
  const fcCopy = FORECAST_I18N[locale];

  const rawBranches: {
    id: 'fc-fragm' | 'fc-fragi' | 'fc-adapt';
    etaOffset: number;
    title: string;
    threatMechanism: ThreatMechanismId;
    targetScenario: ScenarioId;
    rawScore: number;
    mapLinkSummary: string;
    triggerCondition: string;
    projectedCoords: GeoCoordinates;
  }[] = [
    {
      id: 'fc-fragm',
      etaOffset: 22,
      title: fcCopy['fc-fragm'].title,
      threatMechanism: 'supply_choke',
      targetScenario: 'fragmentation',
      rawScore:
        probabilities.fragmentation * 0.8 +
        metrics.economistVectorIndex * 14,
      mapLinkSummary: fcCopy['fc-fragm'].mapLink,
      triggerCondition: fcCopy['fc-fragm'].trigger,
      projectedCoords: {
        lat: 1.3521,
        lng: 103.8198,
        city: fcCopy['fc-fragm'].city,
        regionCode: 'APAC-MARITIME',
        asnOrHub: 'SG-PORT-IX',
      },
    },
    {
      id: 'fc-fragi',
      etaOffset: 15,
      title: fcCopy['fc-fragi'].title,
      threatMechanism: 'algo_contagion',
      targetScenario: 'fragility',
      rawScore:
        probabilities.fragility * 0.85 +
        metrics.qanonClusterCoupling * 15 +
        metrics.piPhaseHarmonic * 5,
      mapLinkSummary: fcCopy['fc-fragi'].mapLink,
      triggerCondition: `${fcCopy['fc-fragi'].trigger} (${Math.max(55, probabilities.disinfoPressure)}%)`,
      projectedCoords: {
        lat: 35.6762,
        lng: 139.6503,
        city: fcCopy['fc-fragi'].city,
        regionCode: 'JP-TSE',
        asnOrHub: 'TY3-Clearing',
      },
    },
    {
      id: 'fc-adapt',
      etaOffset: 38,
      title: fcCopy['fc-adapt'].title,
      threatMechanism: 'bgp_spof',
      targetScenario: 'adaptation',
      rawScore:
        probabilities.adaptation * 0.9 +
        (100 - metrics.nextCascadeRiskPct) * 0.45,
      mapLinkSummary: fcCopy['fc-adapt'].mapLink,
      triggerCondition: fcCopy['fc-adapt'].trigger,
      projectedCoords: {
        lat: 46.2044,
        lng: 6.1432,
        city: fcCopy['fc-adapt'].city,
        regionCode: 'UN-ITU',
        asnOrHub: 'GVA-MultiCloud',
      },
    },
  ];

  const totalRaw = rawBranches.reduce((s, b) => s + Math.max(5, b.rawScore), 0);
  const p0 = Math.round((Math.max(5, rawBranches[0].rawScore) / totalRaw) * 100);
  const p1 = Math.round((Math.max(5, rawBranches[1].rawScore) / totalRaw) * 100);
  const p2 = Math.max(0, 100 - p0 - p1);
  const probs = [p0, p1, p2];

  return rawBranches
    .map((b, idx) => ({
      id: b.id,
      horizonLabel: `T+${lastElapsed + b.etaOffset}m`,
      etaMinutes: lastElapsed + b.etaOffset,
      title: b.title,
      threatMechanism: b.threatMechanism,
      targetScenario: b.targetScenario,
      probability: probs[idx],
      mapLinkSummary: b.mapLinkSummary,
      triggerCondition: b.triggerCondition,
      projectedCoords: b.projectedCoords,
    }))
    .sort((a, b) => b.probability - a.probability);
}

/**
 * Track 2: Analysis of Competing Hypotheses (ACH) Falsification Testing.
 */
export function evaluateACHMatrix(
  events: LiveEvent[],
  locale: AppLocale = 'ar'
): HypothesisRanking[] {
  const ids: HypothesisId[] = [
    'human_error',
    'infra_failure',
    'cyber_attack',
    'disinfo_cascade',
  ];

  const stats: Record<
    HypothesisId,
    { falsificationScore: number; supportCount: number; falsifyCount: number }
  > = {
    human_error: { falsificationScore: 0, supportCount: 0, falsifyCount: 0 },
    infra_failure: { falsificationScore: 0, supportCount: 0, falsifyCount: 0 },
    cyber_attack: { falsificationScore: 0, supportCount: 0, falsifyCount: 0 },
    disinfo_cascade: { falsificationScore: 0, supportCount: 0, falsifyCount: 0 },
  };

  for (const ev of events) {
    const reliabilityWeight = RELIABILITY_WEIGHTS[ev.reliabilityGrade];
    for (const hId of ids) {
      const cell = ev.achEvidence[hId];
      if (cell.polarity === 'falsifies') {
        stats[hId].falsificationScore += Number(
          (cell.weight * reliabilityWeight).toFixed(2)
        );
        stats[hId].falsifyCount += 1;
      } else if (cell.polarity === 'supports') {
        stats[hId].supportCount += 1;
      }
    }
  }

  const sorted = ids
    .map((id) => {
      const hCopy = getHypothesisCopy(id, locale);
      return {
        id,
        label: hCopy.label,
        description: hCopy.description,
        falsificationScore: Number(stats[id].falsificationScore.toFixed(2)),
        supportCount: stats[id].supportCount,
        falsifyCount: stats[id].falsifyCount,
      };
    })
    .sort((a, b) => {
      if (a.falsificationScore !== b.falsificationScore) {
        return a.falsificationScore - b.falsificationScore;
      }
      return b.supportCount - a.supportCount;
    });

  return sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    isMostLikely: idx === 0,
  }));
}

const TRACK_Y_LANE: Record<ResearchTrack, number> = {
  osint: 108,
  ach: 202,
  semiotics: 296,
  contagion: 390,
};

const GRAPH_LABELS: Record<
  AppLocale,
  { minSuffix: string; causalLabel: string; probSuffix: string }
> = {
  ar: { minSuffix: 'د', causalLabel: 'سببية متسلسلة', probSuffix: 'احتمال' },
  en: { minSuffix: 'm', causalLabel: 'Causal Chain', probSuffix: 'prob.' },
  fr: { minSuffix: 'm', causalLabel: 'Lien causal', probSuffix: 'prob.' },
  id: { minSuffix: 'm', causalLabel: 'Rantai Kausal', probSuffix: 'peluang' },
  vi: { minSuffix: 'ph', causalLabel: 'Chuỗi nhân quả', probSuffix: 'xác suất' },
};

export function buildTrajectoryGraph(
  events: LiveEvent[],
  selectedEventId: string | null,
  forecasts: ForecastBranch[] = [],
  locale: AppLocale = 'ar'
): TrajectoryGraph {
  const nodes: TrajectoryNode[] = [];
  const edges: TrajectoryEdge[] = [];
  const gl = GRAPH_LABELS[locale];

  const spofMap = new Map<
    string,
    { count: number; sectors: Set<SectorType>; threat: ThreatMechanismId }
  >();

  const total = Math.max(1, events.length);
  const startX = 255;
  const endEventX = 610;
  const stepX = total > 1 ? (endEventX - startX) / (total - 1) : 0;

  events.forEach((ev, idx) => {
    const x = Math.round(total === 1 ? 390 : startX + idx * stepX);
    const y = TRACK_Y_LANE[ev.track] + (idx % 2 === 0 ? -10 : 10);
    const isSelected = selectedEventId === ev.id;

    nodes.push({
      id: ev.id,
      label: ev.title,
      sublabel: `${ev.elapsedMinutes} ${gl.minSuffix} · ${ev.reliabilityGrade}`,
      kind: 'event',
      x,
      y,
      sector: ev.sector,
      track: ev.track,
      threatMechanism: ev.threatMechanism,
      reliabilityGrade: ev.reliabilityGrade,
      active: isSelected,
      sequence: ev.sequence,
    });

    if (ev.parentEventId) {
      const parentExists = events.some((p) => p.id === ev.parentEventId);
      if (parentExists) {
        edges.push({
          id: `causal-${ev.parentEventId}-${ev.id}`,
          from: ev.parentEventId,
          to: ev.id,
          kind: 'causal',
          weight: RELIABILITY_WEIGHTS[ev.reliabilityGrade],
          label: gl.causalLabel,
          highlighted: isSelected || selectedEventId === ev.parentEventId,
        });
      }
    }

    const existingSpof = spofMap.get(ev.spofNode);
    if (existingSpof) {
      existingSpof.count += 1;
      existingSpof.sectors.add(ev.sector);
    } else {
      spofMap.set(ev.spofNode, {
        count: 1,
        sectors: new Set([ev.sector]),
        threat: ev.threatMechanism,
      });
    }
  });

  // SPOF / Threat Mechanism convergence nodes (x = 760)
  const spofEntries = Array.from(spofMap.entries()).slice(0, 4);
  spofEntries.forEach(([spofName, meta], idx) => {
    const spofId = `spof-${idx}`;
    const y = 112 + idx * 92;
    nodes.push({
      id: spofId,
      label: spofName,
      sublabel: `${getThreatCopy(meta.threat, locale).shortLabel} · ${meta.count}`,
      kind: 'spof',
      x: 760,
      y,
      threatMechanism: meta.threat,
      active: events.some(
        (e) => e.id === selectedEventId && e.spofNode === spofName
      ),
    });

    for (const ev of events) {
      if (ev.spofNode === spofName) {
        edges.push({
          id: `spof-edge-${ev.id}-${spofId}`,
          from: ev.id,
          to: spofId,
          kind: 'spof_link',
          weight: 0.7,
          highlighted: ev.id === selectedEventId,
        });
      }
    }
  });

  // 3 Macro Scenario nodes (x = 975)
  const probs = computeScenarioProbabilities(events);
  const scenarioNodes: { id: ScenarioId; y: number; pct: number }[] = [
    { id: 'adaptation', y: 118, pct: probs.adaptation },
    { id: 'fragmentation', y: 248, pct: probs.fragmentation },
    { id: 'fragility', y: 378, pct: probs.fragility },
  ];

  scenarioNodes.forEach((sc) => {
    const scCopy = getScenarioCopy(sc.id, locale);
    const scenarioNodeId = `scenario-${sc.id}`;
    nodes.push({
      id: scenarioNodeId,
      label: scCopy.title,
      sublabel: `${sc.pct}% ${gl.probSuffix}`,
      kind: 'scenario',
      x: 975,
      y: sc.y,
      scenarioId: sc.id,
      active: probs.dominant === sc.id,
    });

    const latestMatching = events
      .filter((ev) => {
        const d = ev.scenarioDelta;
        if (sc.id === 'adaptation') return d.adaptation >= 2;
        if (sc.id === 'fragmentation') return d.fragmentation >= 2;
        return d.fragility >= 2;
      })
      .slice(-2);

    latestMatching.forEach((ev) => {
      const spofIdx = spofEntries.findIndex(([name]) => name === ev.spofNode);
      const sourceId = spofIdx >= 0 ? `spof-${spofIdx}` : ev.id;
      const edgeId = `proj-${sourceId}-${scenarioNodeId}`;
      if (!edges.some((e) => e.id === edgeId)) {
        edges.push({
          id: edgeId,
          from: sourceId,
          to: scenarioNodeId,
          kind: 'scenario_projection',
          weight: sc.pct / 100,
          highlighted: probs.dominant === sc.id || ev.id === selectedEventId,
        });
      }
    });
  });

  // Forecast Horizon Nodes (x = 1200)
  forecasts.slice(0, 3).forEach((fc, idx) => {
    const fcId = fc.id;
    const scenarioY =
      fc.targetScenario === 'adaptation'
        ? 118
        : fc.targetScenario === 'fragmentation'
        ? 248
        : 378;

    nodes.push({
      id: fcId,
      label: fc.title,
      sublabel: `${fc.horizonLabel} · ${fc.probability}%`,
      kind: 'forecast',
      x: 1200,
      y: scenarioY,
      scenarioId: fc.targetScenario,
      threatMechanism: fc.threatMechanism,
      active: idx === 0,
    });

    edges.push({
      id: `fc-edge-${fc.targetScenario}-${fcId}`,
      from: `scenario-${fc.targetScenario}`,
      to: fcId,
      kind: 'forecast_vector',
      weight: fc.probability / 100,
      highlighted: idx === 0,
    });
  });

  const activeSpofs = Array.from(spofMap.entries())
    .map(([name, meta]) => ({
      name,
      eventCount: meta.count,
      sectors: Array.from(meta.sectors),
    }))
    .sort((a, b) => b.eventCount - a.eventCount);

  return { nodes, edges, activeSpofs };
}

const FILM_BEAT_LOCALE: Record<
  AppLocale,
  {
    scenePrefix: string;
    protagonists: string;
    tones: Record<ScenarioId, string>;
  }
> = {
  ar: {
    scenePrefix: 'المشهد',
    protagonists: 'رئيسة مهندسي الشبكة، محلل مخاطر السيولة، ومسؤول التحقق الجنائي',
    tones: {
      adaptation: 'تحوّل طارئ نحو فصل البنى السحابية وتفعيل بروتوكول الصمود.',
      fragmentation: 'إغلاق رقمي متسارع لبوابات العبور الدولية وتقسيم الشبكة.',
      fragility: 'تذبذب حاد في التداول الخوارزمي مع عجز تشريعي عن احتواء التتابع.',
    },
  },
  en: {
    scenePrefix: 'Scene',
    protagonists: 'Lead Network Architect, Liquidity Risk Analyst & Forensic Officer',
    tones: {
      adaptation: 'Emergency pivot to multi-cloud isolation and institutional resilience protocols.',
      fragmentation: 'Rapid sovereign air-gapping across intercontinental routing gateways.',
      fragility: 'Severe HFT algorithmic volatility amidst regulatory lag.',
    },
  },
  fr: {
    scenePrefix: 'Scène',
    protagonists: 'Architecte Réseau, Analyste Liquidité & Responsable Forensique',
    tones: {
      adaptation: 'Bascule d’urgence vers l’isolation multi-cloud et les protocoles de résilience.',
      fragmentation: 'Fermeture souveraine rapide des passerelles intercontinentales.',
      fragility: 'Volatilité HFT extrême face à la lenteur réglementaire.',
    },
  },
  id: {
    scenePrefix: 'Adegan',
    protagonists: 'Arsitek Jaringan Utama, Analis Likuiditas & Petugas Forensik',
    tones: {
      adaptation: 'Langkah darurat menuju isolasi multi-cloud dan protokol ketahanan.',
      fragmentation: 'Pemutusan cepat gerbang lintas benua secara berdaulat.',
      fragility: 'Volatilitas tajam perdagangan algoritmik di tengah kelambatan tata kelola.',
    },
  },
  vi: {
    scenePrefix: 'Cảnh',
    protagonists: 'Kiến Trúc Sư Mạng, Chuyên Viên Thanh Khoản & Điều Tra Pháp Y',
    tones: {
      adaptation: 'Chuyển hướng khẩn cấp sang cô lập đa đám mây và giao thức phục hồi.',
      fragmentation: 'Ngắt kết nối nhanh các cổng định tuyến liên lục địa.',
      fragility: 'Biến động giao dịch thuật toán dữ dội khi cơ chế quản trị chậm phản ứng.',
    },
  },
};

export function generateFilmBeatFromEvent(
  event: LiveEvent,
  probs: ScenarioProbabilities,
  beatIndex: number,
  locale: AppLocale = 'ar'
): FilmSceneBeat {
  const act: 'I' | 'II' | 'III' =
    beatIndex <= 2 ? 'I' : beatIndex <= 5 ? 'II' : 'III';
  const fl = FILM_BEAT_LOCALE[locale];
  const sectorLabel = getSectorCopy(event.sector, locale);

  return {
    id: `scene-${event.id}`,
    act,
    sceneNumber: beatIndex,
    timecode: `T+${String(event.elapsedMinutes).padStart(3, '0')}m`,
    location: `${event.coordinates.city} (${event.coordinates.lat.toFixed(2)}°, ${event.coordinates.lng.toFixed(2)}°)`,
    title: `${fl.scenePrefix} ${beatIndex}: ${event.title}`,
    protagonists: fl.protagonists,
    groundedReality: `${event.summary} (${sectorLabel} — ${event.reliabilityGrade} · SPOF: ${event.spofNode}).`,
    dramaticConflict: `${fl.tones[probs.dominant]} (${event.marketImpactBps} bps · Disinfo ${event.disinfoVelocity}%)`,
    dialogueExcerpt:
      locale === 'ar'
        ? `«نحن لا نواجه شائعة في الفضاء العام، بل اختناقاً حقيقياً في ${event.spofNode}. افصلوا المسار الاحتياطي قبل أن تتضاعف أوامر البيع الآلي.»`
        : `"This isn't online noise—it's a live structural bottleneck at ${event.spofNode}. Isolate the failover path before automated hedging cascades."`,
    linkedEventId: event.id,
    dominantScenarioAtBeat: probs.dominant,
  };
}

const VALIDATION_MESSAGES: Record<
  AppLocale,
  { title: string; summary: string; sourceName: string; spofNode: string }
> = {
  ar: {
    title: 'يرجى إدخال عنوان واضح للحدث (4 أحرف على الأقل).',
    summary: 'يرجى كتابة وصف تفصيلي للحدث (10 أحرف على الأقل).',
    sourceName: 'يرجى تحديد المصدر المبلّغ (مثل سجل BGP أو هيئة طيران).',
    spofNode: 'يرجى تحديد نقطة الفشل أو العقدة التقنية المرتبطة.',
  },
  en: {
    title: 'Please provide a clear event title (at least 4 characters).',
    summary: 'Please enter a detailed summary (at least 10 characters).',
    sourceName: 'Please specify the reporting source (e.g. RIPE BGP or aviation agency).',
    spofNode: 'Please specify the single point of failure / affected node.',
  },
  fr: {
    title: 'Veuillez saisir un titre clair (au moins 4 caractères).',
    summary: 'Veuillez rédiger une description détaillée (au moins 10 caractères).',
    sourceName: 'Veuillez indiquer la source signalante (ex. RIPE BGP).',
    spofNode: 'Veuillez préciser le point de défaillance (SPOF).',
  },
  id: {
    title: 'Masukkan judul kejadian yang jelas (minimal 4 karakter).',
    summary: 'Tulis ringkasan terperinci kejadian (minimal 10 karakter).',
    sourceName: 'Tentukan sumber pelapor (mis. log BGP atau otoritas).',
    spofNode: 'Tentukan titik kegagalan atau simpul terkait (SPOF).',
  },
  vi: {
    title: 'Vui lòng nhập tiêu đề sự kiện rõ ràng (ít nhất 4 ký tự).',
    summary: 'Vui lòng mô tả chi tiết sự kiện (ít nhất 10 ký tự).',
    sourceName: 'Vui lòng nêu nguồn báo cáo (vd. nhật ký BGP hoặc cơ quan hàng không).',
    spofNode: 'Vui lòng xác định điểm lỗi đơn (SPOF) liên quan.',
  },
};

export function validateEventInput(
  input: Partial<EventDraftInput>,
  locale: AppLocale = 'ar'
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const msg = VALIDATION_MESSAGES[locale];

  if (!input.title || input.title.trim().length < 4) {
    errors.title = msg.title;
  }
  if (!input.summary || input.summary.trim().length < 10) {
    errors.summary = msg.summary;
  }
  if (!input.sourceName || input.sourceName.trim().length < 2) {
    errors.sourceName = msg.sourceName;
  }
  if (!input.spofNode || input.spofNode.trim().length < 2) {
    errors.spofNode = msg.spofNode;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildDeterministicEventAnalysis(
  input: EventDraftInput,
  sequence: number,
  elapsedMinutes: number,
  locale: AppLocale = 'ar'
): LiveEvent {
  const isHighReliability =
    input.reliabilityGrade === 'A1' || input.reliabilityGrade === 'B2';
  const isDisinfoHeavy = input.disinfoVelocity >= 65;

  const fallbackCoords = DEFAULT_COORDS_BY_SECTOR[input.sector];
  const coordinates: GeoCoordinates = {
    lat: typeof input.lat === 'number' && !Number.isNaN(input.lat) ? input.lat : fallbackCoords.lat,
    lng: typeof input.lng === 'number' && !Number.isNaN(input.lng) ? input.lng : fallbackCoords.lng,
    city: input.city?.trim() || fallbackCoords.city,
    regionCode: fallbackCoords.regionCode,
    asnOrHub: fallbackCoords.asnOrHub,
  };

  const defaultLayerBySector: Record<SectorType, PlatformLayerId> = {
    telecom: 'cloud_routing',
    finance: 'financial_hft',
    aviation: 'energy_maritime',
    energy: 'energy_maritime',
    media: 'social_swarm',
  };

  const isAr = locale === 'ar';
  const achEvidence: ACHEvidenceMap = {
    human_error: {
      polarity: input.sector === 'telecom' ? 'supports' : 'neutral',
      weight: input.sector === 'telecom' ? 1 : 1.5,
      note: isAr
        ? 'احتمال خطأ تهيئة أثناء نافذة التحديثات.'
        : 'Possible routing or config mistake during update window.',
    },
    infra_failure: {
      polarity: input.latencySpikeMs >= 200 ? 'supports' : 'falsifies',
      weight: input.latencySpikeMs >= 200 ? 1 : 2.2,
      note:
        input.latencySpikeMs >= 200
          ? isAr
            ? 'ارتفاع زمن الاستجابة يدعم فرضية إخفاق العقدة المادية.'
            : 'Elevated latency supports physical node failure hypothesis.'
          : isAr
          ? 'غياب تدهور زمن الاستجابة المادي يُضعف فرضية العطل الفيزيائي.'
          : 'No physical latency degradation weakens hardware-failure claim.',
    },
    cyber_attack: {
      polarity:
        input.track === 'osint' && isHighReliability ? 'supports' : 'neutral',
      weight: 1.5,
      note: isAr
        ? 'يتطلب التحقق من تواقيع الحزم وسجلات الدخول غير المصرح.'
        : 'Requires packet signature verification and unauthorized access audit.',
    },
    disinfo_cascade: {
      polarity: isDisinfoHeavy ? 'supports' : 'falsifies',
      weight: isDisinfoHeavy ? 0.5 : 2.5,
      note: isDisinfoHeavy
        ? isAr
          ? 'تسارع النشر المنسق يشير إلى استغلال إعلامي متزامن.'
          : 'Coordinated posting burst signals simultaneous media exploitation.'
        : isAr
        ? 'معدل الضوضاء المعلوماتية منخفض ولا يفسر الحادث التقني.'
        : 'Low narrative noise does not explain the underlying technical fault.',
    },
  };

  const scenarioDelta: ScenarioDelta = {
    adaptation: input.reliabilityGrade === 'A1' && input.marketImpactBps < 40 ? 4 : 1,
    fragmentation:
      input.sector === 'telecom' || input.sector === 'energy' ? 5 : 2,
    fragility:
      input.marketImpactBps >= 45 || input.disinfoVelocity >= 60 ? 6 : 3,
  };

  return {
    id: `ev-${Date.now()}-${sequence}`,
    sequence,
    timestamp: new Date().toISOString().slice(11, 19) + ' UTC',
    elapsedMinutes,
    title: input.title.trim(),
    summary: input.summary.trim(),
    technicalDetails: `(${coordinates.lat.toFixed(2)}°, ${coordinates.lng.toFixed(2)}°) · Latency +${input.latencySpikeMs}ms · Impact ${input.marketImpactBps} bps · Disinfo ${input.disinfoVelocity}%`,
    sector: input.sector,
    track: input.track,
    threatMechanism: input.threatMechanism,
    platformLayer: input.platformLayer || defaultLayerBySector[input.sector],
    coordinates,
    sourceName: input.sourceName.trim(),
    reliabilityGrade: input.reliabilityGrade,
    epistemicTier:
      input.epistemicTier ??
      (isDisinfoHeavy
        ? 'symbolic'
        : input.reliabilityGrade === 'A1'
        ? 'documented'
        : input.reliabilityGrade === 'B2'
        ? 'plausible'
        : 'speculative'),
    qKeyDomain: input.qKeyDomain ?? 'trump_era',
    spofNode: input.spofNode.trim(),
    bgpAnomalyFlag: input.sector === 'telecom' || input.latencySpikeMs > 250,
    latencySpikeMs: input.latencySpikeMs,
    marketImpactBps: input.marketImpactBps,
    disinfoVelocity: input.disinfoVelocity,
    parentEventId: input.parentEventId,
    achEvidence,
    scenarioDelta,
    redTeamCounter: isAr
      ? 'فحص الفريق الأحمر: قد يكون التزامن ناتجاً عن إعادة توجيه وقائية آلية وليس عن انهيار سلسلة التوريد بالكامل.'
      : 'Red Team check: temporal overlap may reflect automated precautionary failover rather than systemic breakdown.',
  };
}

const DOSSIER_LOCALE_TEXT: Record<
  AppLocale,
  {
    eventBadgePrefix: string;
    forecastBadgePrefix: string;
    stage1Event: string;
    stage2Event: string;
    stage3Event: string;
    stage1Fc: string;
    stage2Fc: string;
    stage3Fc: string;
    originIn: string;
    extendedFrom: string;
    recordedVia: string;
    spreadDist: string;
    ledDirectly: string;
    escalationCond: string;
    spofLabel: string;
    achTopLabel: string;
    dualMapLabel: string;
    sourceRelLabel: string;
    piHarmonicLabel: string;
    redTeamLabel: string;
    forecastNarrativePre: string;
    targetInfraIn: string;
    nowLabel: string;
    protagonistsFc: string;
    peakTitlePrefix: string;
  }
> = {
  ar: {
    eventBadgePrefix: 'خبر مرصود',
    forecastBadgePrefix: 'توقع استشرافي قادم',
    stage1Event: '1. الشرارة والجذر السببي',
    stage2Event: '2. الحدث اللحظي الحالي',
    stage3Event: '3. التداعيات والتوقع القادم',
    stage1Fc: '1. نقطة الانطلاق الحالية',
    stage2Fc: '2. مسار الانتشار المتوقع',
    stage3Fc: '3. مآل السيناريو الكامل',
    originIn: 'نقطة انطلاق أولى في',
    extendedFrom: 'امتداد من:',
    recordedVia: 'سُجل عبر',
    spreadDist: 'انتقال الأثر عبر مسافة',
    ledDirectly: 'أدى مباشرة إلى:',
    escalationCond: 'شرط التصعيد:',
    spofLabel: 'نقطة الفشل:',
    achTopLabel: 'الترجيح الخلفي (ACH):',
    dualMapLabel: 'اقتران خريطة المجلة (2027) × خريطة QAnon بمعامل',
    sourceRelLabel: 'موثوقية المصدر:',
    piHarmonicLabel: 'معامل π التوافقي:',
    redTeamLabel: 'الفريق الأحمر:',
    forecastNarrativePre: 'يتوقع النموذج تحوّل الأزمة نحو',
    targetInfraIn: 'البنية المستهدفة في',
    nowLabel: 'الآن',
    protagonistsFc: 'رئيسة مهندسي الشبكة العالمية، محافظ التسويات الدولية، وفريق رصد السرديات',
    peakTitlePrefix: 'ذروة المسار المتوقع:',
  },
  en: {
    eventBadgePrefix: 'Observed News',
    forecastBadgePrefix: 'Upcoming Forecast',
    stage1Event: '1. Spark & Root Cause',
    stage2Event: '2. Live Observed Event',
    stage3Event: '3. Spillover & Next Trajectory',
    stage1Fc: '1. Current Origin Node',
    stage2Fc: '2. Projected Propagation Path',
    stage3Fc: '3. Full Scenario Outcome',
    originIn: 'Initial origin in',
    extendedFrom: 'Propagated from:',
    recordedVia: 'Logged via',
    spreadDist: 'Great-circle shock transfer:',
    ledDirectly: 'Triggered next event:',
    escalationCond: 'Escalation condition:',
    spofLabel: 'Linked SPOF:',
    achTopLabel: 'ACH Ranking #1:',
    dualMapLabel: 'Economist 2027 × QAnon cross-map resonance factor',
    sourceRelLabel: 'Source reliability:',
    piHarmonicLabel: 'Pi harmonic:',
    redTeamLabel: 'Red Team check:',
    forecastNarrativePre: 'Trajectory model projects escalation toward',
    targetInfraIn: 'Target infrastructure in',
    nowLabel: 'Now',
    protagonistsFc: 'Global Network Architect, Clearing Governor & Disinfo Watch',
    peakTitlePrefix: 'Projected Climax:',
  },
  fr: {
    eventBadgePrefix: 'Fait Observé',
    forecastBadgePrefix: 'Prévision Stratégique',
    stage1Event: '1. Étincelle & Cause Racine',
    stage2Event: '2. Événement en Direct',
    stage3Event: '3. Répercussions & Suite',
    stage1Fc: '1. Point de Départ Actuel',
    stage2Fc: '2. Trajectoire Projetée',
    stage3Fc: '3. Aboutissement du Scénario',
    originIn: 'Point d’origine initial à',
    extendedFrom: 'Propagé depuis :',
    recordedVia: 'Enregistré via',
    spreadDist: 'Transfert géodésique :',
    ledDirectly: 'A déclenché directement :',
    escalationCond: 'Condition d’escalade :',
    spofLabel: 'Point unique (SPOF) :',
    achTopLabel: 'Hypothèse ACH #1 :',
    dualMapLabel: 'Couplage Économiste 2027 × QAnon facteur',
    sourceRelLabel: 'Fiabilité source :',
    piHarmonicLabel: 'Harmonique π :',
    redTeamLabel: 'Revue Red Team :',
    forecastNarrativePre: 'Le modèle anticipe une bascule vers',
    targetInfraIn: 'Infrastructure ciblée :',
    nowLabel: 'Maintenant',
    protagonistsFc: 'Architecte Réseau Mondial, Régulateur Financier & Cellule OSINT',
    peakTitlePrefix: 'Apogée Projeté :',
  },
  id: {
    eventBadgePrefix: 'Berita Terpantau',
    forecastBadgePrefix: 'Proyeksi Mendatang',
    stage1Event: '1. Pemicu & Akar Masalah',
    stage2Event: '2. Kejadian Langsung Saat Ini',
    stage3Event: '3. Dampak Lanjutan & Proyeksi',
    stage1Fc: '1. Titik Awal Saat Ini',
    stage2Fc: '2. Jalur Penjalaran Terproyeksi',
    stage3Fc: '3. Hasil Akhir Skenario',
    originIn: 'Titik awal pertama di',
    extendedFrom: 'Menjalar dari:',
    recordedVia: 'Tercatat melalui',
    spreadDist: 'Jarak sebaran geodesik:',
    ledDirectly: 'Memicu langsung:',
    escalationCond: 'Syarat eskalasi:',
    spofLabel: 'Simpul SPOF:',
    achTopLabel: 'Peringkat ACH #1:',
    dualMapLabel: 'Korelasi Sampul 2027 × Peta QAnon faktor',
    sourceRelLabel: 'Keandalan sumber:',
    piHarmonicLabel: 'Harmonik π:',
    redTeamLabel: 'Tinjauan Red Team:',
    forecastNarrativePre: 'Model memproyeksikan pergeseran krisis menuju',
    targetInfraIn: 'Infrastruktur target di',
    nowLabel: 'Saat ini',
    protagonistsFc: 'Arsitek Jaringan Global, Gubernur Kliring & Tim OSINT',
    peakTitlePrefix: 'Puncak Lintasan Terproyeksi:',
  },
  vi: {
    eventBadgePrefix: 'Tin Đã Ghi Nhận',
    forecastBadgePrefix: 'Dự Báo Sắp Tới',
    stage1Event: '1. Khởi Phát & Nguyên Nhân Gốc',
    stage2Event: '2. Sự Kiện Trực Tiếp Hiện Tại',
    stage3Event: '3. Hệ Quả & Quỹ Đạo Tiếp Theo',
    stage1Fc: '1. Điểm Khởi Đầu Hiện Tại',
    stage2Fc: '2. Lộ Trình Lan Truyền Dự Kiến',
    stage3Fc: '3. Kết Cục Kịch Bản Toàn Diện',
    originIn: 'Điểm khởi phát đầu tiên tại',
    extendedFrom: 'Lan truyền từ:',
    recordedVia: 'Ghi nhận qua',
    spreadDist: 'Khoảng cách lan truyền trắc địa:',
    ledDirectly: 'Dẫn trực tiếp đến:',
    escalationCond: 'Điều kiện leo thang:',
    spofLabel: 'Điểm lỗi SPOF:',
    achTopLabel: 'Giả thuyết ACH #1:',
    dualMapLabel: 'Liên kết Bìa 2027 × Bản đồ QAnon hệ số',
    sourceRelLabel: 'Độ tin cậy nguồn:',
    piHarmonicLabel: 'Điều hòa π:',
    redTeamLabel: 'Kiểm tra Red Team:',
    forecastNarrativePre: 'Mô hình dự báo khủng hoảng chuyển hướng sang',
    targetInfraIn: 'Hạ tầng mục tiêu tại',
    nowLabel: 'Hiện tại',
    protagonistsFc: 'Kiến Trúc Sư Mạng Toàn Cầu, Thống Đốc Thanh Toán & Tổ OSINT',
    peakTitlePrefix: 'Đỉnh Kịch Bản Dự Báo:',
  },
};

export function buildFullScenarioDossier(
  selected: SelectedMapItem,
  events: LiveEvent[],
  forecasts: ForecastBranch[],
  probabilities: ScenarioProbabilities,
  achRankings: HypothesisRanking[],
  mathMetrics: MathTrajectoryMetrics,
  locale: AppLocale = 'ar'
): FullScenarioDossier | null {
  const topHypothesis = achRankings[0];
  const dl = DOSSIER_LOCALE_TEXT[locale];

  if (selected.kind === 'event') {
    const ev = events.find((e) => e.id === selected.id);
    if (!ev) return null;

    const parent = ev.parentEventId
      ? events.find((p) => p.id === ev.parentEventId) ?? null
      : null;
    const childEvents = events.filter((e) => e.parentEventId === ev.id);
    const matchingForecast =
      forecasts.find((f) => f.threatMechanism === ev.threatMechanism) ??
      forecasts[0];

    const scId = probabilities.dominant;
    const scCopy = getScenarioCopy(scId, locale);
    const threatCopy = getThreatCopy(ev.threatMechanism, locale);
    const platformCopy = getPlatformCopy(ev.platformLayer, locale);
    const sectorLabel = getSectorCopy(ev.sector, locale);
    const scene =
      ev.filmScene ??
      generateFilmBeatFromEvent(ev, probabilities, ev.sequence, locale);

    const spanFromParent = parent
      ? computeGreatCircleKm(
          parent.coordinates.lat,
          parent.coordinates.lng,
          ev.coordinates.lat,
          ev.coordinates.lng
        )
      : null;

    const stages = [
      {
        phase: dl.stage1Event,
        title: parent
          ? `${dl.extendedFrom} ${parent.title} (${parent.coordinates.city})`
          : `${dl.originIn} ${ev.coordinates.city}`,
        detail: parent
          ? `${dl.spreadDist} ${spanFromParent} km → ${ev.spofNode} (${threatCopy.shortLabel}).`
          : `${dl.recordedVia} ${ev.sourceName} (${ev.reliabilityGrade}).`,
        timeframe: parent ? `T+${parent.elapsedMinutes}m` : `T+${ev.elapsedMinutes}m`,
      },
      {
        phase: dl.stage2Event,
        title: ev.title,
        detail: `${ev.summary} (${ev.technicalDetails})`,
        timeframe: `T+${ev.elapsedMinutes}m`,
      },
      {
        phase: dl.stage3Event,
        title:
          childEvents.length > 0
            ? `${dl.ledDirectly} ${childEvents[0].title}`
            : matchingForecast?.title ?? scCopy.title,
        detail:
          childEvents.length > 0
            ? `${childEvents[0].summary} — ${scCopy.title} (${probabilities[scId]}%).`
            : `${matchingForecast?.mapLinkSummary ?? scCopy.summary} ${dl.escalationCond} ${matchingForecast?.triggerCondition ?? scCopy.earlyWarning}`,
        timeframe:
          childEvents.length > 0
            ? `T+${childEvents[0].elapsedMinutes}m`
            : matchingForecast?.horizonLabel ?? 'T+Next',
      },
    ];

    return {
      kind: 'event',
      id: ev.id,
      badgeLabel: `${dl.eventBadgePrefix} #${ev.sequence} · ${sectorLabel}`,
      headline: ev.title,
      subheadline: `${ev.coordinates.city} — ${platformCopy.shortLabel}`,
      city: ev.coordinates.city,
      coordinatesLabel: `${ev.coordinates.lat.toFixed(2)}°, ${ev.coordinates.lng.toFixed(2)}° · ${ev.coordinates.asnOrHub}`,
      platformLabel: platformCopy.label,
      threatLabel: threatCopy.label,
      epistemicTier:
        ev.epistemicTier ??
        (ev.reliabilityGrade === 'A1' ? 'documented' : 'plausible'),
      qKeyDomain: ev.qKeyDomain ?? 'trump_era',
      scenarioId: scId,
      scenarioTitle: scCopy.title,
      scenarioProbability: probabilities[scId],
      executiveNarrative: `${ev.summary} → ${scCopy.title} (${probabilities[scId]}%) · ${ev.marketImpactBps} bps · Disinfo ${ev.disinfoVelocity}%.`,
      stages,
      triggerOrCause: `${dl.spofLabel} ${ev.spofNode} — ${dl.achTopLabel} ${topHypothesis?.label ?? '—'}.`,
      earlyWarning: scCopy.earlyWarning,
      dualMapInsight: `${threatCopy.shortLabel} · ${dl.dualMapLabel} ${mathMetrics.crossMapResonance}.`,
      backendSummary: `${dl.sourceRelLabel} ${getReliabilityCopy(ev.reliabilityGrade, locale)} · ${dl.piHarmonicLabel} ${mathMetrics.piPhaseHarmonic} · ${dl.redTeamLabel} ${ev.redTeamCounter}`,
      filmScene: scene,
      sourceEvent: ev,
    };
  }

  const fc = forecasts.find((f) => f.id === selected.id);
  if (!fc) return null;

  const scCopy = getScenarioCopy(fc.targetScenario, locale);
  const threatCopy = getThreatCopy(fc.threatMechanism, locale);
  const latestEvent = events[events.length - 1] ?? null;
  const spanFromLatest = latestEvent
    ? computeGreatCircleKm(
        latestEvent.coordinates.lat,
        latestEvent.coordinates.lng,
        fc.projectedCoords.lat,
        fc.projectedCoords.lng
      )
    : 0;

  const projectedFilmScene: FilmSceneBeat = {
    id: `scene-${fc.id}`,
    act: 'III',
    sceneNumber: events.length + 1,
    timecode: fc.horizonLabel,
    location: `${fc.projectedCoords.city} (${fc.projectedCoords.lat.toFixed(2)}°, ${fc.projectedCoords.lng.toFixed(2)}°)`,
    title: `${dl.peakTitlePrefix} ${fc.title}`,
    protagonists: dl.protagonistsFc,
    groundedReality: `${fc.mapLinkSummary} (${spanFromLatest} km · ${fc.projectedCoords.asnOrHub}).`,
    dramaticConflict: `${scCopy.title} (${fc.probability}%) — ${fc.triggerCondition}`,
    dialogueExcerpt:
      locale === 'ar'
        ? `«المؤشرات الكروية تُظهر أن الموجة القادمة ستصل إلى ${fc.projectedCoords.city} خلال ${fc.etaMinutes} دقيقة.. إما أن نفتح السجلات التقنية الآن أو تنقسم الشبكة أمام أعيننا.»`
        : `"Spherical metrics show the next shock wave reaching ${fc.projectedCoords.city} in ${fc.etaMinutes} minutes—open the signed telemetry now or the network fragments."`,
    linkedEventId: latestEvent?.id ?? 'ev-01',
    dominantScenarioAtBeat: fc.targetScenario,
  };

  return {
    kind: 'forecast',
    id: fc.id,
    badgeLabel: `${dl.forecastBadgePrefix} · ${fc.horizonLabel}`,
    headline: fc.title,
    subheadline: `${fc.projectedCoords.city} — ${scCopy.title}`,
    city: fc.projectedCoords.city,
    coordinatesLabel: `${fc.projectedCoords.lat.toFixed(2)}°, ${fc.projectedCoords.lng.toFixed(2)}° · ${fc.projectedCoords.asnOrHub}`,
    platformLabel: `${dl.targetInfraIn} ${fc.projectedCoords.regionCode}`,
    threatLabel: threatCopy.label,
    epistemicTier: fc.targetScenario === 'adaptation' ? 'documented' : 'plausible',
    qKeyDomain: 'trump_era',
    scenarioId: fc.targetScenario,
    scenarioTitle: scCopy.title,
    scenarioProbability: fc.probability,
    executiveNarrative: `${dl.forecastNarrativePre} «${fc.title}» (${fc.projectedCoords.city}, ${fc.probability}% · ${fc.horizonLabel}, CQ×E = ${mathMetrics.crossMapResonance}).`,
    stages: [
      {
        phase: dl.stage1Fc,
        title: latestEvent ? latestEvent.title : scCopy.title,
        detail: latestEvent
          ? `${latestEvent.coordinates.city} (${latestEvent.spofNode}) · ${latestEvent.marketImpactBps} bps.`
          : scCopy.summary,
        timeframe: latestEvent ? `T+${latestEvent.elapsedMinutes}m` : dl.nowLabel,
      },
      {
        phase: dl.stage2Fc,
        title: `${fc.projectedCoords.city} (${spanFromLatest} km)`,
        detail: `${threatCopy.description} ${fc.mapLinkSummary}`,
        timeframe: fc.horizonLabel,
      },
      {
        phase: dl.stage3Fc,
        title: scCopy.title,
        detail: scCopy.summary,
        timeframe: fc.horizonLabel,
      },
    ],
    triggerOrCause: fc.triggerCondition,
    earlyWarning: scCopy.earlyWarning,
    dualMapInsight: fc.mapLinkSummary,
    backendSummary: `${fc.probability}% · Hπ=${mathMetrics.entropyBasePi} · ${dl.achTopLabel} ${topHypothesis?.label ?? '—'}`,
    filmScene: projectedFilmScene,
    sourceForecast: fc,
  };
}

