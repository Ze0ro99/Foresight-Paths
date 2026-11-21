'use client';

import React, { useMemo, useState } from 'react';
import { Calculator, Clock3, Compass, ShieldCheck, Layers } from 'lucide-react';
import {
  BENCHMARK_DECODER_TERMS,
  QKEY_DOMAINS,
  computeCoincidenceProbability,
  computeGematria,
  computeQClockProjection,
  computeVortexSequence,
  findGematriaCollisions,
} from '@/lib/decoder-engine';
import {
  CONSPIRACY_MAPS_I18N,
  PI_REALITY_VS_MYTH_I18N,
  QKEY_I18N,
} from '@/lib/i18n-data';
import { AppLocale } from '@/lib/types';

interface DecoderLabSectionProps {
  locale: AppLocale;
}

const CIPHER_TRANSLATIONS: Record<
  AppLocale,
  Record<string, string>
> = {
  ar: {
    'الترتيبية الإنجليزية': 'الترتيبية الإنجليزية',
    'الترتيب المعكوس': 'الترتيب المعكوس',
    'الاختزال الكامل': 'الاختزال الكامل',
    'الاختزال المعكوس': 'الاختزال المعكوس',
    'السومرية (×6)': 'السومرية (×6)',
    'الجدول اللاتيني الموسع': 'الجدول اللاتيني الموسع',
  },
  en: {
    'الترتيبية الإنجليزية': 'English Ordinal',
    'الترتيب المعكوس': 'Reverse Ordinal',
    'الاختزال الكامل': 'Full Reduction',
    'الاختزال المعكوس': 'Reverse Reduction',
    'السومرية (×6)': 'English Sumerian (×6)',
    'الجدول اللاتيني الموسع': 'Jewish Latin Table',
  },
  fr: {
    'الترتيبية الإنجليزية': 'Ordinal Anglais',
    'الترتيب المعكوس': 'Ordinal Inversé',
    'الاختزال الكامل': 'Réduction Complète',
    'الاختزال المعكوس': 'Réduction Inversée',
    'السومرية (×6)': 'Sumérien (×6)',
    'الجدول اللاتيني الموسع': 'Table Latine Étendue',
  },
  id: {
    'الترتيبية الإنجليزية': 'Ordinal Inggris',
    'الترتيب المعكوس': 'Ordinal Terbalik',
    'الاختزال الكامل': 'Reduksi Penuh',
    'الاختزال المعكوس': 'Reduksi Terbalik',
    'السومرية (×6)': 'Sumeria (×6)',
    'الجدول اللاتيني الموسع': 'Tabel Latin Diperluas',
  },
  vi: {
    'الترتيبية الإنجليزية': 'Thứ Tự Tiếng Anh',
    'الترتيب المعكوس': 'Thứ Tự Đảo Ngược',
    'الاختزال الكامل': 'Rút Gọn Đầy Đủ',
    'الاختزال المعكوس': 'Rút Gọn Đảo Ngược',
    'السومرية (×6)': 'Sumer (×6)',
    'الجدول اللاتيني الموسع': 'Bảng Latin Mở Rộng',
  },
};

const DECODER_UI: Record<
  AppLocale,
  {
    gematriaTitle: string;
    inputSrLabel: string;
    capitalsOnly: string;
    allLetters: string;
    cipherOrd: string;
    cipherRev: string;
    cipherRed: string;
    rootWord: string;
    cipherRevRed: string;
    cipherSum: string;
    cipherJew: string;
    mirrorRule: string;
    letterCount: string;
    coincidenceTitle: string;
    ciphersLabel: string;
    wordsLabel: string;
    targetsLabel: string;
    coincidenceExplain: (trials: number, targets: number, pct: number) => string;
    autoCollisionsTitle: string;
    thTerm: string;
    thOrd: string;
    thRev: string;
    thRed: string;
    thRevRed: string;
    thSum: string;
    qClockTitle: string;
    qClockAria: string;
    qClockAnchorLabel: string;
    radialMatch: string;
    oppositeProj: string;
    ringLabel: string;
    dayLabel: string;
    sectorLabel: string;
    deltaNote: string;
    vortexTitle: string;
    vortexMathHeading: string;
    vortexMathDesc: string;
    vortexConspHeading: string;
    vortexConspDesc: string;
    mapsSectionTitle: string;
    allDomainsBtn: string;
    geometryLabel: string;
    layersLabel: string;
    auditTitle: string;
    mythLabel: string;
    realityLabel: string;
  }
> = {
  ar: {
    gematriaTitle: 'مختبر الجيماتريا الستي وحساب الصُدف الإحصائية (Q-Decoders × Pi)',
    inputSrLabel: 'النص الإنجليزي للتحليل',
    capitalsOnly: 'الأحرف الكبيرة فقط',
    allLetters: 'كامل الأحرف',
    cipherOrd: 'الترتيبية الإنجليزية',
    cipherRev: 'الترتيب المعكوس',
    cipherRed: 'الاختزال الكامل',
    rootWord: 'جذر',
    cipherRevRed: 'الاختزال المعكوس',
    cipherSum: 'السومرية (×6)',
    cipherJew: 'اليهودية اللاتينية',
    mirrorRule: 'قاعدة المرآة (Think Mirror): ',
    letterCount: 'عدد الحروف (n): ',
    coincidenceTitle: 'معادلة احتمال التطابق العشوائي',
    ciphersLabel: 'جداول (C)',
    wordsLabel: 'كلمات (W)',
    targetsLabel: 'أهداف (K)',
    coincidenceExplain: (t, k, pct) =>
      `عند فحص ${t} محاولة بحثية مستقلة بحثاً عن ${k} أرقام مستهدفة (مثل 17 أو 314)، يصبح العثور على «تطابق مذهل» مضموناً رياضياً بنسبة ${pct}%.`,
    autoCollisionsTitle: 'تطابقات تلقائية مرصودة في الجدول المرجعي:',
    thTerm: 'المصطلح',
    thOrd: 'الترتيبية',
    thRev: 'المعكوس',
    thRed: 'الاختزال',
    thRevRed: 'اختزال معكوس',
    thSum: 'السومرية (×6)',
    qClockTitle: 'ساعة Q الدائرية (60 قطاعاً × 6°) ومنهجية الفوارق Δ',
    qClockAria: 'ساعة Q الدائرية بستين قطاعاً',
    qClockAnchorLabel: 'اليوم المرجعي منذ نقطة الارتكاز (0 = 7 ديسمبر)',
    radialMatch: 'التطابق الشعاعي (t mod 60): ',
    oppositeProj: 'الإسقاط القُطري (+30): ',
    ringLabel: 'حلقة',
    dayLabel: 'يوم',
    sectorLabel: 'قطاع',
    deltaNote:
      'تُظهر المراجعة أن اتساع نوافذ الفارق الزمني Δ (من 0 إلى 17 دقيقة) وإسقاط شرط الترابط الموضوعي يسمحان بتوليد روابط لأي خبر يومي.',
    vortexTitle: 'رياضيات الدوامة (Tesla 3·6·9) ودورة قوى العدد 2 مقياس 9',
    vortexMathHeading: 'التفسير الرياضي الدقيق',
    vortexMathDesc:
      'لأن العدد 2 جذر بدائي مقياس 9 (φ(9)=6)، تدور مضاعفاته حصراً في 1–2–4–8–7–5 وتستثني 3–6–9.',
    vortexConspHeading: 'التوظيف في الخرائط التآمرية',
    vortexConspDesc:
      'تدمجها أدبيات الوعي مع «زهرة الحياة» والحقل الحلقي لإضفاء طابع حتمي على الخرائط السياسية.',
    mapsSectionTitle: 'تفكيك البنية الهندسية للخرائط الكبرى ومفاتيح Q-KEY التسعة',
    allDomainsBtn: 'جميع النطاقات (9)',
    geometryLabel: 'البنية الهندسية: ',
    layersLabel: 'الطبقات: ',
    auditTitle: 'التدقيق التقني: واقع شبكة Pi (SCP) ومعيار ISO 20022 وBRICS Pay مقابل سرديات QFS',
    mythLabel: 'السردية التآمرية: ',
    realityLabel: 'الواقع الهندسي والتنظيمي: ',
  },
  en: {
    gematriaTitle: '6-Cipher Gematria & Statistical Coincidence Lab (Q-Decoders × Pi)',
    inputSrLabel: 'English text to decode',
    capitalsOnly: 'Capitals Only',
    allLetters: 'All Letters',
    cipherOrd: 'English Ordinal',
    cipherRev: 'Reverse Ordinal',
    cipherRed: 'Full Reduction',
    rootWord: 'root',
    cipherRevRed: 'Reverse Reduction',
    cipherSum: 'English Sumerian (×6)',
    cipherJew: 'Jewish Latin Table',
    mirrorRule: 'Mirror Rule (Think Mirror): ',
    letterCount: 'Letter count (n): ',
    coincidenceTitle: 'Random Collision Probability Proof',
    ciphersLabel: 'Ciphers (C)',
    wordsLabel: 'Words (W)',
    targetsLabel: 'Targets (K)',
    coincidenceExplain: (t, k, pct) =>
      `Testing ${t} independent cipher-word trials for ${k} target numbers (e.g., 17 or 314) guarantees an illusory “stunning match” with ${pct}% probability.`,
    autoCollisionsTitle: 'Observed Collisions in Benchmark Matrix:',
    thTerm: 'Term',
    thOrd: 'Ordinal',
    thRev: 'Reverse',
    thRed: 'Reduction',
    thRevRed: 'Rev. Red.',
    thSum: 'Sumerian (×6)',
    qClockTitle: '60-Sector Radial Q-Clock (6°/sector) & Delta Windows',
    qClockAria: '60-sector circular Q-Clock dial',
    qClockAnchorLabel: 'Anchor Day Offset (0 = Dec 7)',
    radialMatch: 'Radial Match (t mod 60): ',
    oppositeProj: 'Opposite Projection (+30): ',
    ringLabel: 'Ring',
    dayLabel: 'Day',
    sectorLabel: 'Sector',
    deltaNote:
      'Audit finding: widening Δ timestamp windows (0–17 min) while dropping topical relevance lets decoders link virtually any headline.',
    vortexTitle: 'Tesla Vortex Math (3·6·9) & Powers of 2 Mod 9',
    vortexMathHeading: 'Exact Number-Theoretic Explanation',
    vortexMathDesc:
      'Because 2 is a primitive root modulo 9 (φ(9)=6), doubling orbits strictly through 1–2–4–8–7–5 and structurally skips 3–6–9.',
    vortexConspHeading: 'Use in Conspiratorial Maps',
    vortexConspDesc:
      'Combined with Flower-of-Life & toroidal geometry to lend false mathematical determinism to political charts.',
    mapsSectionTitle: 'Geometric Deconstruction of Major Maps & 9 Q-KEY Domains',
    allDomainsBtn: 'All Domains (9)',
    geometryLabel: 'Geometry: ',
    layersLabel: 'Layers: ',
    auditTitle: 'Engineering Audit: Pi Network (SCP), ISO 20022, BRICS Pay & mBridge vs QFS Lore',
    mythLabel: 'Conspiracy Claim: ',
    realityLabel: 'Engineering & Regulatory Reality: ',
  },
  fr: {
    gematriaTitle: 'Laboratoire Gématrique à 6 Tables & Coïncidence Statistique (Q × Pi)',
    inputSrLabel: 'Texte anglais à analyser',
    capitalsOnly: 'Majuscules uniquement',
    allLetters: 'Toutes lettres',
    cipherOrd: 'Ordinal Anglais',
    cipherRev: 'Ordinal Inversé',
    cipherRed: 'Réduction Complète',
    rootWord: 'racine',
    cipherRevRed: 'Réduction Inversée',
    cipherSum: 'Sumérien (×6)',
    cipherJew: 'Table Latine Étendue',
    mirrorRule: 'Règle Miroir (Think Mirror) : ',
    letterCount: 'Lettres (n) : ',
    coincidenceTitle: 'Formule de Coïncidence Statistique',
    ciphersLabel: 'Tables (C)',
    wordsLabel: 'Mots (W)',
    targetsLabel: 'Cibles (K)',
    coincidenceExplain: (t, k, pct) =>
      `Sur ${t} essais indépendants cherchant ${k} nombres cibles (ex. 17 ou 314), une « coïncidence frappante » est garantie à ${pct} %.`,
    autoCollisionsTitle: 'Collisions observées dans le tableau de référence :',
    thTerm: 'Terme',
    thOrd: 'Ordinal',
    thRev: 'Inversé',
    thRed: 'Réduction',
    thRevRed: 'Réd. Inv.',
    thSum: 'Sumérien (×6)',
    qClockTitle: 'Horloge Circulaire Q (60 secteurs × 6°) & Écarts Δ',
    qClockAria: 'Cadran Q-Clock à 60 secteurs',
    qClockAnchorLabel: 'Jour depuis le point d’ancrage (0 = 7 déc.)',
    radialMatch: 'Alignement radial (t mod 60) : ',
    oppositeProj: 'Projection diamétrale (+30) : ',
    ringLabel: 'Anneau',
    dayLabel: 'Jour',
    sectorLabel: 'Secteur',
    deltaNote:
      'L’élargissement des fenêtres temporelles Δ (0–17 min) sans contrainte thématique permet de relier n’importe quel titre d’actualité.',
    vortexTitle: 'Maths Vortex (Tesla 3·6·9) & Cycle 2^n modulo 9',
    vortexMathHeading: 'Explication arithmétique exacte',
    vortexMathDesc:
      'Comme 2 est racine primitive modulo 9 (φ(9)=6), ses puissances bouclent dans 1–2–4–8–7–5 en excluant 3–6–9.',
    vortexConspHeading: 'Usage dans les cartes',
    vortexConspDesc:
      'Associé à la Fleur de Vie pour donner une apparence de déterminisme mathématique aux cartes politiques.',
    mapsSectionTitle: 'Déconstruction Géométrique des Grandes Cartes & 9 Domaines Q-KEY',
    allDomainsBtn: 'Tous (9)',
    geometryLabel: 'Géométrie : ',
    layersLabel: 'Couches : ',
    auditTitle: 'Audit Technique : Pi Network (SCP), ISO 20022, BRICS Pay vs Récits QFS',
    mythLabel: 'Allégation : ',
    realityLabel: 'Réalité Technique : ',
  },
  id: {
    gematriaTitle: 'Lab Gematria 6-Sandi & Bukti Kebetulan Statistik (Q-Decoders × Pi)',
    inputSrLabel: 'Teks Inggris untuk dianalisis',
    capitalsOnly: 'Huruf Kapital Saja',
    allLetters: 'Semua Huruf',
    cipherOrd: 'Ordinal Inggris',
    cipherRev: 'Ordinal Terbalik',
    cipherRed: 'Reduksi Penuh',
    rootWord: 'akar',
    cipherRevRed: 'Reduksi Terbalik',
    cipherSum: 'Sumeria (×6)',
    cipherJew: 'Latin Diperluas',
    mirrorRule: 'Aturan Cermin (Think Mirror): ',
    letterCount: 'Jumlah huruf (n): ',
    coincidenceTitle: 'Kalkulator Probabilitas Kebetulan',
    ciphersLabel: 'Sandi (C)',
    wordsLabel: 'Kata (W)',
    targetsLabel: 'Target (K)',
    coincidenceExplain: (t, k, pct) =>
      `Menguji ${t} percobaan untuk ${k} angka target (seperti 17 atau 314) menghasilkan kecocokan semu sebesar ${pct}%.`,
    autoCollisionsTitle: 'Kecocokan Otomatis di Tabel Referensi:',
    thTerm: 'Istilah',
    thOrd: 'Ordinal',
    thRev: 'Terbalik',
    thRed: 'Reduksi',
    thRevRed: 'Red. Terbalik',
    thSum: 'Sumeria (×6)',
    qClockTitle: 'Jam Melingkar Q-Clock (60 Sektor × 6°) & Selisih Δ',
    qClockAria: 'Dial jam Q-Clock 60 sektor',
    qClockAnchorLabel: 'Hari Referensi dari Titik Jangkar (0 = 7 Des)',
    radialMatch: 'Kecocokan Radial (t mod 60): ',
    oppositeProj: 'Proyeksi Berlawanan (+30): ',
    ringLabel: 'Cincin',
    dayLabel: 'Hari',
    sectorLabel: 'Sektor',
    deltaNote:
      'Memperlebar jendela Δ (0–17 menit) sambil mengabaikan relevansi topik memungkinkan pengaitan ke berita harian apa pun.',
    vortexTitle: 'Matematika Vortex (Tesla 3·6·9) & Siklus 2^n Modulo 9',
    vortexMathHeading: 'Penjelasan Matematika Murni',
    vortexMathDesc:
      'Karena 2 adalah akar primitif modulo 9 (φ(9)=6), perpangkatannya berputar eksklusif di 1–2–4–8–7–5 dan melewati 3–6–9.',
    vortexConspHeading: 'Penggunaan di Peta Konspirasi',
    vortexConspDesc:
      'Digabungkan dengan Flower of Life untuk memberi kesan determinisme matematis pada narasi politik.',
    mapsSectionTitle: 'Dekonstruksi Geometri Peta Besar & 9 Domain Q-KEY',
    allDomainsBtn: 'Semua Domain (9)',
    geometryLabel: 'Geometri: ',
    layersLabel: 'Lapisan: ',
    auditTitle: 'Audit Teknik: Pi Network (SCP), ISO 20022, BRICS Pay vs Klaim QFS',
    mythLabel: 'Narasi Konspirasi: ',
    realityLabel: 'Realitas Teknis & Regulasi: ',
  },
  vi: {
    gematriaTitle: 'Phòng Thí Nghiệm Gematria 6 Bảng & Xác Suất Trùng Hợp (Q × Pi)',
    inputSrLabel: 'Văn bản tiếng Anh cần giải mã',
    capitalsOnly: 'Chỉ Chữ Hoa',
    allLetters: 'Tất Cả Chữ Cái',
    cipherOrd: 'Thứ Tự Tiếng Anh',
    cipherRev: 'Thứ Tự Đảo',
    cipherRed: 'Rút Gọn Đầy Đủ',
    rootWord: 'gốc',
    cipherRevRed: 'Rút Gọn Đảo',
    cipherSum: 'Sumer (×6)',
    cipherJew: 'Bảng Latin Mở Rộng',
    mirrorRule: 'Quy Tắc Gương (Think Mirror): ',
    letterCount: 'Số chữ cái (n): ',
    coincidenceTitle: 'Phương Trình Xác Suất Trùng Hợp Ngẫu Nhiên',
    ciphersLabel: 'Bảng Mã (C)',
    wordsLabel: 'Từ (W)',
    targetsLabel: 'Mục Tiêu (K)',
    coincidenceExplain: (t, k, pct) =>
      `Khi kiểm tra ${t} phép thử độc lập cho ${k} số mục tiêu (như 17 hoặc 314), xác suất thấy "trùng khớp ấn tượng" đạt ${pct}%.`,
    autoCollisionsTitle: 'Trùng Khớp Tự Động Trong Bảng Chuẩn:',
    thTerm: 'Thuật Ngữ',
    thOrd: 'Thứ Tự',
    thRev: 'Đảo Ngược',
    thRed: 'Rút Gọn',
    thRevRed: 'RG Đảo',
    thSum: 'Sumer (×6)',
    qClockTitle: 'Đồng Hồ Tròn Q-Clock (60 Cung × 6°) & Phương Pháp Δ',
    qClockAria: 'Mặt đồng hồ Q-Clock 60 cung',
    qClockAnchorLabel: 'Số Ngày Kể Từ Mốc Neo (0 = 7 Thg 12)',
    radialMatch: 'Trùng Xuyên Tâm (t mod 60): ',
    oppositeProj: 'Chiếu Đối Xứng (+30): ',
    ringLabel: 'Vòng',
    dayLabel: 'Ngày',
    sectorLabel: 'Cung',
    deltaNote:
      'Nới rộng cửa sổ thời gian Δ (0–17 phút) và bỏ qua liên quan chủ đề cho phép gắn kết mọi tin tức thường nhật.',
    vortexTitle: 'Toán Học Xoáy (Tesla 3·6·9) & Chu Kỳ 2^n Mod 9',
    vortexMathHeading: 'Giải Thích Số Học Chính Xác',
    vortexMathDesc:
      'Vì 2 là căn nguyên thủy modulo 9 (φ(9)=6), lũy thừa của 2 chỉ xoay vòng 1–2–4–8–7–5 và bỏ qua 3–6–9.',
    vortexConspHeading: 'Cách Dùng Trong Bản Đồ Thuyết Âm Mưu',
    vortexConspDesc:
      'Kết hợp với Bông Hoa Sự Sống để tạo cảm giác tất định toán học cho các sơ đồ chính trị.',
    mapsSectionTitle: 'Giải Cấu Trúc Hình Học Bản Đồ Lớn & 9 Miền Q-KEY',
    allDomainsBtn: 'Tất Cả (9)',
    geometryLabel: 'Hình học: ',
    layersLabel: 'Tầng: ',
    auditTitle: 'Kiểm Toán Kỹ Thuật: Mạng Pi (SCP), ISO 20022, BRICS Pay So Với QFS',
    mythLabel: 'Tuyên Bố Âm Mưu: ',
    realityLabel: 'Thực Tế Kỹ Thuật & Pháp Lý: ',
  },
};

export default function DecoderLabSection({ locale }: DecoderLabSectionProps) {
  const ui = DECODER_UI[locale];
  const cipherMap = CIPHER_TRANSLATIONS[locale];
  const qkeyCopy = QKEY_I18N[locale];
  const mapsCatalog = CONSPIRACY_MAPS_I18N[locale];
  const realityRows = PI_REALITY_VS_MYTH_I18N[locale];

  const [phrase, setPhrase] = useState('PI NETWORK');
  const [letterMode, setLetterMode] = useState<'all' | 'capitals_only'>('all');
  const [ciphersCount, setCiphersCount] = useState(6);
  const [wordsCount, setWordsCount] = useState(50);
  const [targetsCount, setTargetsCount] = useState(10);
  const [clockDay, setClockDay] = useState(17);
  const [activeQKey, setActiveQKey] = useState<string>('all');

  const gematria = useMemo(
    () => computeGematria(phrase, letterMode),
    [phrase, letterMode]
  );

  const benchmarkRows = useMemo(
    () => BENCHMARK_DECODER_TERMS.map((t) => computeGematria(t)),
    []
  );

  const collisions = useMemo(
    () => findGematriaCollisions(BENCHMARK_DECODER_TERMS),
    []
  );

  const coincidence = useMemo(
    () => computeCoincidenceProbability(ciphersCount, wordsCount, targetsCount, 350),
    [ciphersCount, wordsCount, targetsCount]
  );

  const clockProj = useMemo(() => computeQClockProjection(clockDay), [clockDay]);
  const vortexSteps = useMemo(() => computeVortexSequence(9), []);

  const rad = ((clockProj.angleDeg - 90) * Math.PI) / 180;
  const oppRad = ((clockProj.oppositeAngleDeg - 90) * Math.PI) / 180;
  const ptX = 120 + Math.cos(rad) * 86;
  const ptY = 120 + Math.sin(rad) * 86;
  const oppX = 120 + Math.cos(oppRad) * 86;
  const oppY = 120 + Math.sin(oppRad) * 86;

  return (
    <div className="space-y-6">
      {/* 1. Interactive 6-Cipher Gematria & Coincidence Analyzer */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2856] pb-3.5">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#C084FC]" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">{ui.gematriaTitle}</h3>
          </div>
          <span className="font-latin-math text-xs text-[#FDA4AF]">
            Q = 17 · G_ord + G_rev = 27n
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Calculator Input & Output */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="gematria-input" className="sr-only">
                {ui.inputSrLabel}
              </label>
              <input
                id="gematria-input"
                type="text"
                dir="ltr"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="PI NETWORK, NESARA, SWIFT..."
                className="min-w-[200px] flex-1 rounded-md border border-[#312E81] bg-[#0C0D16] px-3 py-2 font-latin-math text-sm text-white focus:border-[#9333EA] focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setLetterMode((m) => (m === 'all' ? 'capitals_only' : 'all'))
                }
                className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                  letterMode === 'capitals_only'
                    ? 'border-[#E11D48] bg-[#2D0A18] text-white'
                    : 'border-[#312E81] bg-[#0C0D16] text-[#C7D2FE]'
                }`}
              >
                {letterMode === 'capitals_only' ? ui.capitalsOnly : ui.allLetters}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {BENCHMARK_DECODER_TERMS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setPhrase(term)}
                  className={`rounded border px-2.5 py-1 font-latin-math text-[11px] font-semibold transition-colors ${
                    phrase.toUpperCase() === term
                      ? 'border-[#7C3AED] bg-[#2E1065] text-white'
                      : 'border-[#1E1B4B] bg-[#0C0D16] text-[#A5B4FC] hover:text-white'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: ui.cipherOrd, val: gematria.englishOrdinal },
                { label: ui.cipherRev, val: gematria.reverseOrdinal },
                {
                  label: ui.cipherRed,
                  val: `${gematria.fullReduction} (${ui.rootWord} ${gematria.digitalRoot})`,
                },
                { label: ui.cipherRevRed, val: gematria.reverseFullReduction },
                { label: ui.cipherSum, val: gematria.englishSumerian },
                { label: ui.cipherJew, val: gematria.jewishLatin },
              ].map((cell) => (
                <div
                  key={cell.label}
                  className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3 text-xs"
                >
                  <div className="text-[#A5B4FC]">{cell.label}</div>
                  <div className="mt-1 font-latin-math text-base font-bold text-white tabular-nums">
                    {cell.val}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded border border-[#2B2856] bg-[#0C0D16] px-3.5 py-2.5 text-xs text-[#CBD5E1]">
              <span className="font-semibold text-white">{ui.mirrorRule}</span>
              <span className="font-latin-math text-[#C084FC]">
                {gematria.mirroredValues.join(' · ') || '—'}
              </span>
              <span className="mx-2 text-[#6366F1]">|</span>
              <span>{ui.letterCount}</span>
              <span className="font-latin-math text-white">
                {gematria.letterCount} (27n = {gematria.ordinalSumCheck})
              </span>
            </div>
          </div>

          {/* Statistical Proof: Coincidence Guarantee */}
          <div className="lg:col-span-5 rounded-md border border-[#2B2856] bg-[#0C0D16] p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2 border-b border-[#1E1B4B] pb-2">
              <span className="font-bold text-white">{ui.coincidenceTitle}</span>
              <span className="font-latin-math text-lg font-bold text-[#E11D48] tabular-nums">
                {coincidence.matchProbabilityPct}%
              </span>
            </div>
            <div
              dir="ltr"
              className="rounded border border-[#1E1B4B] bg-[#121329] px-3 py-2 font-latin-math text-[11px] text-[#E0E7FF]"
            >
              P(match ≥ 1) = 1 - (1 - K / 350)^(C × W)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="ciphers-cnt" className="block text-[#A5B4FC]">
                  {ui.ciphersLabel}
                </label>
                <input
                  id="ciphers-cnt"
                  type="number"
                  min={1}
                  max={12}
                  value={ciphersCount}
                  onChange={(e) => setCiphersCount(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#101124] px-2 py-1 font-latin-math text-white"
                />
              </div>
              <div>
                <label htmlFor="words-cnt" className="block text-[#A5B4FC]">
                  {ui.wordsLabel}
                </label>
                <input
                  id="words-cnt"
                  type="number"
                  min={1}
                  max={200}
                  value={wordsCount}
                  onChange={(e) => setWordsCount(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#101124] px-2 py-1 font-latin-math text-white"
                />
              </div>
              <div>
                <label htmlFor="targets-cnt" className="block text-[#A5B4FC]">
                  {ui.targetsLabel}
                </label>
                <input
                  id="targets-cnt"
                  type="number"
                  min={1}
                  max={100}
                  value={targetsCount}
                  onChange={(e) => setTargetsCount(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#101124] px-2 py-1 font-latin-math text-white"
                />
              </div>
            </div>
            <p className="leading-relaxed text-[#CBD5E1]">
              {ui.coincidenceExplain(
                coincidence.trials,
                coincidence.targets,
                coincidence.matchProbabilityPct
              )}
            </p>
            <div className="border-t border-[#1E1B4B] pt-2 space-y-1">
              <div className="font-semibold text-[#C084FC]">
                {ui.autoCollisionsTitle}
              </div>
              {collisions.slice(0, 4).map((col, idx) => (
                <div key={idx} className="text-[11px] text-[#E5E7EB]">
                  <span className="font-latin-math text-white">{col.termA}</span> (
                  {cipherMap[col.cipherA] ?? col.cipherA}) ={' '}
                  <span className="font-latin-math text-white">{col.termB}</span> (
                  {cipherMap[col.cipherB] ?? col.cipherB}) ={' '}
                  <span className="font-latin-math font-bold text-[#FDA4AF]">
                    {col.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exact 10-Term Benchmark Table */}
        <div className="mt-5 overflow-x-auto rounded border border-[#1E1B4B] bg-[#0C0D16]">
          <table className="w-full text-start text-xs tabular-nums">
            <thead className="border-b border-[#1E1B4B] bg-[#121329] text-[#A5B4FC]">
              <tr>
                <th className="px-3 py-2 font-semibold text-start">{ui.thTerm}</th>
                <th className="px-3 py-2 font-semibold text-start">n</th>
                <th className="px-3 py-2 font-semibold text-start">{ui.thOrd}</th>
                <th className="px-3 py-2 font-semibold text-start">{ui.thRev}</th>
                <th className="px-3 py-2 font-semibold text-start">{ui.thRed}</th>
                <th className="px-3 py-2 font-semibold text-start">{ui.thRevRed}</th>
                <th className="px-3 py-2 font-semibold text-start">{ui.thSum}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1B4B]">
              {benchmarkRows.map((row) => (
                <tr key={row.phrase} className="hover:bg-[#161835]">
                  <td className="px-3 py-2 font-latin-math font-bold text-white">
                    {row.phrase}
                  </td>
                  <td className="px-3 py-2 font-latin-math text-[#A5B4FC]">
                    {row.letterCount}
                  </td>
                  <td className="px-3 py-2 font-latin-math text-[#E0E7FF]">
                    {row.englishOrdinal}
                  </td>
                  <td className="px-3 py-2 font-latin-math text-[#E0E7FF]">
                    {row.reverseOrdinal}
                  </td>
                  <td className="px-3 py-2 font-latin-math text-[#C084FC]">
                    {row.fullReduction}
                  </td>
                  <td className="px-3 py-2 font-latin-math text-[#A5B4FC]">
                    {row.reverseFullReduction}
                  </td>
                  <td className="px-3 py-2 font-latin-math text-[#CBD5E1]">
                    {row.englishSumerian}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Q-Clock 60-Sector Radial Dial & Tesla Vortex Math */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-lg border border-[#2B2856] bg-[#101124] p-5">
          <div className="flex items-center justify-between gap-2 border-b border-[#2B2856] pb-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[#E11D48]" aria-hidden="true" />
              <h3 className="text-sm font-bold text-white">{ui.qClockTitle}</h3>
            </div>
            <span className="font-latin-math text-xs text-[#C084FC]">
              Sector {clockProj.sector}/60 · {clockProj.angleDeg}°
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
            <svg
              viewBox="0 0 240 240"
              className="h-48 w-48 shrink-0"
              aria-label={ui.qClockAria}
            >
              <circle
                cx="120"
                cy="120"
                r="96"
                fill="#07070B"
                stroke="#312E81"
                strokeWidth="1.5"
              />
              <circle
                cx="120"
                cy="120"
                r="66"
                fill="none"
                stroke="#1E1B4B"
                strokeDasharray="3 3"
              />
              <circle
                cx="120"
                cy="120"
                r="36"
                fill="none"
                stroke="#1E1B4B"
                strokeDasharray="3 3"
              />
              {Array.from({ length: 60 }, (_, idx) => {
                const a = ((idx * 6 - 90) * Math.PI) / 180;
                const r1 = idx % 5 === 0 ? 86 : 91;
                const r2 = 96;
                return (
                  <line
                    key={idx}
                    x1={120 + Math.cos(a) * r1}
                    y1={120 + Math.sin(a) * r1}
                    x2={120 + Math.cos(a) * r2}
                    y2={120 + Math.sin(a) * r2}
                    stroke={idx % 5 === 0 ? '#7C3AED' : '#312E81'}
                    strokeWidth={idx % 5 === 0 ? 1.5 : 0.8}
                  />
                );
              })}
              <line
                x1={ptX}
                y1={ptY}
                x2={oppX}
                y2={oppY}
                stroke="#E11D48"
                strokeWidth="1.6"
                strokeDasharray="4 3"
              />
              <line
                x1="120"
                y1="120"
                x2={ptX}
                y2={ptY}
                stroke="#C084FC"
                strokeWidth="2"
              />
              <circle cx={ptX} cy={ptY} r="5.5" fill="#E11D48" stroke="#fff" strokeWidth="1.5" />
              <circle cx={oppX} cy={oppY} r="4.5" fill="#7C3AED" stroke="#fff" strokeWidth="1.2" />
              <circle cx="120" cy="120" r="3" fill="#fff" />
            </svg>

            <div className="flex-1 space-y-3 text-xs">
              <div>
                <label htmlFor="qclock-day" className="block font-semibold text-white">
                  {ui.qClockAnchorLabel}
                </label>
                <input
                  id="qclock-day"
                  type="range"
                  min={0}
                  max={179}
                  value={clockDay}
                  onChange={(e) => setClockDay(Number(e.target.value))}
                  className="mt-1.5 w-full accent-[#E11D48]"
                />
              </div>
              <div className="space-y-1.5 rounded border border-[#1E1B4B] bg-[#0C0D16] p-3 text-[#CBD5E1]">
                <div>
                  <strong className="text-white">{ui.radialMatch}</strong>
                  <span className="font-latin-math text-[#C084FC]">
                    {ui.dayLabel} {clockProj.dayOffset} ↔ {ui.dayLabel}{' '}
                    {clockProj.radialMatchOffset} ({ui.ringLabel} {clockProj.ring})
                  </span>
                </div>
                <div>
                  <strong className="text-white">{ui.oppositeProj}</strong>
                  <span className="font-latin-math text-[#FDA4AF]">
                    {ui.sectorLabel} {clockProj.oppositeSector} ({clockProj.oppositeAngleDeg}°) ·{' '}
                    {ui.dayLabel} {clockProj.oppositeDayOffset}
                  </span>
                </div>
                <p className="pt-1 text-[11px] text-[#A5B4FC]">{ui.deltaNote}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tesla Vortex Math 3-6-9 & Powers of 2 */}
        <div className="lg:col-span-6 rounded-lg border border-[#2B2856] bg-[#101124] p-5">
          <div className="flex items-center justify-between gap-2 border-b border-[#2B2856] pb-3">
            <h3 className="text-sm font-bold text-white">{ui.vortexTitle}</h3>
            <span className="font-latin-math text-xs text-[#C084FC]">
              3³ + 4³ + 5³ = 216
            </span>
          </div>

          <div dir="ltr" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-9">
            {vortexSteps.map((step) => (
              <div
                key={step.exponent}
                className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-2 text-center"
              >
                <div className="font-latin-math text-[10px] text-[#A5B4FC]">
                  2^{step.exponent}
                </div>
                <div className="font-latin-math text-xs text-[#CBD5E1]">
                  {step.powerOfTwo}
                </div>
                <div className="mt-1 font-latin-math text-sm font-bold text-[#FDA4AF]">
                  → {step.digitalRoot}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
            <div className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3">
              <div className="font-semibold text-white">{ui.vortexMathHeading}</div>
              <p className="mt-1 leading-relaxed text-[#CBD5E1]">{ui.vortexMathDesc}</p>
            </div>
            <div className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3">
              <div className="font-semibold text-white">{ui.vortexConspHeading}</div>
              <p className="mt-1 leading-relaxed text-[#CBD5E1]">{ui.vortexConspDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Q-KEY 9 Domains + 4 Major Maps Deconstruction */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2856] pb-3.5">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#C084FC]" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">{ui.mapsSectionTitle}</h3>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveQKey('all')}
              className={`rounded px-2.5 py-1 text-[11px] font-semibold ${
                activeQKey === 'all'
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-[#A5B4FC] hover:bg-[#191B38]'
              }`}
            >
              {ui.allDomainsBtn}
            </button>
            {QKEY_DOMAINS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveQKey(d.id)}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  activeQKey === d.id
                    ? 'bg-[#2D0A18] text-white border border-[#E11D48]'
                    : 'text-[#CBD5E1] hover:bg-[#191B38]'
                }`}
              >
                {d.index}. {qkeyCopy[d.id].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QKEY_DOMAINS.filter(
            (d) => activeQKey === 'all' || d.id === activeQKey
          ).map((d) => (
            <div
              key={d.id}
              className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white">
                  {d.index}. {qkeyCopy[d.id].label}
                </span>
                <span
                  className="font-latin-math text-[11px] font-semibold"
                  style={{ color: d.color }}
                >
                  {d.labelEn}
                </span>
              </div>
              <p className="mt-1.5 leading-relaxed text-[#CBD5E1]">
                {qkeyCopy[d.id].examples}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(mapsCatalog).map(([mapId, m]) => (
            <div
              key={mapId}
              className="rounded border border-[#2B2856] bg-[#0C0D16] p-3.5 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white">{m.name}</span>
                <span className="text-[11px] text-[#A5B4FC]">{m.designer}</span>
              </div>
              <p className="text-[#E5E7EB]">
                <strong className="text-[#C084FC]">{ui.geometryLabel}</strong>
                {m.geometry}
              </p>
              <p className="text-[#CBD5E1]">
                <strong className="text-white">{ui.layersLabel}</strong>
                {m.layers}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pi Network (SCP), ISO 20022, BRICS Pay & mBridge Engineering Audit */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex items-center gap-2 border-b border-[#2B2856] pb-3">
          <ShieldCheck className="h-5 w-5 text-[#16A34A]" aria-hidden="true" />
          <h3 className="text-base font-bold text-white">{ui.auditTitle}</h3>
        </div>
        <div className="mt-4 space-y-3">
          {realityRows.map((row) => (
            <div
              key={row.axis}
              className="grid grid-cols-1 gap-3 rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5 text-xs lg:grid-cols-12"
            >
              <div className="lg:col-span-3 font-bold text-white flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-[#C084FC] shrink-0" aria-hidden="true" />
                <span>{row.axis}</span>
              </div>
              <div className="lg:col-span-4 text-[#FDA4AF]">
                <span className="font-semibold text-white">{ui.mythLabel}</span>
                {row.myth}
              </div>
              <div className="lg:col-span-5 text-[#A7F3D0]">
                <span className="font-semibold text-white">{ui.realityLabel}</span>
                {row.reality}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
