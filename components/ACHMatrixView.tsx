'use client';

import React, { useMemo, useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Minus, MessageSquare } from 'lucide-react';
import {
  AppLocale,
  CommunityComment,
  EpistemicTier,
  HypothesisId,
  HypothesisRanking,
  LiveEvent,
  QKeyDomainId,
  RedTeamNote,
} from '@/lib/types';
import { RELIABILITY_WEIGHTS } from '@/lib/trajectory-engine';
import { EPISTEMIC_TIER_META, QKEY_DOMAINS } from '@/lib/decoder-engine';
import { getEpistemicCopy, getHypothesisCopy, getQKeyCopy } from '@/lib/i18n';

interface ACHMatrixViewProps {
  locale: AppLocale;
  events: LiveEvent[];
  rankings: HypothesisRanking[];
  redTeamNotes: RedTeamNote[];
  onAddRedTeamNote: (note: Omit<RedTeamNote, 'id' | 'createdAt'>) => void;
}

const ACH_I18N: Record<
  AppLocale,
  {
    title: string;
    subtitle: string;
    rankLabel: string;
    mostLikely: string;
    secondary: string;
    falsificationScore: string;
    supportLabel: string;
    falsifyLabel: string;
    tableTitle: string;
    thEvent: string;
    thReliability: string;
    falsifies: string;
    supports: string;
    neutral: string;
    redTeamTitle: string;
    redTeamDesc: string;
    altHypPrefix: string;
    newChallengeTitle: string;
    targetEventLabel: string;
    reviewerRoleLabel: string;
    defaultReviewerRole: string;
    altHypLabel: string;
    challengeLabel: string;
    challengePh: string;
    challengeMinErr: string;
    submitChallenge: string;
    roomTitle: string;
    roomSubtitle: string;
    allCount: string;
    symbolicNotice: string;
    addCommentTitle: string;
    handleLabel: string;
    defaultHandle: string;
    tierLabel: string;
    qKeyLabel: string;
    bodyLabel: string;
    bodyPh: string;
    publishComment: string;
    seed1Author: string;
    seed1Body: string;
    seed2Author: string;
    seed2Body: string;
  }
> = {
  ar: {
    title: 'المسار الثاني: مصفوفة تحليل الفرضيات المتنافسة (ACH — اختبار النفي)',
    subtitle:
      'لتجنب الانحياز التأكيدي، تُرتّب الفرضيات تصاعدياً حسب مجموع الأدلة النافية الموزونة بموثوقية المصدر (A1=1.0 إلى D4=0.2). الفرضية الأقل نفياً هي التفسير الأكثر ترجيحاً.',
    rankLabel: 'المرتبة',
    mostLikely: 'الأرجح علمياً',
    secondary: 'مرشح ثانوي',
    falsificationScore: 'نقاط النفي',
    supportLabel: 'داعم',
    falsifyLabel: 'نافٍ',
    tableTitle: 'جدول تقاطع الأدلة اللحظية مع الفرضيات الأربع',
    thEvent: 'الحدث والدليل المرصود',
    thReliability: 'الموثوقية',
    falsifies: 'ينفي',
    supports: 'يدعم',
    neutral: 'محايد',
    redTeamTitle: 'حوكمة المراجعة النظيرة الداخلية (Red Teaming)',
    redTeamDesc:
      'تختبر هذه الوحدة فرضيات الفريق الأساسي وتوثق الثغرات المنطقية أو التفسيرات البديلة قبل اعتماد التقرير الاستشرافي.',
    altHypPrefix: 'فرضية بديلة',
    newChallengeTitle: 'تسجيل طعن منهجي جديد (Red Team Challenge)',
    targetEventLabel: 'الحدث المستهدف بالمراجعة',
    reviewerRoleLabel: 'صفة المراجع',
    defaultReviewerRole: 'محلل الفريق الأحمر',
    altHypLabel: 'الفرضية البديلة المقترحة',
    challengeLabel: 'نص الطعن المنطقي أو الثغرة المرصودة',
    challengePh: 'مثال: لم يتم التحقق من سجلات التبريد في مركز البيانات الثانوي...',
    challengeMinErr: 'يرجى كتابة طعن علمي أو فرضية بديلة لا تقل عن 8 أحرف.',
    submitChallenge: 'إضافة ملاحظة الفريق الأحمر',
    roomTitle: 'مجتمعات التحليل الموثقة بـ KYC وضوابط تصنيف الأدلة الخمسية (اشتراك 0.0001 Pi)',
    roomSubtitle: 'تُحصر الآراء التخينية والرمزية في تبويبها دون تلويث طبقة الإحداثيات الموثقة',
    allCount: 'الكل',
    symbolicNotice: 'تنبيه منهجي: التطابق الرمزي أو القرب البصري لا يثبت سببية واقعية.',
    addCommentTitle: 'إضافة مداخلة تحليلية مصنّفة (KYC)',
    handleLabel: 'معرف الباحث الموثق',
    defaultHandle: 'رائد_موثق_KYC',
    tierLabel: 'مستوى الدليل',
    qKeyLabel: 'نطاق Q-KEY',
    bodyLabel: 'نص التحليل أو الدليل',
    bodyPh: 'اكتب ملاحظتك مصحوبة بالمصدر التقني أو التصنيف الرمزي...',
    publishComment: 'نشر في غرفة التحليل (KYC)',
    seed1Author: 'مراجع_بنية_تحتية',
    seed1Body: 'سجلات RIPE BGP الخام تؤكد وقوع سحب البادئات قبل أي تداول إعلامي أو وسوم مضللة.',
    seed2Author: 'محلل_سيميائي',
    seed2Body:
      'الربط الرمزي بين شعار ΠΣV على غلاف المجلة وأعطال التسوية يظل قراءة فنية استعارتها السرديات ولا يثبت سببية تقنية.',
  },
  en: {
    title: 'Track II: Analysis of Competing Hypotheses (ACH — Falsification Test)',
    subtitle:
      'To defeat confirmation bias, hypotheses are ranked ascending by source-weighted falsification score (A1=1.0 down to D4=0.2). Lowest falsification = leading scientific hypothesis.',
    rankLabel: 'Rank',
    mostLikely: 'Leading Hypothesis',
    secondary: 'Secondary Candidate',
    falsificationScore: 'Falsification Score',
    supportLabel: 'Support',
    falsifyLabel: 'Falsify',
    tableTitle: 'Live Evidence × Four-Hypothesis Cross Matrix',
    thEvent: 'Observed Event & Evidence',
    thReliability: 'Reliability',
    falsifies: 'Falsifies',
    supports: 'Supports',
    neutral: 'Neutral',
    redTeamTitle: 'Internal Peer Review & Red Teaming Governance',
    redTeamDesc:
      'Challenges core assumptions and documents logical gaps or alternative hypotheses prior to publishing strategic dossiers.',
    altHypPrefix: 'Alternative Hypothesis',
    newChallengeTitle: 'Submit New Red Team Challenge',
    targetEventLabel: 'Target Event Under Review',
    reviewerRoleLabel: 'Reviewer Role',
    defaultReviewerRole: 'Red Team Analyst',
    altHypLabel: 'Proposed Alternative Hypothesis',
    challengeLabel: 'Logical Challenge or Unverified Assumption',
    challengePh: 'e.g. Cooling telemetry from secondary datacenter hub has not been cross-checked...',
    challengeMinErr: 'Please enter a rigorous challenge or counter-hypothesis (min 8 characters).',
    submitChallenge: 'Add Red Team Note',
    roomTitle: 'KYC-Verified Community Analysis Rooms & 5-Tier Epistemic Filter (0.0001 Pi Tier)',
    roomSubtitle: 'Symbolic readings stay quarantined in their tier without polluting verified telemetry',
    allCount: 'All',
    symbolicNotice: 'Methodological Notice: Symbolic resonance or visual clustering does not establish physical causation.',
    addCommentTitle: 'Post Classified Analysis Entry (KYC)',
    handleLabel: 'Verified Analyst Handle',
    defaultHandle: 'KYC_Pioneer_Analyst',
    tierLabel: 'Evidence Tier',
    qKeyLabel: 'Q-KEY Domain',
    bodyLabel: 'Analysis or Evidence Entry',
    bodyPh: 'Provide verifiable telemetry citations or mark clearly as symbolic analysis...',
    publishComment: 'Publish to KYC Room',
    seed1Author: 'Infra_Auditor_A1',
    seed1Body: 'Raw RIPE BGP tables confirm prefix withdrawals occurred before any social-media narrative surge.',
    seed2Author: 'Semiotic_Reviewer',
    seed2Body:
      'Linking the magazine cover ΠΣV motif to payment outages remains an artistic narrative motif rather than causal engineering evidence.',
  },
  fr: {
    title: 'Voie II : Matrice d’Analyse des Hypothèses Concurrentes (ACH — Réfutation)',
    subtitle:
      'Pour neutraliser le biais de confirmation, les hypothèses sont classées par score de réfutation pondéré (A1=1.0 à D4=0.2). Moins il y a de réfutations, plus l’hypothèse est probable.',
    rankLabel: 'Rang',
    mostLikely: 'Hypothèse Principale',
    secondary: 'Piste Secondaire',
    falsificationScore: 'Score Réfutation',
    supportLabel: 'Soutient',
    falsifyLabel: 'Réfute',
    tableTitle: 'Matrice Croisée des Preuves en Direct et des 4 Hypothèses',
    thEvent: 'Événement & Preuve Observée',
    thReliability: 'Fiabilité',
    falsifies: 'Réfute',
    supports: 'Soutient',
    neutral: 'Neutre',
    redTeamTitle: 'Gouvernance Red Team & Revue par les Pairs',
    redTeamDesc:
      'Teste la robustesse des conclusions et documente les hypothèses alternatives avant validation.',
    altHypPrefix: 'Hypothèse alternative',
    newChallengeTitle: 'Soumettre une Objection Méthodologique (Red Team)',
    targetEventLabel: 'Événement évalué',
    reviewerRoleLabel: 'Rôle de l’évaluateur',
    defaultReviewerRole: 'Analyste Red Team',
    altHypLabel: 'Hypothèse alternative proposée',
    challengeLabel: 'Objection logique ou angle mort identifié',
    challengePh: 'ex. Les journaux BGP secondaires n’ont pas encore été recoupés...',
    challengeMinErr: 'Veuillez saisir une objection d’au moins 8 caractères.',
    submitChallenge: 'Enregistrer l’Objection Red Team',
    roomTitle: 'Salles d’Analyse Communautaire KYC & Filtre Épistémique à 5 Niveaux (0,0001 Pi)',
    roomSubtitle: 'Les lectures symboliques restent isolées sans contaminer la couche de télémétrie vérifiée',
    allCount: 'Tout',
    symbolicNotice: 'Note méthodologique : une résonance symbolique ne prouve pas une causalité technique.',
    addCommentTitle: 'Publier une Note Analytique Classifiée (KYC)',
    handleLabel: 'Identifiant KYC Vérifié',
    defaultHandle: 'Pionnier_KYC_FR',
    tierLabel: 'Niveau de preuve',
    qKeyLabel: 'Domaine Q-KEY',
    bodyLabel: 'Texte de l’analyse',
    bodyPh: 'Citez la source technique ou marquez clairement l’interprétation symbolique...',
    publishComment: 'Publier dans la salle KYC',
    seed1Author: 'Auditeur_Infra_A1',
    seed1Body: 'Les tables RIPE BGP brutes confirment des retraits de préfixes avant toute viralité narrative.',
    seed2Author: 'Analyste_Sémiotique',
    seed2Body:
      'Le rapprochement entre le motif ΠΣV de couverture et les pannes bancaires reste symbolique sans valeur causale.',
  },
  id: {
    title: 'Jalur II: Matriks Analisis Hipotesis Bersaing (ACH — Uji Falsifikasi)',
    subtitle:
      'Untuk mencegah bias konfirmasi, hipotesis diurutkan dari skor penyangkalan berbobot sumber terendah (A1=1.0 s/d D4=0.2).',
    rankLabel: 'Peringkat',
    mostLikely: 'Hipotesis Terkuat',
    secondary: 'Kandidat Sekunder',
    falsificationScore: 'Skor Sangkal',
    supportLabel: 'Dukung',
    falsifyLabel: 'Sangkal',
    tableTitle: 'Tabel Silang Bukti Langsung × Empat Hipotesis',
    thEvent: 'Kejadian & Bukti Terpantau',
    thReliability: 'Keandalan',
    falsifies: 'Menyangkali',
    supports: 'Mendukung',
    neutral: 'Netral',
    redTeamTitle: 'Tata Kelola Ulasan Sejawat (Red Teaming)',
    redTeamDesc:
      'Menguji asumsi tim inti dan mendokumentasikan celah logika sebelum laporan disetujui.',
    altHypPrefix: 'Hipotesis alternatif',
    newChallengeTitle: 'Catat Tantangan Red Team Baru',
    targetEventLabel: 'Kejadian Target Ulasan',
    reviewerRoleLabel: 'Peran Pengulas',
    defaultReviewerRole: 'Analis Red Team',
    altHypLabel: 'Hipotesis Alternatif yang Diusulkan',
    challengeLabel: 'Tantangan Logis atau Celah Bukti',
    challengePh: 'cth. Telemetri pendinginan pusat data sekunder belum diverifikasi silang...',
    challengeMinErr: 'Harap masukkan catatan tantangan minimal 8 karakter.',
    submitChallenge: 'Tambahkan Catatan Red Team',
    roomTitle: 'Ruang Analisis Komunitas Terverifikasi KYC & Filter Bukti 5-Tingkat (0,0001 Pi)',
    roomSubtitle: 'Opini simbolik diisolasi pada tingkatnya agar tidak mencemari data terverifikasi',
    allCount: 'Semua',
    symbolicNotice: 'Catatan Metodologis: Kemiripan simbolik tidak membuktikan sebab-akibat teknis nyata.',
    addCommentTitle: 'Tambah Entri Analisis Terklasifikasi (KYC)',
    handleLabel: 'Handle Peneliti KYC',
    defaultHandle: 'Analis_KYC_ID',
    tierLabel: 'Tingkat Bukti',
    qKeyLabel: 'Domain Q-KEY',
    bodyLabel: 'Isi Analisis atau Bukti',
    bodyPh: 'Sertakan referensi telemetri teknis atau tandai sebagai kajian simbolik...',
    publishComment: 'Publikasikan ke Ruang KYC',
    seed1Author: 'Auditor_Infra_A1',
    seed1Body: 'Catatan mentah RIPE BGP mengonfirmasi penarikan prefiks terjadi sebelum lonjakan narasi media.',
    seed2Author: 'Penelaah_Semiotik',
    seed2Body:
      'Kaitan simbol ΠΣV di sampul majalah dengan gangguan pembayaran tetap bersifat simbolik, bukan bukti kausalitas.',
  },
  vi: {
    title: 'Luồng II: Ma Trận Phân Tích Giả Thuyết Cạnh Tranh (ACH — Kiểm Định Bác Bỏ)',
    subtitle:
      'Để loại bỏ thiên kiến xác nhận, các giả thuyết được xếp hạng tăng dần theo điểm bác bỏ có trọng số (A1=1.0 đến D4=0.2).',
    rankLabel: 'Hạng',
    mostLikely: 'Giả Thuyết Mạnh Nhất',
    secondary: 'Phương Án Phụ',
    falsificationScore: 'Điểm Bác Bỏ',
    supportLabel: 'Ủng hộ',
    falsifyLabel: 'Bác bỏ',
    tableTitle: 'Bảng Giao Điểm Bằng Chứng Trực Tiếp × 4 Giả Thuyết',
    thEvent: 'Sự Kiện & Bằng Chứng',
    thReliability: 'Độ Tin Cậy',
    falsifies: 'Bác bỏ',
    supports: 'Ủng hộ',
    neutral: 'Trung lập',
    redTeamTitle: 'Quản Trị Phản Biện Nội Bộ (Red Teaming)',
    redTeamDesc:
      'Kiểm thử giả định cốt lõi và ghi nhận lỗ hổng logic trước khi ban hành báo cáo.',
    altHypPrefix: 'Giả thuyết thay thế',
    newChallengeTitle: 'Ghi Nhận Phản Biện Red Team Mới',
    targetEventLabel: 'Sự Kiện Đang Rà Soát',
    reviewerRoleLabel: 'Vai Trò Người Rà Soát',
    defaultReviewerRole: 'Chuyên Gia Red Team',
    altHypLabel: 'Giả Thuyết Thay Thế Đề Xuất',
    challengeLabel: 'Luận Điểm Phản Biện Hoặc Lỗ Hổng Logic',
    challengePh: 'vd. Nhật ký BGP dự phòng chưa được đối chiếu chéo...',
    challengeMinErr: 'Vui lòng nhập phản biện khoa học tối thiểu 8 ký tự.',
    submitChallenge: 'Thêm Ghi Chú Red Team',
    roomTitle: 'Phòng Phân Tích Cộng Đồng KYC & Bộ Lọc Bằng Chứng 5 Cấp (0.0001 Pi)',
    roomSubtitle: 'Nhận định biểu tượng được tách riêng để không làm nhiễu dữ liệu đã xác minh',
    allCount: 'Tất cả',
    symbolicNotice: 'Lưu ý phương pháp: Sự tương đồng biểu tượng không chứng minh quan hệ nhân quả kỹ thuật.',
    addCommentTitle: 'Đăng Phân Tích Đã Phân Loại (KYC)',
    handleLabel: 'Định Danh Nhà Nghiên Cứu KYC',
    defaultHandle: 'Pioneer_KYC_VN',
    tierLabel: 'Cấp Bằng Chứng',
    qKeyLabel: 'Miền Q-KEY',
    bodyLabel: 'Nội Dung Phân Tích',
    bodyPh: 'Dẫn nguồn dữ liệu kỹ thuật hoặc gắn nhãn phân tích biểu tượng...',
    publishComment: 'Đăng Lên Phòng KYC',
    seed1Author: 'KiemToan_HaTang_A1',
    seed1Body: 'Dữ liệu thô RIPE BGP xác nhận sự cố thu hồi tiền tố xảy ra trước mọi tin đồn mạng.',
    seed2Author: 'ChuyenGia_KyHieuHoc',
    seed2Body:
      'Liên kết biểu tượng ΠΣV trên bìa tạp chí với sự cố thanh toán chỉ mang tính tường thuật biểu tượng, không chứng minh nguyên nhân kỹ thuật.',
  },
};

export default function ACHMatrixView({
  locale,
  events,
  rankings,
  redTeamNotes,
  onAddRedTeamNote,
}: ACHMatrixViewProps) {
  const t = ACH_I18N[locale];
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events[0]?.id ?? ''
  );
  const [authorRole, setAuthorRole] = useState('');
  const [alternativeHypothesis, setAlternativeHypothesis] =
    useState<HypothesisId>('human_error');
  const [challenge, setChallenge] = useState('');
  const [formError, setFormError] = useState('');

  // 5-Level Epistemic Community Room state
  const [communityFilter, setCommunityFilter] = useState<EpistemicTier | 'all'>('all');
  const [commentHandle, setCommentHandle] = useState('');
  const [commentTier, setCommentTier] = useState<EpistemicTier>('plausible');
  const [commentQKey, setCommentQKey] = useState<QKeyDomainId>('trump_era');
  const [commentBody, setCommentBody] = useState('');
  const [userComments, setUserComments] = useState<CommunityComment[]>([]);

  const seededComments: CommunityComment[] = useMemo(
    () => [
      {
        id: 'cm-01',
        eventId: 'ev-01',
        authorHandle: t.seed1Author,
        kycVerified: true,
        tier: 'documented',
        qKeyDomain: 'trump_era',
        body: t.seed1Body,
        createdAt: '08:19 UTC',
      },
      {
        id: 'cm-02',
        eventId: 'ev-03',
        authorHandle: t.seed2Author,
        kycVerified: true,
        tier: 'symbolic',
        qKeyDomain: 'mk_ultra',
        body: t.seed2Body,
        createdAt: '08:46 UTC',
      },
    ],
    [t]
  );

  const comments = [...userComments, ...seededComments];

  const hypothesisOrder: HypothesisId[] = [
    'human_error',
    'infra_failure',
    'cyber_attack',
    'disinfo_cascade',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge.trim() || challenge.trim().length < 8) {
      setFormError(t.challengeMinErr);
      return;
    }
    setFormError('');
    onAddRedTeamNote({
      eventId: selectedEventId || events[0]?.id || 'ev-01',
      authorRole: authorRole.trim() || t.defaultReviewerRole,
      challenge: challenge.trim(),
      alternativeHypothesis,
    });
    setChallenge('');
  };

  return (
    <div className="space-y-6">
      {/* Ranking Summary */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">{t.title}</h2>
            <p className="mt-1 text-sm text-[#A5B4FC]">{t.subtitle}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {rankings.map((item) => (
            <div
              key={item.id}
              className={`rounded-md border p-4 ${
                item.isMostLikely
                  ? 'border-[#10B981] bg-[#10B981]/10'
                  : 'border-[#2B2856] bg-[#0C0D16]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono-tabular font-bold text-white">
                  {t.rankLabel} #{item.rank}
                </span>
                <span
                  className={`font-semibold ${
                    item.isMostLikely ? 'text-[#34D399]' : 'text-[#A5B4FC]'
                  }`}
                >
                  {item.isMostLikely ? t.mostLikely : t.secondary}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-white">{item.label}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                {item.description}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-[#1E1B4B] pt-2 text-xs font-mono-tabular">
                <span className="text-[#FB7185]">
                  {t.falsificationScore}: {item.falsificationScore}
                </span>
                <span className="text-[#A5B4FC]">
                  {t.supportLabel}: {item.supportCount} / {t.falsifyLabel}: {item.falsifyCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Evidence Matrix Table */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] overflow-hidden">
        <div className="border-b border-[#2B2856] px-5 py-3.5">
          <h3 className="text-base font-bold text-white">{t.tableTitle}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-start text-xs">
            <thead>
              <tr className="border-b border-[#2B2856] bg-[#0C0D16] text-[#A5B4FC]">
                <th className="px-4 py-3 font-semibold text-start">{t.thEvent}</th>
                <th className="px-3 py-3 font-semibold text-start">{t.thReliability}</th>
                {hypothesisOrder.map((hId) => (
                  <th key={hId} className="px-3 py-3 font-semibold text-start">
                    {getHypothesisCopy(hId, locale).label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1B4B]">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#16193B]/50">
                  <td className="max-w-[260px] px-4 py-3 align-top">
                    <div className="font-latin-math text-[11px] text-[#A5B4FC]">
                      #{ev.sequence} · {ev.timestamp}
                    </div>
                    <div className="mt-0.5 font-semibold text-white">{ev.title}</div>
                  </td>
                  <td className="px-3 py-3 align-top font-mono-tabular text-[#C084FC]">
                    {ev.reliabilityGrade} (×{RELIABILITY_WEIGHTS[ev.reliabilityGrade]})
                  </td>
                  {hypothesisOrder.map((hId) => {
                    const cell = ev.achEvidence[hId];
                    return (
                      <td key={hId} className="max-w-[180px] px-3 py-3 align-top">
                        <div className="flex items-center gap-1 font-semibold">
                          {cell.polarity === 'falsifies' && (
                            <>
                              <XCircle
                                className="h-3.5 w-3.5 text-[#FB7185] shrink-0"
                                aria-hidden="true"
                              />
                              <span className="text-[#FB7185]">
                                {t.falsifies} (-{cell.weight})
                              </span>
                            </>
                          )}
                          {cell.polarity === 'supports' && (
                            <>
                              <CheckCircle2
                                className="h-3.5 w-3.5 text-[#34D399] shrink-0"
                                aria-hidden="true"
                              />
                              <span className="text-[#34D399]">{t.supports}</span>
                            </>
                          )}
                          {cell.polarity === 'neutral' && (
                            <>
                              <Minus
                                className="h-3.5 w-3.5 text-[#A5B4FC] shrink-0"
                                aria-hidden="true"
                              />
                              <span className="text-[#A5B4FC]">{t.neutral}</span>
                            </>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#CBD5E1]">
                          {cell.note}
                        </p>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Red Teaming Governance Panel */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#E11D48]" aria-hidden="true" />
          <h3 className="text-base font-bold text-white">{t.redTeamTitle}</h3>
        </div>
        <p className="mt-1 text-xs text-[#A5B4FC]">{t.redTeamDesc}</p>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-2.5">
            {events.map((ev) => (
              <div
                key={`rt-${ev.id}`}
                className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3 text-xs"
              >
                <div className="font-semibold text-white">
                  #{ev.sequence} {ev.title}
                </div>
                <p className="mt-1 text-[#CBD5E1]">{ev.redTeamCounter}</p>
              </div>
            ))}
            {redTeamNotes.map((note) => (
              <div
                key={note.id}
                className="rounded border border-[#9333EA] bg-[#2E1065]/40 p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2 font-semibold text-white">
                  <span>{note.authorRole}</span>
                  <span className="font-latin-math text-[11px] text-[#A5B4FC]">
                    {note.createdAt}
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-medium text-[#C084FC]">
                  {t.altHypPrefix}: {getHypothesisCopy(note.alternativeHypothesis, locale).label}
                </div>
                <p className="mt-1 text-[#E5E7EB]">{note.challenge}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-md border border-[#2B2856] bg-[#0C0D16] p-4 space-y-3"
          >
            <h4 className="text-sm font-bold text-white">{t.newChallengeTitle}</h4>
            <div>
              <label
                htmlFor="rt-event"
                className="block text-xs font-medium text-[#C7D2FE]"
              >
                {t.targetEventLabel}
              </label>
              <select
                id="rt-event"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#121329] px-3 py-2 text-xs text-white"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    #{ev.sequence} — {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="rt-role"
                  className="block text-xs font-medium text-[#C7D2FE]"
                >
                  {t.reviewerRoleLabel}
                </label>
                <input
                  id="rt-role"
                  type="text"
                  value={authorRole}
                  placeholder={t.defaultReviewerRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#121329] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="rt-hyp"
                  className="block text-xs font-medium text-[#C7D2FE]"
                >
                  {t.altHypLabel}
                </label>
                <select
                  id="rt-hyp"
                  value={alternativeHypothesis}
                  onChange={(e) =>
                    setAlternativeHypothesis(e.target.value as HypothesisId)
                  }
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#121329] px-3 py-2 text-xs text-white"
                >
                  {hypothesisOrder.map((hId) => (
                    <option key={hId} value={hId}>
                      {getHypothesisCopy(hId, locale).label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="rt-challenge"
                className="block text-xs font-medium text-[#C7D2FE]"
              >
                {t.challengeLabel}
              </label>
              <textarea
                id="rt-challenge"
                rows={3}
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                placeholder={t.challengePh}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#121329] px-3 py-2 text-xs text-white placeholder:text-[#6366F1]/70"
              />
            </div>

            {formError && (
              <p role="alert" className="text-xs font-medium text-[#FB7185]">
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="rounded-md bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9] transition-colors"
            >
              {t.submitChallenge}
            </button>
          </form>
        </div>
      </section>

      {/* 5-Level Epistemic Evidence Matrix & KYC Community Analysis Room */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2856] pb-3.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#C084FC]" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">{t.roomTitle}</h3>
          </div>
          <span className="text-xs text-[#A5B4FC]">{t.roomSubtitle}</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(EPISTEMIC_TIER_META) as EpistemicTier[]).map((tier) => {
            const meta = EPISTEMIC_TIER_META[tier];
            const tierCopy = getEpistemicCopy(tier, locale);
            return (
              <div
                key={tier}
                className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-1 font-bold">
                  <span style={{ color: meta.color }}>{tierCopy.label}</span>
                  <span className="text-[10px] text-[#A5B4FC]">
                    {tierCopy.signal}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#CBD5E1]">
                  {tierCopy.rule}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCommunityFilter('all')}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold ${
                  communityFilter === 'all'
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-[#A5B4FC] hover:bg-[#191B38]'
                }`}
              >
                {t.allCount} ({comments.length})
              </button>
              {(Object.keys(EPISTEMIC_TIER_META) as EpistemicTier[]).map((tier) => (
                <button
                  key={`f-${tier}`}
                  type="button"
                  onClick={() => setCommunityFilter(tier)}
                  className={`rounded border px-2.5 py-1 text-[11px] font-semibold ${
                    communityFilter === tier
                      ? 'border-white bg-[#1E1038] text-white'
                      : 'border-[#1E1B4B] text-[#CBD5E1]'
                  }`}
                >
                  {getEpistemicCopy(tier, locale).label}
                </button>
              ))}
            </div>

            {comments
              .filter((c) => communityFilter === 'all' || c.tier === communityFilter)
              .map((cm) => {
                const tierMeta = EPISTEMIC_TIER_META[cm.tier];
                const tierCopy = getEpistemicCopy(cm.tier, locale);
                return (
                  <div
                    key={cm.id}
                    className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5 text-xs space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{cm.authorHandle}</span>
                        <span aria-hidden="true" className="text-[#6366F1]">·</span>
                        <span style={{ color: tierMeta.color }} className="font-semibold">
                          {tierCopy.label}
                        </span>
                        <span aria-hidden="true" className="text-[#6366F1]">·</span>
                        <span className="text-[#A5B4FC]">
                          Q-KEY: {getQKeyCopy(cm.qKeyDomain, locale)}
                        </span>
                      </div>
                      <span className="font-latin-math text-[#A5B4FC]">{cm.createdAt}</span>
                    </div>
                    <p className="leading-relaxed text-[#E5E7EB]">{cm.body}</p>
                    {(cm.tier === 'symbolic' || cm.tier === 'speculative') && (
                      <div className="text-[11px] text-[#FDA4AF]">
                        {t.symbolicNotice}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (commentBody.trim().length < 6) return;
              setUserComments((prev) => [
                {
                  id: `cm-${Date.now()}`,
                  eventId: selectedEventId || events[0]?.id || 'ev-01',
                  authorHandle: commentHandle.trim() || t.defaultHandle,
                  kycVerified: true,
                  tier: commentTier,
                  qKeyDomain: commentQKey,
                  body: commentBody.trim(),
                  createdAt: new Date().toISOString().slice(11, 16) + ' UTC',
                },
                ...prev,
              ]);
              setCommentBody('');
            }}
            className="lg:col-span-5 rounded border border-[#2B2856] bg-[#0C0D16] p-4 space-y-3 text-xs"
          >
            <h4 className="text-sm font-bold text-white">{t.addCommentTitle}</h4>
            <div>
              <label htmlFor="cm-handle" className="block text-[#C7D2FE]">
                {t.handleLabel}
              </label>
              <input
                id="cm-handle"
                type="text"
                value={commentHandle}
                placeholder={t.defaultHandle}
                onChange={(e) => setCommentHandle(e.target.value)}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#121329] px-3 py-1.5 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="cm-tier" className="block text-[#C7D2FE]">
                  {t.tierLabel}
                </label>
                <select
                  id="cm-tier"
                  value={commentTier}
                  onChange={(e) => setCommentTier(e.target.value as EpistemicTier)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#121329] px-2 py-1.5 text-white"
                >
                  {(Object.keys(EPISTEMIC_TIER_META) as EpistemicTier[]).map((tierKey) => (
                    <option key={tierKey} value={tierKey}>
                      {getEpistemicCopy(tierKey, locale).label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cm-qkey" className="block text-[#C7D2FE]">
                  {t.qKeyLabel}
                </label>
                <select
                  id="cm-qkey"
                  value={commentQKey}
                  onChange={(e) => setCommentQKey(e.target.value as QKeyDomainId)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#121329] px-2 py-1.5 text-white"
                >
                  {QKEY_DOMAINS.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.index}. {getQKeyCopy(q.id, locale)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="cm-body" className="block text-[#C7D2FE]">
                {t.bodyLabel}
              </label>
              <textarea
                id="cm-body"
                rows={3}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={t.bodyPh}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#121329] px-3 py-2 text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-[#7C3AED] px-4 py-2 font-semibold text-white hover:bg-[#6D28D9]"
            >
              {t.publishComment}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
