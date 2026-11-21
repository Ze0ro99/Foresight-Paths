import { createHash } from 'node:crypto';
import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { computeGematria } from '@/lib/decoder-engine';
import {
  ENCRYPTED_MAP_NODES,
  computeQClockWorldSweep,
  correlateEncryptedAndGlobalSignals,
} from '@/lib/world-monitor-engine';
import { getEncryptedNodeCopy } from '@/lib/i18n';
import {
  AppLocale,
  CloudAgentMode,
  CloudAgentRunResult,
  GlobalSensedSignal,
  RegionViewKey,
} from '@/lib/types';

const LOCALE_LANGUAGE_NAME: Record<AppLocale, string> = {
  ar: 'Arabic',
  en: 'English',
  fr: 'French',
  id: 'Indonesian (Bahasa Indonesia)',
  vi: 'Vietnamese (Tiếng Việt)',
};

function parseLocale(val: unknown): AppLocale {
  return val === 'en' || val === 'fr' || val === 'id' || val === 'vi' ? val : 'ar';
}

export async function POST(req: NextRequest) {
  let body: {
    agentMode?: CloudAgentMode;
    region?: RegionViewKey;
    focusPhrase?: string;
    useGeminiDeep?: boolean;
    activeSignals?: GlobalSensedSignal[];
    locale?: AppLocale;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid cloud agent request payload.' },
      { status: 400 }
    );
  }

  // Fail closed: this endpoint currently accepts client-supplied telemetry and emits
  // synthetic settlement metadata. Keep it unavailable until server-side source
  // validation, calibrated scoring, and real payment verification are implemented.
  return NextResponse.json(
    {
      status: 'not_ready',
      error:
        'Cloud agent execution is disabled until telemetry is validated server-side and payment settlement is verified. No agent run or payment occurred.',
    },
    { status: 503 }
  );

  const locale = parseLocale(body.locale);

  const agentMode: CloudAgentMode =
    body.agentMode === 'solohost_defender'
      ? 'solohost_defender'
      : body.agentMode === 'cipher_sentinel'
        ? 'cipher_sentinel'
        : 'hermes_hunter';

  const region: RegionViewKey =
    body.region === 'mena'
      ? 'mena'
      : body.region === 'europe'
        ? 'europe'
        : body.region === 'americas'
          ? 'americas'
          : body.region === 'asia'
            ? 'asia'
            : 'global';

  const focusPhrase = (body.focusPhrase || 'PI NETWORK SWIFT').trim().slice(0, 80);
  const useGeminiDeep = Boolean(body.useGeminiDeep);
  const signals: GlobalSensedSignal[] = body.activeSignals ?? [];

  const now = new Date();
  const minuteTick = now.getUTCMinutes();
  const sweep = computeQClockWorldSweep(minuteTick);
  const gem = computeGematria(focusPhrase);
  const correlations = correlateEncryptedAndGlobalSignals(
    signals,
    sweep.sector,
    locale
  ).slice(0, 4);

  const topCoupling = correlations[0]?.piCouplingScore ?? 4.2;
  const avgSeverity =
    signals.length > 0
      ? signals.reduce((s, x) => s + x.magnitudeOrSeverity, 0) / signals.length
      : 5.5;

  const compositeRiskPct = Math.min(
    98,
    Math.max(18, Math.round(avgSeverity * 6.8 + topCoupling * 2.1))
  );

  const topEncryptedTitle =
    correlations[0]?.encryptedTitle ??
    getEncryptedNodeCopy(ENCRYPTED_MAP_NODES[0], locale).title;

  let missionBriefAr =
    agentMode === 'hermes_hunter'
      ? `تم تنفيذ جولة Hermes السحابية (بدون حاسوب) لإقليم (${region}) عند قطاع Q-Clock #${sweep.sector}: رُصد ${signals.length} إشارات عالمية مع أقوى تقاطع عبر π بقيمة ${topCoupling} نحو عقدة «${topEncryptedTitle}».`
      : agentMode === 'solohost_defender'
      ? `نفّذ عامل SoloHost السحابي المعزول قواعد PiRC-203/254 الدفاعية بدون حاسوب محلي: الجيماتريا (${gem.englishOrdinal}/${gem.fullReduction}) ومستوى الخطر المركب ${compositeRiskPct}% ضمن نطاق التشغيل الآمن.`
      : `مراقب الخرائط المشفرة Cloud Sentinel ربط عبارة «${focusPhrase}» (قيمة ${gem.englishOrdinal}) بالمسح الدوري لخط الطول ${sweep.activeLng}° وإحداثيات غلاف الإيكونوميست والصحوة الكبرى.`;

  let missionBriefEn = `Cloud ${agentMode} sweep executed server-side (zero local PC required) across ${region} at Q-Clock sector #${sweep.sector} (${sweep.activeLng}°): analyzed ${signals.length} live global signals with peak Pi coupling ${topCoupling} toward "${topEncryptedTitle}". Composite risk: ${compositeRiskPct}%.`;

  const localizedFallbacks: Record<AppLocale, string> = {
    ar: missionBriefAr,
    en: missionBriefEn,
    fr: `Balayage cloud ${agentMode} exécuté côté serveur (zéro PC requis) sur la zone ${region} au secteur Q-Clock #${sweep.sector} (${sweep.activeLng}°) : ${signals.length} signaux mondiaux analysés avec couplage π maximal de ${topCoupling} vers « ${topEncryptedTitle} » (risque ${compositeRiskPct}%).`,
    id: `Pemindaian cloud ${agentMode} dijalankan di server (tanpa PC lokal) untuk wilayah ${region} pada sektor Q-Clock #${sweep.sector} (${sweep.activeLng}°): ${signals.length} sinyal global dianalisis dengan kopling π puncak ${topCoupling} ke «${topEncryptedTitle}» (risiko ${compositeRiskPct}%).`,
    vi: `Quét đám mây ${agentMode} chạy phía máy chủ (không cần PC) tại khu vực ${region}, cung Q-Clock #${sweep.sector} (${sweep.activeLng}°): đã phân tích ${signals.length} tín hiệu toàn cầu với độ ghép π đỉnh ${topCoupling} tới «${topEncryptedTitle}» (rủi ro ${compositeRiskPct}%).`,
  };

  let missionBriefLocalized = localizedFallbacks[locale];

  const localizedActionsMap: Record<AppLocale, string[]> = {
    ar: [
      `عزل الإحداثيات ذات تصنيف (رمزي / تنبيه) عن قرارات السيولة المالية دون تحقق OSINT من الدرجة A1/B2.`,
      `مراقبة الفارق السعري لأوراكل PiRC-203 وإبقاء قاطع الدائرة PiRC-254 مفعّلاً عند عتبة 4.5%.`,
      `تأمين استعلامات x402 / MCP بتوقيعات Batch-Settlement (0.0001 Pi) عبر الهاتف المحمول مباشرة.`,
    ],
    en: [
      `Isolate coordinates tagged symbolic/rumor from treasury liquidity actions until A1/B2 OSINT verification completes.`,
      `Monitor PiRC-203 oracle spread and keep the PiRC-254 circuit breaker armed at the 4.5% divergence threshold.`,
      `Authorize x402 / MCP telemetry sweeps via mobile batch-settlement signatures (0.0001 Pi/month equivalent).`,
    ],
    fr: [
      `Isoler les coordonnées symboliques ou non vérifiées des décisions de trésorerie jusqu'à confirmation OSINT A1/B2.`,
      `Surveiller l'écart oracle PiRC-203 et maintenir le coupe-circuit PiRC-254 armé au seuil de 4,5 %.`,
      `Signer les requêtes x402 / MCP depuis mobile via le règlement groupé batch-settlement (0,0001 Pi).`,
    ],
    id: [
      `Pisahkan koordinat bertanda simbolik dari keputusan likuiditas hingga verifikasi OSINT kelas A1/B2 selesai.`,
      `Pantau selisih harga oracle PiRC-203 dan pertahankan pemutus sirkuit PiRC-254 aktif di ambang 4,5%.`,
      `Otorisasi kueri x402 / MCP langsung dari ponsel menggunakan batch-settlement (0,0001 Pi).`,
    ],
    vi: [
      `Tách biệt các tọa độ mang tính biểu tượng khỏi quyết định thanh khoản cho đến khi xác minh OSINT A1/B2 hoàn tất.`,
      `Theo dõi độ lệch oracle PiRC-203 và duy trì cầu dao PiRC-254 ở ngưỡng cảnh báo 4,5%.`,
      `Xác thực truy vấn x402 / MCP trực tiếp trên di động qua ký gộp batch-settlement (0,0001 Pi).`,
    ],
  };

  let recommendedActions = localizedActionsMap[locale];

  let usedGemini = false;

  if (useGeminiDeep) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return NextResponse.json(
        {
          error:
            locale === 'ar'
              ? 'مفتاح GEMINI_API_KEY غير مهيأ على الخادم لتشغيل التحليل المعمق عبر Gemini.'
              : 'GEMINI_API_KEY is not configured on the server for deep Gemini cloud analysis.',
        },
        { status: 500 }
      );
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const targetLang = LOCALE_LANGUAGE_NAME[locale];
      const prompt = `As a server-side ${agentMode} cloud agent running for a mobile-only user with no PC:
Live telemetry:
- Region: ${region}
- Gematria focus phrase: "${focusPhrase}" (Ordinal=${gem.englishOrdinal}, FullReduction=${gem.fullReduction}, Sumerian=${gem.englishSumerian})
- Active Q-Clock Sector: #${sweep.sector} (Lng ${sweep.activeLng}° / Opposite ${sweep.oppositeLng}°)
- Top Live Global × Encrypted Correlations: ${JSON.stringify(correlations)}
- Composite Risk Score: ${compositeRiskPct}%

Produce realistic intelligence/infrastructure analysis in Arabic (missionBriefAr), English (missionBriefEn), and specifically write missionBriefLocalized AND all 3 recommendedActions strictly in ${targetLang}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              missionBriefAr: { type: Type.STRING },
              missionBriefEn: { type: Type.STRING },
              missionBriefLocalized: { type: Type.STRING },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'missionBriefAr',
              'missionBriefEn',
              'missionBriefLocalized',
              'recommendedActions',
            ],
          },
        },
      });

      const responseText = response.text;
      if (typeof responseText === 'string' && responseText.length > 0) {
        const parsed = JSON.parse(responseText) as {
          missionBriefAr?: string;
          missionBriefEn?: string;
          missionBriefLocalized?: string;
          recommendedActions?: string[];
        };
        if (parsed.missionBriefAr) missionBriefAr = parsed.missionBriefAr;
        if (parsed.missionBriefEn) missionBriefEn = parsed.missionBriefEn;
        if (parsed.missionBriefLocalized) {
          missionBriefLocalized = parsed.missionBriefLocalized;
        }
        if (Array.isArray(parsed.recommendedActions) && parsed.recommendedActions.length > 0) {
          recommendedActions = parsed.recommendedActions.slice(0, 4);
        }
        usedGemini = true;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upstream error';
      return NextResponse.json(
        { error: `Cloud Gemini agent execution failed: ${msg}` },
        { status: 502 }
      );
    }
  }

  const runId = `cloud-${agentMode.slice(0, 4)}-${now.getTime().toString(36)}`;
  const digestInput = JSON.stringify({
    runId,
    agentMode,
    region,
    locale,
    focusPhrase,
    sector: sweep.sector,
    compositeRiskPct,
    signalCount: signals.length,
  });

  const sha256Proof = createHash('sha256').update(digestInput).digest('hex');
  const txHash =
    '0x' +
    createHash('sha256')
      .update(`${runId}:${sha256Proof}`)
      .digest('hex')
      .slice(0, 28);

  const result: CloudAgentRunResult = {
    runId,
    agentMode,
    executedIn: 'cloud_serverless_no_pc',
    startedAtUtc: now.toISOString(),
    region,
    compositeRiskPct,
    gematriaSignature: {
      phrase: focusPhrase,
      ordinal: gem.englishOrdinal,
      fullReduction: gem.fullReduction,
      sumerian: gem.englishSumerian,
    },
    qClockSector: sweep.sector,
    nearestCorrelations: correlations,
    missionBriefAr,
    missionBriefEn,
    missionBriefLocalized,
    recommendedActions,
    sha256Proof,
    x402Settlement: {
      scheme: 'batch-settlement',
      microFeePi: '0.0001',
      txHash,
    },
    usedGemini,
  };

  return NextResponse.json({ result });
}
