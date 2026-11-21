'use client';

import React, { useMemo, useState } from 'react';
import {
  Cpu,
  Download,
  Copy,
  Check,
  Vote,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import {
  AppLocale,
  ForecastBranch,
  GovernanceProposal,
  LiveEvent,
  MathTrajectoryMetrics,
  PlatformImpactSummary,
  RiskScenarioInput,
  ScenarioProbabilities,
  TrajectoryGraph,
} from '@/lib/types';
import {
  INITIAL_GOVERNANCE_PROPOSALS,
  analyzeThreatAndGenerateBundle,
  computeFeeEconomicsStrategies,
} from '@/lib/pi-ecosystem-engine';
import { THREAT_PRESETS_I18N } from '@/lib/i18n-data';
import {
  getPlatformCopy,
  getThreatCopy,
  localizeGovernanceProposal,
} from '@/lib/i18n';
import TrajectoryMap from './TrajectoryMap';

interface RiskAgentGeneratorViewProps {
  locale: AppLocale;
  events: LiveEvent[];
  graph: TrajectoryGraph;
  probabilities: ScenarioProbabilities;
  mathMetrics: MathTrajectoryMetrics;
  forecasts: ForecastBranch[];
  platformMatrix: PlatformImpactSummary[];
  selectedEventId: string | null;
  onSelectEventOnMap: (eventId: string) => void;
  isStreaming: boolean;
  onToggleStream: () => void;
  onStepForward: () => void;
  onResetTimeline: () => void;
  onSimulateAiEvent: () => void;
  isSimulatingAi: boolean;
  hasMoreSeedEvents: boolean;
}

type ArtifactTab = 'mcp' | 'soroban' | 'solohost' | 'subscription' | 'agents_md';

const RISK_GEN_UI: Record<
  AppLocale,
  {
    sectionHeading: string;
    threatCatLabel: string;
    titleLabel: string;
    severityLabel: string;
    probLabel: string;
    depLabel: string;
    usdLabel: string;
    piUsdLabel: string;
    spreadLabel: string;
    compositeRiskLabel: string;
    hedgeCostLabel: string;
    spreadWarning: string;
    riskLevels: Record<'critical' | 'high' | 'moderate', string>;
    publishGovBtn: string;
    publishedPrefix: string;
    publishedSummary: (piCost: number) => string;
    tabMcp: string;
    tabSoroban: string;
    tabSolohost: string;
    tabSubscription: string;
    tabAgentsMd: string;
    copiedText: string;
    copyText: string;
    exportText: string;
    feeHeading: string;
    govHeading: string;
    govSubtitle: string;
    statusStaged: string;
    statusSandbox: string;
    statusVoting: string;
    votesForLabel: string;
    quorumLabel: string;
    votesAgainstLabel: string;
    votedForBtn: string;
    voteForBtn: string;
    votedAgainstBtn: string;
    voteAgainstBtn: string;
    platformMatrixHeading: string;
    eventsWord: string;
  }
> = {
  ar: {
    sectionHeading: 'محاكي التهديدات المستقبلية ومولّد وكلاء الذكاء الاصطناعي وعقود Soroban / PiRC2',
    threatCatLabel: 'فئة التهديد المستقبلي',
    titleLabel: 'وصف سيناريو الخطر المستهدف',
    severityLabel: 'الشدة (1-10)',
    probLabel: 'الاحتمال %',
    depLabel: 'الاعتمادية',
    usdLabel: 'التكلفة ($)',
    piUsdLabel: 'وسيط PI/USD',
    spreadLabel: 'فارق الأوراكل %',
    compositeRiskLabel: 'نسبة الخطورة المركبة',
    hedgeCostLabel: 'تكلفة التحوط بعملة Pi (PiRC-203)',
    spreadWarning: 'تنبيه PiRC-254: الفارق السعري تجاوز 4.5% — تم تفعيل الفشل الآمن!',
    riskLevels: { critical: 'حرج', high: 'مرتفع', moderate: 'متوسط' },
    publishGovBtn: 'تقديم الحزمة المولّدة للتصويت والحوكمة (KYC)',
    publishedPrefix: 'حزمة حماية:',
    publishedSummary: (pi) =>
      `تم توليد الحزمة تلقائياً بتكلفة تحوط ${pi} Pi عبر أوراكل PiRC-203 وقاطع PiRC-254.`,
    tabMcp: 'وكيل MCP + x402',
    tabSoroban: 'عقد Soroban PiRC2',
    tabSolohost: 'حزمة SoloHost',
    tabSubscription: 'مواصفة 0.0001 Pi',
    tabAgentsMd: 'agents.md',
    copiedText: 'تم النسخ',
    copyText: 'نسخ',
    exportText: 'تصدير',
    feeHeading: 'معالجة اقتصادية لاشتراك 0.0001 Pi شهرياً مقابل رسم Mainnet الأساسي (0.01 Pi)',
    govHeading: 'بوابة الحوكمة والتصويت الموثق بـ KYC لاعتماد الوكلاء والعقود',
    govSubtitle: 'مقاومة هجمات Sybil · الفحص الآلي → التصويت → النشر المرحلي',
    statusStaged: 'جاهز للنشر المرحلي',
    statusSandbox: 'اجتاز الفحص الآلي',
    statusVoting: 'قيد التصويت',
    votesForLabel: 'المؤيدون:',
    quorumLabel: 'النصاب',
    votesAgainstLabel: 'المعارضون:',
    votedForBtn: 'تم التأييد (KYC)',
    voteForBtn: 'تأييد عبر KYC',
    votedAgainstBtn: 'تم الرفض',
    voteAgainstBtn: 'تحفظ تقني',
    platformMatrixHeading: 'مصفوفة إجهاد المنصات الخمس (الواجهة الخلفية)',
    eventsWord: 'أحداث',
  },
  en: {
    sectionHeading: 'Future Threat Simulator, AI Agent & Soroban / PiRC2 Contract Generator',
    threatCatLabel: 'Threat Category',
    titleLabel: 'Target Risk Scenario Description',
    severityLabel: 'Severity (1–10)',
    probLabel: 'Probability %',
    depLabel: 'Dependency',
    usdLabel: 'Impact ($ USD)',
    piUsdLabel: 'PI/USD Median',
    spreadLabel: 'Oracle Spread %',
    compositeRiskLabel: 'Composite Risk Score',
    hedgeCostLabel: 'PiRC-203 Hedge Budget (Pi)',
    spreadWarning: 'PiRC-254 Alert: Oracle spread exceeded 4.5% — fail-safe engaged!',
    riskLevels: { critical: 'Critical', high: 'High', moderate: 'Moderate' },
    publishGovBtn: 'Submit Generated Bundle to KYC Governance',
    publishedPrefix: 'Guard Bundle:',
    publishedSummary: (pi) =>
      `Auto-generated defense bundle hedged at ${pi} Pi via PiRC-203 oracle & PiRC-254 breaker.`,
    tabMcp: 'MCP + x402 Agent',
    tabSoroban: 'Soroban PiRC2',
    tabSolohost: 'SoloHost Manifest',
    tabSubscription: '0.0001 Pi Spec',
    tabAgentsMd: 'agents.md',
    copiedText: 'Copied',
    copyText: 'Copy',
    exportText: 'Export',
    feeHeading: 'Fee Economics: 0.0001 Pi/month Micro-Subscription vs 0.01 Pi Mainnet Base Fee',
    govHeading: 'KYC-Verified Governance & Voting for Agents and Smart Contracts',
    govSubtitle: 'Sybil-Resistant · Sandbox Audit → Community Vote → Staged Rollout',
    statusStaged: 'Staged Rollout',
    statusSandbox: 'Sandbox Passed',
    statusVoting: 'Voting Open',
    votesForLabel: 'For:',
    quorumLabel: 'Quorum',
    votesAgainstLabel: 'Against:',
    votedForBtn: 'Approved (KYC)',
    voteForBtn: 'Approve via KYC',
    votedAgainstBtn: 'Rejected',
    voteAgainstBtn: 'Flag Concern',
    platformMatrixHeading: 'Five-Platform Stress Matrix (Backend Analytics)',
    eventsWord: 'events',
  },
  fr: {
    sectionHeading: 'Simulateur de Menaces, Générateur d’Agents IA & Contrats Soroban / PiRC2',
    threatCatLabel: 'Catégorie de menace',
    titleLabel: 'Scénario de risque ciblé',
    severityLabel: 'Sévérité (1–10)',
    probLabel: 'Probabilité %',
    depLabel: 'Dépendance',
    usdLabel: 'Coût ($ USD)',
    piUsdLabel: 'Médiane PI/USD',
    spreadLabel: 'Écart Oracle %',
    compositeRiskLabel: 'Score de risque composite',
    hedgeCostLabel: 'Couverture Pi (PiRC-203)',
    spreadWarning: 'Alerte PiRC-254 : Écart oracle > 4,5 % — repli sûr activé !',
    riskLevels: { critical: 'Critique', high: 'Élevé', moderate: 'Modéré' },
    publishGovBtn: 'Soumettre au vote de gouvernance KYC',
    publishedPrefix: 'Module Défense :',
    publishedSummary: (pi) =>
      `Généré automatiquement (${pi} Pi via oracle PiRC-203 et disjoncteur PiRC-254).`,
    tabMcp: 'Agent MCP + x402',
    tabSoroban: 'Contrat Soroban',
    tabSolohost: 'Manifeste SoloHost',
    tabSubscription: 'Spec 0,0001 Pi',
    tabAgentsMd: 'agents.md',
    copiedText: 'Copié',
    copyText: 'Copier',
    exportText: 'Exporter',
    feeHeading: 'Économie des frais : 0,0001 Pi/mois face aux frais de base Mainnet (0,01 Pi)',
    govHeading: 'Portail de Gouvernance & Vote Vérifié KYC',
    govSubtitle: 'Anti-Sybil · Audit Auto → Vote → Déploiement Progressif',
    statusStaged: 'Déploiement Prêt',
    statusSandbox: 'Audit Sandbox OK',
    statusVoting: 'Vote en cours',
    votesForLabel: 'Pour :',
    quorumLabel: 'Quorum',
    votesAgainstLabel: 'Contre :',
    votedForBtn: 'Approuvé (KYC)',
    voteForBtn: 'Soutenir (KYC)',
    votedAgainstBtn: 'Réservé',
    voteAgainstBtn: 'Réserve Technique',
    platformMatrixHeading: 'Matrice de Tension des Cinq Plateformes',
    eventsWord: 'faits',
  },
  id: {
    sectionHeading: 'Simulator Ancaman & Generator Agen AI + Kontrak Soroban / PiRC2',
    threatCatLabel: 'Kategori Ancaman',
    titleLabel: 'Deskripsi Skenario Risiko Target',
    severityLabel: 'Keparahan (1–10)',
    probLabel: 'Probabilitas %',
    depLabel: 'Ketergantungan',
    usdLabel: 'Biaya ($ USD)',
    piUsdLabel: 'Median PI/USD',
    spreadLabel: 'Selisih Oracle %',
    compositeRiskLabel: 'Skor Risiko Gabungan',
    hedgeCostLabel: 'Biaya Lindung Nilai Pi (PiRC-203)',
    spreadWarning: 'Peringatan PiRC-254: Selisih oracle > 4,5% — mode aman aktif!',
    riskLevels: { critical: 'Kritis', high: 'Tinggi', moderate: 'Sedang' },
    publishGovBtn: 'Ajukan Paket ke Voting Tata Kelola KYC',
    publishedPrefix: 'Paket Proteksi:',
    publishedSummary: (pi) =>
      `Paket otomatis dengan biaya lindung ${pi} Pi via oracle PiRC-203 & pemutus PiRC-254.`,
    tabMcp: 'Agen MCP + x402',
    tabSoroban: 'Kontrak Soroban',
    tabSolohost: 'Manifes SoloHost',
    tabSubscription: 'Spek 0.0001 Pi',
    tabAgentsMd: 'agents.md',
    copiedText: 'Disalin',
    copyText: 'Salin',
    exportText: 'Ekspor',
    feeHeading: 'Ekonomi Biaya: Langganan Mikro 0.0001 Pi/Bulan vs Biaya Dasar 0.01 Pi',
    govHeading: 'Portal Tata Kelola & Voting Terverifikasi KYC',
    govSubtitle: 'Tahan Sybil · Audit Otomatis → Voting → Rilis Bertahap',
    statusStaged: 'Siap Rilis Bertahap',
    statusSandbox: 'Lulus Sandbox',
    statusVoting: 'Sedang Voting',
    votesForLabel: 'Setuju:',
    quorumLabel: 'Kuorum',
    votesAgainstLabel: 'Menolak:',
    votedForBtn: 'Disetujui (KYC)',
    voteForBtn: 'Setujui via KYC',
    votedAgainstBtn: 'Ditolak',
    voteAgainstBtn: 'Beri Catatan',
    platformMatrixHeading: 'Matriks Tekanan Lima Lapisan Platform',
    eventsWord: 'kejadian',
  },
  vi: {
    sectionHeading: 'Mô Phỏng Mối Đe Dọa & Trình Tạo Tác Nhân AI / Hợp Đồng Soroban PiRC2',
    threatCatLabel: 'Nhóm Mối Đe Dọa',
    titleLabel: 'Mô Tả Kịch Bản Rủi Ro Mục Tiêu',
    severityLabel: 'Mức Độ (1–10)',
    probLabel: 'Xác Suất %',
    depLabel: 'Phụ Thuộc',
    usdLabel: 'Chi Phí ($ USD)',
    piUsdLabel: 'Trung Vị PI/USD',
    spreadLabel: 'Độ Lệch Oracle %',
    compositeRiskLabel: 'Điểm Rủi Ro Tổng Hợp',
    hedgeCostLabel: 'Ngân Sách Phòng Vệ Pi (PiRC-203)',
    spreadWarning: 'Cảnh báo PiRC-254: Độ lệch oracle > 4,5% — đã kích hoạt chế độ an toàn!',
    riskLevels: { critical: 'Nghiêm Trọng', high: 'Cao', moderate: 'Trung Bình' },
    publishGovBtn: 'Gửi Gói Đã Tạo Tới Bỏ Phiếu Quản Trị KYC',
    publishedPrefix: 'Gói Bảo Vệ:',
    publishedSummary: (pi) =>
      `Gói phòng vệ tự động định mức ${pi} Pi qua oracle PiRC-203 & cầu dao PiRC-254.`,
    tabMcp: 'Tác Nhân MCP + x402',
    tabSoroban: 'Hợp Đồng Soroban',
    tabSolohost: 'SoloHost Manifest',
    tabSubscription: 'Đặc Tả 0.0001 Pi',
    tabAgentsMd: 'agents.md',
    copiedText: 'Đã Chép',
    copyText: 'Sao Chép',
    exportText: 'Xuất Tệp',
    feeHeading: 'Kinh Tế Phí: Gói Vi Mô 0,0001 Pi/Tháng So Với Phí Nền Mainnet 0,01 Pi',
    govHeading: 'Cổng Quản Trị & Bỏ Phiếu Xác Minh KYC Cho Tác Nhân & Hợp Đồng',
    govSubtitle: 'Chống Sybil · Kiểm Thử Tự Động → Bỏ Phiếu → Triển Khai Từng Bước',
    statusStaged: 'Sẵn Sàng Triển Khai',
    statusSandbox: 'Đạt Kiểm Thử',
    statusVoting: 'Đang Bỏ Phiếu',
    votesForLabel: 'Ủng Hộ:',
    quorumLabel: 'Ngưỡng',
    votesAgainstLabel: 'Phản Đối:',
    votedForBtn: 'Đã Ủng Hộ (KYC)',
    voteForBtn: 'Ủng Hộ Qua KYC',
    votedAgainstBtn: 'Đã Phản Biện',
    voteAgainstBtn: 'Lưu Ý Kỹ Thuật',
    platformMatrixHeading: 'Ma Trận Áp Lực 5 Tầng Nền Tảng (Hậu Trường)',
    eventsWord: 'sự kiện',
  },
};

export default function RiskAgentGeneratorView({
  locale,
  events,
  graph,
  probabilities,
  mathMetrics,
  forecasts,
  platformMatrix,
  selectedEventId,
  onSelectEventOnMap,
  isStreaming,
  onToggleStream,
  onStepForward,
  onResetTimeline,
  onSimulateAiEvent,
  isSimulatingAi,
  hasMoreSeedEvents,
}: RiskAgentGeneratorViewProps) {
  const ui = RISK_GEN_UI[locale];
  const threatPresets = THREAT_PRESETS_I18N[locale];

  const [threatCategory, setThreatCategory] =
    useState<RiskScenarioInput['threatCategory']>('web_exploit');
  const [customTitle, setCustomTitle] = useState('');
  const [titleEdited, setTitleEdited] = useState(false);
  const [severity, setSeverity] = useState(8);
  const [probabilityPct, setProbabilityPct] = useState(72);
  const [dependencyFactor, setDependencyFactor] = useState(7);
  const [estimatedUsdCost, setEstimatedUsdCost] = useState(1250);
  const [piUsdMedianPrice, setPiUsdMedianPrice] = useState(0.624);
  const [oracleSpreadPct, setOracleSpreadPct] = useState(1.85);
  const [artifactTab, setArtifactTab] = useState<ArtifactTab>('mcp');
  const [copied, setCopied] = useState(false);

  const [proposals, setProposals] = useState<GovernanceProposal[]>(
    INITIAL_GOVERNANCE_PROPOSALS
  );
  const [votedIds, setVotedIds] = useState<Record<string, 'for' | 'against'>>({});

  const effectiveTitle = titleEdited
    ? customTitle
    : threatPresets[threatCategory].defaultTitle;

  const bundle = useMemo(
    () =>
      analyzeThreatAndGenerateBundle(
        {
          title: effectiveTitle,
          threatCategory,
          severity,
          probabilityPct,
          dependencyFactor,
          estimatedUsdCost,
          piUsdMedianPrice,
          oracleSpreadPct,
        },
        locale
      ),
    [
      effectiveTitle,
      threatCategory,
      severity,
      probabilityPct,
      dependencyFactor,
      estimatedUsdCost,
      piUsdMedianPrice,
      oracleSpreadPct,
      locale,
    ]
  );

  const feeStrategies = useMemo(
    () => computeFeeEconomicsStrategies(locale),
    [locale]
  );

  const localizedProposals = useMemo(
    () => proposals.map((p) => localizeGovernanceProposal(p, locale)),
    [proposals, locale]
  );

  const activeArtifactContent =
    artifactTab === 'mcp'
      ? bundle.mcpAgentCode
      : artifactTab === 'soroban'
      ? bundle.sorobanContractCode
      : artifactTab === 'solohost'
      ? bundle.soloHostManifest
      : artifactTab === 'subscription'
      ? bundle.subscriptionSpecJson
      : bundle.agentsMarkdown;

  const activeArtifactFilename =
    artifactTab === 'mcp'
      ? 'mcp-server.ts'
      : artifactTab === 'soroban'
      ? 'pirc2_subscription.rs'
      : artifactTab === 'solohost'
      ? 'solohost-manifest.json'
      : artifactTab === 'subscription'
      ? 'pirc2-x402-spec.json'
      : 'agents.md';

  const handleCopyArtifact = async () => {
    try {
      await navigator.clipboard.writeText(activeArtifactContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback ignored cleanly in headless contexts
    }
  };

  const handleDownloadArtifact = () => {
    const blob = new Blob([activeArtifactContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeArtifactFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublishToGovernance = () => {
    const newProposal: GovernanceProposal = {
      id: `prop-${Date.now()}`,
      title: `${ui.publishedPrefix} ${effectiveTitle}`,
      kind: artifactTab === 'soroban' ? 'soroban_contract' : 'mcp_agent',
      riskScorePct: bundle.riskScorePct,
      pricePi: 0.0001,
      status: 'sandbox_passed',
      votesFor: 1,
      votesAgainst: 0,
      quorumRequired: 180,
      summary: ui.publishedSummary(bundle.estimatedPiCost),
      artifactSnippet: activeArtifactContent.split('\n').slice(0, 3).join(' '),
    };
    setProposals((prev) => [newProposal, ...prev]);
  };

  const handleCastVote = (proposalId: string, dir: 'for' | 'against') => {
    if (votedIds[proposalId]) return;
    setVotedIds((prev) => ({ ...prev, [proposalId]: dir }));
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const votesFor = p.votesFor + (dir === 'for' ? 1 : 0);
        const votesAgainst = p.votesAgainst + (dir === 'against' ? 1 : 0);
        return {
          ...p,
          votesFor,
          votesAgainst,
          status: votesFor >= p.quorumRequired ? 'staged_rollout' : p.status,
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Risk Simulator & Code Generator (MCP / SoloHost / Soroban PiRC2) */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2856] pb-3.5">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#C084FC]" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">{ui.sectionHeading}</h3>
          </div>
          <span className="font-latin-math text-xs text-[#A5B4FC]">
            PiRC-203 Oracle · PiRC-254 Breaker
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Scenario Controls */}
          <div className="lg:col-span-5 space-y-3 text-xs">
            <div>
              <label htmlFor="risk-cat" className="block font-semibold text-white">
                {ui.threatCatLabel}
              </label>
              <select
                id="risk-cat"
                value={threatCategory}
                onChange={(e) => {
                  const cat = e.target.value as RiskScenarioInput['threatCategory'];
                  setThreatCategory(cat);
                  setTitleEdited(false);
                }}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              >
                {Object.entries(threatPresets).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="risk-title" className="block font-semibold text-white">
                {ui.titleLabel}
              </label>
              <input
                id="risk-title"
                type="text"
                value={effectiveTitle}
                onChange={(e) => {
                  setCustomTitle(e.target.value);
                  setTitleEdited(true);
                }}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="risk-sev" className="block text-[#A5B4FC]">
                  {ui.severityLabel}
                </label>
                <input
                  id="risk-sev"
                  type="number"
                  min={1}
                  max={10}
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-2 py-1.5 font-latin-math text-white"
                />
              </div>
              <div>
                <label htmlFor="risk-prob" className="block text-[#A5B4FC]">
                  {ui.probLabel}
                </label>
                <input
                  id="risk-prob"
                  type="number"
                  min={1}
                  max={100}
                  value={probabilityPct}
                  onChange={(e) => setProbabilityPct(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-2 py-1.5 font-latin-math text-white"
                />
              </div>
              <div>
                <label htmlFor="risk-dep" className="block text-[#A5B4FC]">
                  {ui.depLabel}
                </label>
                <input
                  id="risk-dep"
                  type="number"
                  min={1}
                  max={10}
                  value={dependencyFactor}
                  onChange={(e) =>
                    setDependencyFactor(Number(e.target.value) || 1)
                  }
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-2 py-1.5 font-latin-math text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="risk-usd" className="block text-[#A5B4FC]">
                  {ui.usdLabel}
                </label>
                <input
                  id="risk-usd"
                  type="number"
                  min={10}
                  value={estimatedUsdCost}
                  onChange={(e) =>
                    setEstimatedUsdCost(Number(e.target.value) || 10)
                  }
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-2 py-1.5 font-latin-math text-white"
                />
              </div>
              <div>
                <label htmlFor="risk-pi-usd" className="block text-[#A5B4FC]">
                  {ui.piUsdLabel}
                </label>
                <input
                  id="risk-pi-usd"
                  type="number"
                  step="0.01"
                  min={0.05}
                  value={piUsdMedianPrice}
                  onChange={(e) =>
                    setPiUsdMedianPrice(Number(e.target.value) || 0.1)
                  }
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-2 py-1.5 font-latin-math text-white"
                />
              </div>
              <div>
                <label htmlFor="risk-spread" className="block text-[#A5B4FC]">
                  {ui.spreadLabel}
                </label>
                <input
                  id="risk-spread"
                  type="number"
                  step="0.1"
                  min={0}
                  max={30}
                  value={oracleSpreadPct}
                  onChange={(e) => setOracleSpreadPct(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-2 py-1.5 font-latin-math text-white"
                />
              </div>
            </div>

            {/* Precautionary Output Summary */}
            <div className="rounded border border-[#2B2856] bg-[#0C0D16] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{ui.compositeRiskLabel}</span>
                <span className="font-latin-math text-base font-bold text-[#E11D48] tabular-nums">
                  {bundle.riskScorePct}% ({ui.riskLevels[bundle.riskLevel]})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{ui.hedgeCostLabel}</span>
                <span className="font-latin-math text-base font-bold text-[#C084FC] tabular-nums">
                  {bundle.estimatedPiCost} Pi
                </span>
              </div>
              {bundle.oracleStatus === 'spread_warning' && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FBBF24]">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{ui.spreadWarning}</span>
                </div>
              )}
              <ul className="mt-2 space-y-1 border-t border-[#1E1B4B] pt-2 text-[#CBD5E1]">
                {bundle.precautionarySteps.map((step, idx) => (
                  <li key={idx}>• {step}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handlePublishToGovernance}
              className="w-full rounded-md bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9] transition-colors"
            >
              {ui.publishGovBtn}
            </button>
          </div>

          {/* Code Export Tabs */}
          <div className="lg:col-span-7 flex flex-col rounded-md border border-[#2B2856] bg-[#0C0D16] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E1B4B] bg-[#121329] px-3 py-2">
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    { id: 'mcp', label: ui.tabMcp },
                    { id: 'soroban', label: ui.tabSoroban },
                    { id: 'solohost', label: ui.tabSolohost },
                    { id: 'subscription', label: ui.tabSubscription },
                    { id: 'agents_md', label: ui.tabAgentsMd },
                  ] as { id: ArtifactTab; label: string }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setArtifactTab(t.id)}
                    className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      artifactTab === t.id
                        ? 'bg-[#7C3AED] text-white'
                        : 'text-[#A5B4FC] hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyArtifact}
                  className="inline-flex items-center gap-1 rounded border border-[#312E81] px-2.5 py-1 text-[11px] text-[#E0E7FF] hover:border-[#C084FC]"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-[#4ADE80]" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3 w-3" aria-hidden="true" />
                  )}
                  <span>{copied ? ui.copiedText : ui.copyText}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadArtifact}
                  className="inline-flex items-center gap-1 rounded border border-[#312E81] px-2.5 py-1 text-[11px] text-[#E0E7FF] hover:border-[#C084FC]"
                >
                  <Download className="h-3 w-3" aria-hidden="true" />
                  <span>{ui.exportText}</span>
                </button>
              </div>
            </div>
            <pre
              dir="ltr"
              className="flex-1 overflow-auto p-3.5 font-latin-math text-[11px] leading-relaxed text-[#E0E7FF] max-h-[380px]"
            >
              {activeArtifactContent}
            </pre>
          </div>
        </div>
      </section>

      {/* 2. 0.0001 Pi Micro-Subscription Economics vs 0.01 Pi Base Fee */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex items-center gap-2 border-b border-[#2B2856] pb-3">
          <Coins className="h-5 w-5 text-[#C084FC]" aria-hidden="true" />
          <h3 className="text-base font-bold text-white">{ui.feeHeading}</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          {feeStrategies.map((st) => (
            <div
              key={st.id}
              className={`rounded border p-3 text-xs ${
                st.effectiveGasRatioPct >= 90
                  ? 'border-[#E11D48]/60 bg-[#2D0A18]/40'
                  : 'border-[#1E1B4B] bg-[#0C0D16]'
              }`}
            >
              <div className="font-bold text-white">{st.nameAr}</div>
              <div className="mt-1 font-latin-math text-[11px] font-semibold text-[#C084FC]">
                {st.gasMultiplierLabel}
              </div>
              <p className="mt-1.5 leading-relaxed text-[#CBD5E1]">
                {st.mechanismAr}
              </p>
              <div className="mt-2 border-t border-[#1E1B4B] pt-1.5 text-[11px] text-[#A5B4FC]">
                {st.readinessStatusAr}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. KYC-Verified Governance Voting for Proposed Agents & Contracts */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B2856] pb-3">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-[#16A34A]" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">{ui.govHeading}</h3>
          </div>
          <span className="text-xs text-[#A5B4FC]">{ui.govSubtitle}</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {localizedProposals.map((prop) => {
            const pct = Math.min(
              100,
              Math.round((prop.votesFor / prop.quorumRequired) * 100)
            );
            const myVote = votedIds[prop.id];
            return (
              <div
                key={prop.id}
                className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-4 text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white">{prop.title}</span>
                  <span className="font-latin-math text-[11px] font-semibold text-[#4ADE80]">
                    {prop.status === 'staged_rollout'
                      ? ui.statusStaged
                      : prop.status === 'sandbox_passed'
                      ? ui.statusSandbox
                      : ui.statusVoting}
                  </span>
                </div>
                <p className="text-[#CBD5E1]">{prop.summary}</p>
                <div
                  dir="ltr"
                  className="rounded bg-[#121329] px-2.5 py-1.5 font-latin-math text-[11px] text-[#C084FC] truncate"
                >
                  {prop.artifactSnippet}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#A5B4FC] tabular-nums">
                  <span>
                    {ui.votesForLabel} <strong className="text-white">{prop.votesFor}</strong> /{' '}
                    {ui.quorumLabel} {prop.quorumRequired} ({pct}%)
                  </span>
                  <span>
                    {ui.votesAgainstLabel}{' '}
                    <strong className="text-[#FDA4AF]">{prop.votesAgainst}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={Boolean(myVote)}
                    onClick={() => handleCastVote(prop.id, 'for')}
                    className="rounded border border-[#16A34A]/60 bg-[#16A34A]/15 px-3 py-1.5 font-semibold text-[#4ADE80] hover:bg-[#16A34A]/25 disabled:opacity-50"
                  >
                    {myVote === 'for' ? ui.votedForBtn : ui.voteForBtn}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(myVote)}
                    onClick={() => handleCastVote(prop.id, 'against')}
                    className="rounded border border-[#E11D48]/50 bg-[#2D0A18] px-3 py-1.5 font-semibold text-[#FDA4AF] hover:bg-[#E11D48]/25 disabled:opacity-50"
                  >
                    {myVote === 'against' ? ui.votedAgainstBtn : ui.voteAgainstBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Causal Trajectory Graph & 5-Layer Platform Matrix */}
      <TrajectoryMap
        locale={locale}
        events={events}
        graph={graph}
        probabilities={probabilities}
        mathMetrics={mathMetrics}
        forecasts={forecasts}
        selectedEventId={selectedEventId}
        onSelectEvent={onSelectEventOnMap}
        isStreaming={isStreaming}
        onToggleStream={onToggleStream}
        onStepForward={onStepForward}
        onResetTimeline={onResetTimeline}
        onSimulateAiEvent={onSimulateAiEvent}
        isSimulatingAi={isSimulatingAi}
        hasMoreSeedEvents={hasMoreSeedEvents}
      />

      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <h3 className="text-base font-bold text-white">{ui.platformMatrixHeading}</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          {platformMatrix.map((layer) => (
            <div
              key={layer.id}
              className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3 text-xs"
            >
              <div className="font-semibold text-white">
                {getPlatformCopy(layer.id, locale).shortLabel}
              </div>
              <div className="mt-1 font-latin-math text-lg font-bold text-[#FDA4AF] tabular-nums">
                {layer.pressurePct}%
              </div>
              <div className="mt-1 text-[11px] text-[#A5B4FC]">
                {getThreatCopy(layer.dominantThreat, locale).shortLabel} ·{' '}
                {layer.eventCount} {ui.eventsWord}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
