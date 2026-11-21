'use client';

import React, { useEffect, useState } from 'react';
import {
  Cloud,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  Radio,
  Fingerprint,
} from 'lucide-react';
import {
  AppLocale,
  CloudAgentMode,
  CloudAgentRunResult,
  GlobalSensedSignal,
  RegionViewKey,
} from '@/lib/types';
import { REGION_VIEWBOX_PRESETS } from '@/lib/world-monitor-engine';
import { getRegionLabel } from '@/lib/i18n';

interface CloudAgentViewProps {
  locale: AppLocale;
  activeSignals: GlobalSensedSignal[];
  onSelectEncryptedNodeOnMap: (nodeId: string) => void;
}

const CLOUD_I18N: Record<
  AppLocale,
  {
    title: string;
    subtitle: string;
    selectAgent: string;
    hermesOpt: string;
    solohostOpt: string;
    cipherOpt: string;
    targetRegion: string;
    phraseLabel: string;
    useGemini: string;
    running: string;
    runNow: string;
    stopLoop: string;
    autoLoop: string;
    runErr: string;
    corrTitle: string;
    readyTitle: string;
    readyDesc: string;
    historyTitle: string;
    riskLabel: string;
  }
> = {
  ar: {
    title: 'تشغيل SoloHost و Hermes سحابياً من الهاتف مباشرة (بدون حاسوب)',
    subtitle:
      'لا حاجة لامتلاك حاسوب أو تشغيل Node/Docker محلياً: يتم تنفيذ وكلاء Hermes Autonomous Hunter وعقود SoloHost الدفاعية بالكامل على خادمنا السحابي وربطها بإحداثيات الأحداث العالمية الحية والخرائط المشفرة ومعادلات باي (π)، مع تسوية x402 وتوثيق SHA-256 مباشرة من متصفح هاتفك.',
    selectAgent: 'اختر الوكيل السحابي',
    hermesOpt: 'Hermes Cloud Hunter — صائد الترابطات والشفرات المستمر',
    solohostOpt: 'SoloHost Cloud Defender — حارس الأوراكل (PiRC-203/254)',
    cipherOpt: 'Cipher Map Sentinel — مراقب الخرائط المشفرة و Q-Clock',
    targetRegion: 'النطاق الجغرافي',
    phraseLabel: 'عبارة التحليل والشفرة',
    useGemini: 'توليد خلاصة مخابراتية عبر Gemini 4 في السحابة',
    running: 'جارٍ التنفيذ في السحابة...',
    runNow: 'تشغيل الوكيل السحابي الآن (بدون حاسوب)',
    stopLoop: 'إيقاف نبض 30ث',
    autoLoop: 'تشغيل مستمر (30ث)',
    runErr: 'تعذر تشغيل الوكيل السحابي، حاول مجدداً.',
    corrTitle: 'أقوى الارتباطات الحية × الخرائط المشفرة (اضغط للفتح على الخريطة):',
    readyTitle: 'جاهز للتنفيذ السحابي الفوري بدون حاسوب',
    readyDesc:
      'اضغط على «تشغيل الوكيل السحابي الآن» لتشغيل Hermes أو SoloHost على خوادمنا السحابية مباشرة من هاتفك وربط الإحداثيات الحية بالخرائط المشفرة.',
    historyTitle: 'سجل الجولات السحابية المنفذة',
    riskLabel: 'الخطر',
  },
  en: {
    title: 'Cloud SoloHost & Hermes Runner (Mobile-Ready, Zero PC Required)',
    subtitle:
      'No local PC or terminal required: Hermes Autonomous Hunter and SoloHost Defense Workers execute server-side in the cloud, correlating live global sensors with Encrypted Map coordinates, Gematria/Pi math, SHA-256 attestation, and x402 batch receipts directly from your phone browser.',
    selectAgent: 'Select Cloud Agent',
    hermesOpt: 'Hermes Cloud Hunter — Continuous Correlation Scanner',
    solohostOpt: 'SoloHost Cloud Defender — Oracle & Circuit Breaker Worker',
    cipherOpt: 'Cipher Map Sentinel — Encrypted Maps & Q-Clock Monitor',
    targetRegion: 'Target Region',
    phraseLabel: 'Cipher Focus Phrase',
    useGemini: 'Enrich cloud run with Gemini 4 analysis',
    running: 'Running in Cloud...',
    runNow: 'Run Cloud Agent Now (No PC)',
    stopLoop: 'Stop 30s Loop',
    autoLoop: 'Auto-Run (30s)',
    runErr: 'Cloud agent execution failed.',
    corrTitle: 'Top Live Signals × Encrypted Map Nodes (Click to inspect on map):',
    readyTitle: 'Ready for Instant Cloud Execution (Zero PC)',
    readyDesc:
      'Click Run Cloud Agent Now to run Hermes or SoloHost on our cloud backend directly from mobile.',
    historyTitle: 'Executed Cloud Agent Runs',
    riskLabel: 'Risk',
  },
  fr: {
    title: 'Exécuteur Cloud SoloHost & Hermes (Mobile-Ready, Zéro PC Requis)',
    subtitle:
      'Aucun PC requis : Hermes Autonomous Hunter et SoloHost s’exécutent côté serveur, corrélant capteurs mondiaux, nœuds chiffrés, maths π, preuve SHA-256 et reçus x402 directement depuis votre navigateur mobile.',
    selectAgent: 'Sélectionner l’Agent Cloud',
    hermesOpt: 'Hermes Cloud Hunter — Scanner de Corrélations Continu',
    solohostOpt: 'SoloHost Cloud Defender — Garde Oracle & Coupe-Circuit',
    cipherOpt: 'Cipher Map Sentinel — Moniteur Cartes Chiffrées & Q-Clock',
    targetRegion: 'Zone Géographique',
    phraseLabel: 'Phrase Clé & Décodage',
    useGemini: 'Enrichir le scan avec Gemini 4 dans le Cloud',
    running: 'Exécution Cloud...',
    runNow: 'Lancer l’Agent Cloud (Sans PC)',
    stopLoop: 'Arrêter la boucle 30s',
    autoLoop: 'Boucle Auto (30s)',
    runErr: 'Échec de l’exécution de l’agent cloud.',
    corrTitle: 'Meilleures Corrélations Temps Réel × Cartes Chiffrées (Cliquer) :',
    readyTitle: 'Prêt pour Exécution Cloud Instantanée (Zéro PC)',
    readyDesc:
      'Cliquez sur Lancer l’Agent Cloud pour exécuter Hermes ou SoloHost côté serveur depuis votre mobile.',
    historyTitle: 'Historique des Exécutions Cloud',
    riskLabel: 'Risque',
  },
  id: {
    title: 'Eksekutor Cloud SoloHost & Hermes (Siap Seluler, Tanpa PC)',
    subtitle:
      'Tidak perlu PC lokal: Hermes Autonomous Hunter dan SoloHost berjalan penuh di server cloud, mengorelasikan sensor global langsung, simpul sandi, matematika π, hash SHA-256, dan x402 langsung dari ponsel Anda.',
    selectAgent: 'Pilih Agen Cloud',
    hermesOpt: 'Hermes Cloud Hunter — Pemindai Korelasi Berkelanjutan',
    solohostOpt: 'SoloHost Cloud Defender — Penjaga Oracle (PiRC-203/254)',
    cipherOpt: 'Cipher Map Sentinel — Pemantau Peta Sandi & Q-Clock',
    targetRegion: 'Wilayah Target',
    phraseLabel: 'Frasa Fokus Sandi',
    useGemini: 'Perkaya hasil cloud dengan analisis Gemini 4',
    running: 'Menjalankan di Cloud...',
    runNow: 'Jalankan Agen Cloud Sekarang (Tanpa PC)',
    stopLoop: 'Hentikan Loop 30d',
    autoLoop: 'Otomatis (30d)',
    runErr: 'Gagal menjalankan agen cloud.',
    corrTitle: 'Korelasi Langsung Terkuat × Simpul Peta Sandi (Klik untuk lihat):',
    readyTitle: 'Siap Eksekusi Cloud Seketika (Tanpa PC)',
    readyDesc:
      'Klik Jalankan Agen Cloud Sekarang untuk mengoperasikan Hermes atau SoloHost di server langsung dari ponsel.',
    historyTitle: 'Riwayat Eksekusi Agen Cloud',
    riskLabel: 'Risiko',
  },
  vi: {
    title: 'Trình Chạy Cloud SoloHost & Hermes (Trên Di Động, Không Cần PC)',
    subtitle:
      'Không cần máy tính cá nhân: Hermes Autonomous Hunter và SoloHost chạy hoàn toàn trên máy chủ đám mây, liên kết cảm biến toàn cầu, nút bản đồ mã hóa, toán học π, SHA-256 và x402 ngay trên điện thoại.',
    selectAgent: 'Chọn Tác Nhân Đám Mây',
    hermesOpt: 'Hermes Cloud Hunter — Quét Tương Quan Liên Tục',
    solohostOpt: 'SoloHost Cloud Defender — Bảo Vệ Oracle (PiRC-203/254)',
    cipherOpt: 'Cipher Map Sentinel — Giám Sát Bản Đồ Mã Hóa & Q-Clock',
    targetRegion: 'Khu Vực Mục Tiêu',
    phraseLabel: 'Cụm Từ Trọng Tâm',
    useGemini: 'Bổ sung phân tích chuyên sâu Gemini 4',
    running: 'Đang chạy trên Cloud...',
    runNow: 'Chạy Tác Nhân Cloud Ngay (Không Cần PC)',
    stopLoop: 'Dừng Vòng Lặp 30s',
    autoLoop: 'Chạy Tự Động (30s)',
    runErr: 'Không thể khởi chạy tác nhân đám mây.',
    corrTitle: 'Liên Kết Trực Tiếp Mạnh Nhất × Bản Đồ Mã Hóa (Nhấn để xem):',
    readyTitle: 'Sẵn Sàng Chạy Cloud Tức Thì (Không Cần PC)',
    readyDesc:
      'Nhấn Chạy Tác Nhân Cloud Ngay để thực thi Hermes hoặc SoloHost trên máy chủ từ trình duyệt di động.',
    historyTitle: 'Lịch Sử Các Lượt Chạy Đám Mây',
    riskLabel: 'Rủi ro',
  },
};

export default function CloudAgentView({
  locale,
  activeSignals,
  onSelectEncryptedNodeOnMap,
}: CloudAgentViewProps) {
  const t = CLOUD_I18N[locale];
  const [agentMode, setAgentMode] = useState<CloudAgentMode>('hermes_hunter');
  const [region, setRegion] = useState<RegionViewKey>('global');
  const [focusPhrase, setFocusPhrase] = useState('PI NETWORK SWIFT');
  const [useGeminiDeep, setUseGeminiDeep] = useState(false);
  const [autoHeartbeat, setAutoHeartbeat] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<CloudAgentRunResult[]>([]);

  const executeCloudRun = async (useAiOverride?: boolean) => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cloud-agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          agentMode,
          region,
          focusPhrase,
          useGeminiDeep: useAiOverride ?? useGeminiDeep,
          activeSignals,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setErrorMsg(payload.error || t.runErr);
        return;
      }
      if (payload.result) {
        setHistory((prev) => [payload.result as CloudAgentRunResult, ...prev].slice(0, 8));
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : t.runErr
      );
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!autoHeartbeat) return;
    const id = setInterval(() => {
      void executeCloudRun(false);
    }, 30000);
    return () => clearInterval(id);
    // Intentionally tied to autoHeartbeat & selected strategy
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoHeartbeat, agentMode, region, focusPhrase, locale]);

  const latest = history[0] ?? null;

  const getBriefForRun = (run: CloudAgentRunResult) =>
    locale === 'ar'
      ? run.missionBriefAr
      : run.missionBriefLocalized || run.missionBriefEn;

  return (
    <div className="space-y-6">
      {/* Header Banner Explaining No-PC Cloud Execution */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2856] pb-3.5">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-[#C084FC]" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">{t.title}</h3>
          </div>
          <span className="font-latin-math text-xs text-[#4ADE80]">
            POST /api/cloud-agent/run · Cloud Sandbox Active
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[#CBD5E1]">{t.subtitle}</p>

        {/* Controls Grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-3 text-xs">
            <div>
              <label htmlFor="cloud-agent-mode" className="block font-semibold text-white">
                {t.selectAgent}
              </label>
              <select
                id="cloud-agent-mode"
                value={agentMode}
                onChange={(e) => setAgentMode(e.target.value as CloudAgentMode)}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
              >
                <option value="hermes_hunter">{t.hermesOpt}</option>
                <option value="solohost_defender">{t.solohostOpt}</option>
                <option value="cipher_sentinel">{t.cipherOpt}</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label htmlFor="cloud-region" className="block font-semibold text-white">
                  {t.targetRegion}
                </label>
                <select
                  id="cloud-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value as RegionViewKey)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs text-white"
                >
                  {(Object.keys(REGION_VIEWBOX_PRESETS) as RegionViewKey[]).map((key) => (
                    <option key={key} value={key}>
                      {getRegionLabel(key, locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cloud-phrase" className="block font-semibold text-white">
                  {t.phraseLabel}
                </label>
                <input
                  id="cloud-phrase"
                  type="text"
                  dir="ltr"
                  value={focusPhrase}
                  onChange={(e) => setFocusPhrase(e.target.value)}
                  className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 font-latin-math text-xs text-white"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded border border-[#312E81] bg-[#0C0D16] p-2.5">
              <input
                type="checkbox"
                checked={useGeminiDeep}
                onChange={(e) => setUseGeminiDeep(e.target.checked)}
                className="h-4 w-4 accent-[#9333EA]"
              />
              <Sparkles className="h-4 w-4 text-[#C084FC]" aria-hidden="true" />
              <span className="font-medium text-white">{t.useGemini}</span>
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isRunning}
                onClick={() => void executeCloudRun()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-[#7C3AED] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50"
              >
                <Radio className="h-4 w-4" aria-hidden="true" />
                <span>{isRunning ? t.running : t.runNow}</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoHeartbeat((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                  autoHeartbeat
                    ? 'border-[#16A34A] bg-[#16A34A]/20 text-[#4ADE80]'
                    : 'border-[#312E81] bg-[#0C0D16] text-[#CBD5E1] hover:border-[#7C3AED]'
                }`}
              >
                {autoHeartbeat ? (
                  <>
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.stopLoop}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.autoLoop}</span>
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="rounded border border-[#DC2626] bg-[#2D0A18] p-2.5 text-xs text-[#FDA4AF]"
              >
                {errorMsg}
              </div>
            )}
          </div>

          {/* Live Output Panel */}
          <div className="lg:col-span-7 rounded-md border border-[#2B2856] bg-[#0C0D16] p-4 space-y-3 text-xs">
            {latest ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E1B4B] pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#4ADE80]" aria-hidden="true" />
                    <span className="font-bold text-white">
                      {latest.runId} · {latest.agentMode}
                    </span>
                  </div>
                  <span className="font-latin-math text-[11px] text-[#C084FC] tabular-nums">
                    {latest.startedAtUtc.slice(11, 19)} UTC · {t.riskLabel} {latest.compositeRiskPct}%
                  </span>
                </div>

                <p className="leading-relaxed text-[#F3F4F6]">
                  {getBriefForRun(latest)}
                </p>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 border-y border-[#1E1B4B] py-2.5 text-[11px] tabular-nums">
                  <div>
                    <div className="text-[#A5B4FC]">Ordinal</div>
                    <div className="font-latin-math font-bold text-white">
                      {latest.gematriaSignature.ordinal}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A5B4FC]">Reduction</div>
                    <div className="font-latin-math font-bold text-[#C084FC]">
                      {latest.gematriaSignature.fullReduction}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A5B4FC]">Q-Clock</div>
                    <div className="font-latin-math font-bold text-white">
                      #{latest.qClockSector}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A5B4FC]">x402 Micro-Fee</div>
                    <div className="font-latin-math font-bold text-[#4ADE80]">
                      {latest.x402Settlement.microFeePi} Pi
                    </div>
                  </div>
                </div>

                {latest.nearestCorrelations.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="font-semibold text-[#C084FC]">{t.corrTitle}</div>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {latest.nearestCorrelations.map((c) => (
                        <button
                          key={`${c.signalId}-${c.encryptedNodeId}`}
                          type="button"
                          onClick={() => onSelectEncryptedNodeOnMap(c.encryptedNodeId)}
                          className="rounded border border-[#1E1B4B] bg-[#101124] p-2 text-start hover:border-[#9333EA] transition-colors"
                        >
                          <div className="truncate font-semibold text-white">
                            {c.encryptedTitle}
                          </div>
                          <div className="mt-0.5 truncate text-[10px] text-[#FDE68A]">
                            {c.signalTitle}
                          </div>
                          <div className="mt-0.5 flex items-center justify-between text-[10px] text-[#A5B4FC] tabular-nums">
                            <span>{c.distanceKm} km</span>
                            <span className="font-latin-math text-[#FDA4AF]">
                              π={c.piCouplingScore} {c.qClockAligned ? '· Q-Synced' : ''}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <ul className="space-y-1 text-[11px] text-[#CBD5E1]">
                  {latest.recommendedActions.map((act, i) => (
                    <li key={i}>• {act}</li>
                  ))}
                </ul>

                <div
                  dir="ltr"
                  className="flex items-center gap-2 rounded bg-[#07070B] px-2.5 py-1.5 font-latin-math text-[10px] text-[#4ADE80] break-all"
                >
                  <Fingerprint className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    SHA-256: {latest.sha256Proof.slice(0, 32)}… · x402 TX: {latest.x402Settlement.txHash}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[210px] flex-col items-center justify-center text-center text-[#A5B4FC] space-y-2">
                <Cloud className="h-8 w-8 text-[#7C3AED]" aria-hidden="true" />
                <div className="font-semibold text-white">{t.readyTitle}</div>
                <p className="max-w-md text-[11px] text-[#CBD5E1]">{t.readyDesc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Run History Log */}
      {history.length > 1 && (
        <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5 text-xs">
          <h4 className="font-bold text-white mb-3">
            {t.historyTitle} ({history.length})
          </h4>
          <div className="space-y-2">
            {history.map((run) => (
              <div
                key={run.runId}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#1E1B4B] bg-[#0C0D16] px-3 py-2 tabular-nums"
              >
                <span className="font-latin-math font-semibold text-white">
                  {run.runId} · {run.agentMode}
                </span>
                <span className="text-[#CBD5E1]">{getBriefForRun(run).slice(0, 72)}…</span>
                <span className="font-latin-math text-[#C084FC]">
                  {t.riskLabel} {run.compositeRiskPct}% · Q#{run.qClockSector}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
