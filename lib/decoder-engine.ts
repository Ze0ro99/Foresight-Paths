import {
  CoincidenceStats,
  EpistemicTier,
  GematriaCollision,
  GematriaResult,
  QClockProjection,
  QKeyDomainId,
  VortexStep,
} from './types';

export const BENCHMARK_DECODER_TERMS = [
  'Q',
  'PI',
  'PI NETWORK',
  'QFS',
  'NESARA',
  'GESARA',
  'GREAT AWAKENING',
  'DONALD TRUMP',
  'SWIFT',
  'ISO',
] as const;

const JEWISH_LATIN_MAP: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  K: 10,
  L: 20,
  M: 30,
  N: 40,
  O: 50,
  P: 60,
  Q: 70,
  R: 80,
  S: 90,
  T: 100,
  U: 200,
  X: 300,
  Y: 400,
  Z: 500,
  J: 600,
  V: 700,
  W: 900,
};

export function digitalRoot(n: number): number {
  const abs = Math.abs(Math.floor(n));
  if (abs === 0) return 0;
  return ((abs - 1) % 9) + 1;
}

export function mirrorNumber(n: number): number {
  const s = String(Math.abs(Math.floor(n)));
  if (s.length <= 1) return n;
  return Number(s.split('').reverse().join(''));
}

/**
 * Computes all 6 parallel Q-Decoder Gematria ciphers for any English input.
 * Ignores spaces, digits, and punctuation identically to standard decoder calculators.
 */
export function computeGematria(
  phrase: string,
  mode: 'all' | 'capitals_only' = 'all'
): GematriaResult {
  const rawLetters =
    mode === 'capitals_only'
      ? phrase.replace(/[^A-Z]/g, '')
      : phrase.toUpperCase().replace(/[^A-Z]/g, '');

  let englishOrdinal = 0;
  let reverseOrdinal = 0;
  let fullReduction = 0;
  let reverseFullReduction = 0;
  let englishSumerian = 0;
  let jewishLatin = 0;

  for (let i = 0; i < rawLetters.length; i++) {
    const ord = rawLetters.charCodeAt(i) - 64; // A=1 .. Z=26
    const rev = 27 - ord;
    const red = ((ord - 1) % 9) + 1;
    const revRed = ((rev - 1) % 9) + 1;

    englishOrdinal += ord;
    reverseOrdinal += rev;
    fullReduction += red;
    reverseFullReduction += revRed;
    englishSumerian += ord * 6;
    jewishLatin += JEWISH_LATIN_MAP[rawLetters[i]] ?? 0;
  }

  const uniqueMirrors = Array.from(
    new Set([
      mirrorNumber(englishOrdinal),
      mirrorNumber(reverseOrdinal),
      mirrorNumber(fullReduction),
      mirrorNumber(englishSumerian),
    ])
  ).filter((v) => v > 0);

  return {
    phrase,
    normalized: rawLetters,
    letterCount: rawLetters.length,
    englishOrdinal,
    reverseOrdinal,
    fullReduction,
    digitalRoot: digitalRoot(fullReduction),
    reverseFullReduction,
    englishSumerian,
    jewishLatin,
    ordinalSumCheck: englishOrdinal + reverseOrdinal, // Always equals 27 * n
    mirroredValues: uniqueMirrors,
  };
}

/**
 * Finds cross-cipher numerical collisions across a list of phrases
 * (e.g., NESARA Ordinal 58 === SWIFT Reverse Ordinal 58, PI Red 16 === ISO Red 16).
 */
export function findGematriaCollisions(
  phrases: readonly string[]
): GematriaCollision[] {
  const results = phrases.map((p) => computeGematria(p));
  const cipherLabels: {
    key: keyof Pick<
      GematriaResult,
      | 'englishOrdinal'
      | 'reverseOrdinal'
      | 'fullReduction'
      | 'reverseFullReduction'
      | 'englishSumerian'
      | 'jewishLatin'
    >;
    label: string;
  }[] = [
    { key: 'englishOrdinal', label: 'الترتيبية الإنجليزية' },
    { key: 'reverseOrdinal', label: 'الترتيب المعكوس' },
    { key: 'fullReduction', label: 'الاختزال الكامل' },
    { key: 'reverseFullReduction', label: 'الاختزال المعكوس' },
    { key: 'englishSumerian', label: 'السومرية (×6)' },
    { key: 'jewishLatin', label: 'الجدول اللاتيني الموسع' },
  ];

  const collisions: GematriaCollision[] = [];
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      for (const ca of cipherLabels) {
        for (const cb of cipherLabels) {
          const valA = results[i][ca.key];
          const valB = results[j][cb.key];
          if (valA > 0 && valA === valB) {
            collisions.push({
              termA: results[i].phrase,
              cipherA: ca.label,
              termB: results[j].phrase,
              cipherB: cb.label,
              value: valA,
            });
          }
        }
      }
    }
  }
  return collisions;
}

/**
 * Exact statistical coincidence formula: P(match >= 1) = 1 - (1 - K / M)^(C * W)
 */
export function computeCoincidenceProbability(
  ciphers = 6,
  words = 50,
  targets = 10,
  rangeSize = 350
): CoincidenceStats {
  const c = Math.max(1, Math.round(ciphers));
  const w = Math.max(1, Math.round(words));
  const k = Math.max(1, Math.min(rangeSize, Math.round(targets)));
  const m = Math.max(20, Math.round(rangeSize));
  const trials = c * w;
  const pNone = Math.pow(1 - k / m, trials);
  const pct = Number(((1 - pNone) * 100).toFixed(3));

  return {
    ciphers: c,
    words: w,
    targets: k,
    rangeSize: m,
    trials,
    matchProbabilityPct: Math.min(100, pct),
  };
}

/**
 * 60-sector Q-Clock dial geometry (6° per sector):
 * - Radial match: t2 ≡ t1 (mod 60) across concentric 60-day spirals
 * - Opposite projection: t2 ≡ t1 + 30 (mod 60) across center
 */
export function computeQClockProjection(dayOffset: number): QClockProjection {
  const normalized = ((Math.floor(dayOffset) % 60) + 60) % 60;
  const ring = Math.floor(Math.max(0, dayOffset) / 60) + 1;
  const angleDeg = normalized * 6;
  const oppositeSector = (normalized + 30) % 60;
  const oppositeAngleDeg = oppositeSector * 6;
  return {
    dayOffset: Math.floor(dayOffset),
    sector: normalized,
    ring,
    angleDeg,
    radialMatchOffset: normalized + 60,
    oppositeSector,
    oppositeAngleDeg,
    oppositeDayOffset: Math.floor(dayOffset) + 30,
  };
}

/**
 * Computes Tesla Vortex Math cycle: digital root of 2^n mod 9 => [1, 2, 4, 8, 7, 5] repeating.
 */
export function computeVortexSequence(steps = 9): VortexStep[] {
  const list: VortexStep[] = [];
  for (let exp = 0; exp < steps; exp++) {
    const val = Math.pow(2, exp);
    list.push({
      exponent: exp,
      powerOfTwo: val,
      digitalRoot: digitalRoot(val),
    });
  }
  return list;
}

export const EPISTEMIC_TIER_META: Record<
  EpistemicTier,
  {
    labelAr: string;
    labelEn: string;
    signalLabelAr: string;
    color: string;
    bgClass: string;
    descriptionAr: string;
    ruleAr: string;
  }
> = {
  documented: {
    labelAr: 'موثق',
    labelEn: 'Documented',
    signalLabelAr: 'إشارة خضراء',
    color: '#16A34A',
    bgClass: 'border-[#16A34A]/50 text-[#4ADE80]',
    descriptionAr: 'مدعوم بأدلة أولية أو سجلات تقنية ومصرفية رسمية متعددة.',
    ruleAr: 'يظهر في طبقة الأحداث الموثقة ويُسمح بإسقاطه كإحداثي مرجعي على الخريطة.',
  },
  plausible: {
    labelAr: 'محتمل',
    labelEn: 'Plausible',
    signalLabelAr: 'إشارة صفراء',
    color: '#EAB308',
    bgClass: 'border-[#EAB308]/50 text-[#FACC15]',
    descriptionAr: 'توجد قرائن ومصادر متعددة لكن التفسير السببي ما يزال غير محسوم.',
    ruleAr: 'يُوسم بتنبيه مراجعة مصادر ويتطلب تأكيداً من مشاركين موثقين بـ KYC.',
  },
  disputed: {
    labelAr: 'مختلف عليه',
    labelEn: 'Disputed',
    signalLabelAr: 'إشارة صفراء متنازع عليها',
    color: '#F59E0B',
    bgClass: 'border-[#F59E0B]/50 text-[#FBBF24]',
    descriptionAr: 'تتعارض بشأنه المصادر الموثوقة أو توجد تفسيرات متناقضة.',
    ruleAr: 'تُلزم المنصة بعرض الأدلة المؤيدة والمعارضة جنباً إلى جنب.',
  },
  speculative: {
    labelAr: 'تخميني',
    labelEn: 'Speculative',
    signalLabelAr: 'إشارة برتقالية',
    color: '#F97316',
    bgClass: 'border-[#F97316]/50 text-[#FB923C]',
    descriptionAr: 'يفتقر إلى دليل داعم كافٍ أو يعتمد على إفادات غير موثقة.',
    ruleAr: 'يُحصر في تبويب التحليلات الافتراضية ولا يُدمج مع سجل الأحداث الموثقة.',
  },
  symbolic: {
    labelAr: 'رمزي / تنبيه',
    labelEn: 'Symbolic / Alert',
    signalLabelAr: 'تنبيه طارئ أحمر',
    color: '#E11D48',
    bgClass: 'border-[#E11D48]/60 text-[#FDA4AF]',
    descriptionAr: 'ربط بالجيماتريا أو التوقيتات الرمزية؛ أو تنبيه سيبراني/ميداني طارئ.',
    ruleAr: 'يُعرض مع تنبيه ثابت بأن التجاور البصري أو التطابق الرقمي لا يثبت سببية واقعية.',
  },
};

export const QKEY_DOMAINS: {
  id: QKeyDomainId;
  index: number;
  labelAr: string;
  labelEn: string;
  color: string;
  examplesAr: string;
}[] = [
  {
    id: 'antiquity',
    index: 1,
    labelAr: 'العصور القديمة',
    labelEn: 'Antiquity',
    color: '#D97706',
    examplesAr: 'الحضارات القديمة، مصر وروما وأتلانتس والجذور الرمزية الباكرة.',
  },
  {
    id: 'premodern',
    index: 2,
    labelAr: 'ما قبل الحداثة',
    labelEn: 'Premodern',
    color: '#9333EA',
    examplesAr: 'الجمعيات السرية، فرسان الهيكل، الفاتيكان، والمؤسسات ما قبل الصناعية.',
  },
  {
    id: 'extraterrestrials',
    index: 3,
    labelAr: 'الكائنات الفضائية',
    labelEn: 'Extraterrestrials',
    color: '#06B6D4',
    examplesAr: 'مشروع الكتاب الأزرق، المنطقة 51، وسرديات البرنامج الفضائي السري.',
  },
  {
    id: 'nazi_era',
    index: 4,
    labelAr: 'الحقبة النازية',
    labelEn: 'Nazi Era',
    color: '#64748B',
    examplesAr: 'عملية مشبك الورق (Operation Paperclip) وبرامج نقل العلماء بعد 1945.',
  },
  {
    id: 'mk_ultra',
    index: 5,
    labelAr: 'التحكم بالعقول MK-Ultra',
    labelEn: 'MK-Ultra',
    color: '#EC4899',
    examplesAr: 'تجارب السيطرة الذهنية، الحرب النفسية، واستغلال المنصات الإعلامية.',
  },
  {
    id: 'depopulation',
    index: 6,
    labelAr: 'تخفيض السكان',
    labelEn: 'Depopulation',
    color: '#EF4444',
    examplesAr: 'المزاعم المرتبطة بأجندات ضبط السكان والأوبئة المصنّعة.',
  },
  {
    id: 'false_flags',
    index: 7,
    labelAr: 'العمليات المضللة',
    labelEn: 'False Flags',
    color: '#F59E0B',
    examplesAr: 'عملية نورثوودز وبيرل هاربر وإعادة تأويل الحوادث السيبرانية كـ Comms.',
  },
  {
    id: 'weather_warfare',
    index: 8,
    labelAr: 'حرب الطقس والممرات',
    labelEn: 'Weather Warfare',
    color: '#3B82F6',
    examplesAr: 'مزاعم الهندسة الجيولوجية واضطرابات الطاقة والممرات البحرية.',
  },
  {
    id: 'trump_era',
    index: 9,
    labelAr: 'حقبة ترامب وQAnon',
    labelEn: 'Trump Era',
    color: '#E11D48',
    examplesAr: 'قطرات Q، ويكيليكس، الجدل حول QFS، وإعادة تدوير تواريخ البث الطارئ.',
  },
];

export const CONSPIRACY_MAPS_CATALOG = [
  {
    id: 'great-awakening',
    nameAr: 'خريطة الصحوة الكبرى (Great Awakening Map)',
    designer: 'بارينيا تشامب (2018) / توثيق 2020',
    geometryAr: 'تدرج عمودي ثلاثي الطبقات من الدنيوي أسفلاً إلى الكوني والروحي في القمة.',
    layersAr: 'السفلية (السلطة والسياسة) · الوسطى (التاريخ البديل والكشف) · العليا (التأمل والوميض الشمسي).',
    keyNodesAr: 'المؤسسات السياسية، البرنامج الفضائي السري، Return to Source، زهرة الحياة.',
  },
  {
    id: 'q-web',
    nameAr: 'خريطة الدولة العميقة (Deep State Map / Q-Web)',
    designer: 'ديلان لويس مونرو (2017–2018)',
    geometryAr: 'عمود زمني مركزي يتفرع لجناحين: اليسار (التكنولوجيا/الروحانيات) واليمين (الحرب/العنف).',
    layersAr: '9 نطاقات لونية في Q-KEY من العصور القديمة حتى حقبة ترامب.',
    keyNodesAr: 'CIA, NSA, DARPA, Paperclip, Northwoods, ويكيليكس، الفاتيكان، بيلدربيرغ.',
  },
  {
    id: 'world-hierarchy',
    nameAr: 'هرم التسلسل العالمي (World Hierarchy Pyramid)',
    designer: 'ديلان لويس مونرو',
    geometryAr: 'هرم طبقي رأسي من 5 درجات متصاعدة رمزياً ومعدنياً.',
    layersAr: 'البرونز (العامة) ← الفضة (الهيكساغون والأوكتاغون) ← الذهب (السلالات) ← التكتايت ← الأثير (5D Chess).',
    keyNodesAr: 'الإعلام والمراقبة في القاعدة وصولاً إلى اللاهوت وشطرنج البعد الخامس.',
  },
  {
    id: 'cult-of-baal-gar',
    nameAr: 'خريطة عبادة بعل + خرائط COV1D-5G وRainbow Light Body',
    designer: 'مونرو / Great Awakening Report (2021–2026)',
    geometryAr: 'خط زمني رأسي (8 طبقات) + ماندالا دائرية بسبعة مستويات وعي ومقياس أدلة خمسي.',
    layersAr: 'الشرق القديم ← روما ونيقية ← العصور الوسطى؛ إضافةً لإشارات أخضر/أصفر/برتقالي/أحمر.',
    keyNodesAr: 'الطب البديل، القبعات البيضاء (White Hats)، خوارزميات الجيل الخامس، وQFS.',
  },
];

export const PI_REALITY_VS_MYTH = [
  {
    axisAr: 'دلالة الثابت الرياضي باي (3.14) والتسعير الحقيقي',
    mythAr: 'ترويج تسعيرات كونية ثابتة غير مرتبطة بالسيولة الفعلية بدعوى تفعيل اتفاقيات QFS سرية.',
    realityAr: 'الرمز 3.14 تيمّن بالثابت الرياضي وتاريخ التأسيس (14 مارس 2019)، ويعتمد التسعير الواقعي داخل التطبيق على أوراكل السوق الموثق (PiRC-203) وفواصل الحماية السعرية.',
  },
  {
    axisAr: 'مرونة شبكة Pi عند انقطاع الإنترنت',
    mythAr: 'شبكة لامركزية تعمل خارج الإنترنت العادي وتستوعب انهيار النظام البنكي العالمي.',
    realityAr: 'تعتمد على بروتوكول Stellar SCP الذي يفضل الأمان (Safety) على الاستمرارية؛ انكسار تقاطع النصاب يعلق العقد في Joining SCP.',
  },
  {
    axisAr: 'معيار المراسلات المصرفية ISO 20022',
    mythAr: 'مفتاح تفعيل سري لتحويل البنوك إلى النظام الكمي وإلغاء الديون فوراً.',
    realityAr: 'معيار تنسيق رسائل وبيانات عناوين منظمة تمر به SWIFT والبنوك عبر ترقيات مجدولة حتى نوفمبر 2026 مع تأجيلات تقنية اعتيادية.',
  },
  {
    axisAr: 'البدائل الجيوسياسية (BRICS Pay وmBridge)',
    mythAr: 'تحالف سري من 209 دول عبر أقمار Starlink يطلق عملات QFS والـ Med Beds.',
    realityAr: 'مشاريع بين-حكومية وبنكية معلنة: BRICS Pay (نموذج 20,000 TPS وتجارب تجارية 2027) وmBridge ($55.5B عبر 5 بنوك مركزية وBIS).',
  },
];
