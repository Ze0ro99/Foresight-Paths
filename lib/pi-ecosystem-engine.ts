import {
  AppLocale,
  GeneratedSolutionBundle,
  GovernanceProposal,
  LiveEvent,
  RiskScenarioInput,
} from './types';
import { FEE_STRATEGIES_I18N, THREAT_PRESETS_I18N } from './i18n-data';

export const PI_MAINNET_BASE_FEE = 0.01;
export const MICRO_SUBSCRIPTION_PI = 0.0001;

export interface FeeEconomicsStrategy {
  id: string;
  nameAr: string;
  nameEn: string;
  effectiveGasRatioPct: number;
  gasMultiplierLabel: string;
  readinessStatusAr: string;
  mechanismAr: string;
}

export function computeFeeEconomicsStrategies(
  locale: AppLocale = 'ar'
): FeeEconomicsStrategy[] {
  const directGasMultiplier = Math.round(
    PI_MAINNET_BASE_FEE / MICRO_SUBSCRIPTION_PI
  ); // 100x
  const base: FeeEconomicsStrategy[] = [
    {
      id: 'direct-onchain',
      nameAr: 'معاملة مباشرة شهرياً (غير مجدية اقتصادياً)',
      nameEn: 'Direct Monthly On-Chain Tx',
      effectiveGasRatioPct: 99,
      gasMultiplierLabel: `${directGasMultiplier}× رسوم (${PI_MAINNET_BASE_FEE} Pi مقابل ${MICRO_SUBSCRIPTION_PI} Pi)`,
      readinessStatusAr: 'مرفوضة هندسياً (99% استهلاك غاز)',
      mechanismAr:
        'تحصيل 0.0001 Pi بمعاملة شهرية منفردة يفرض رسم 0.01 Pi أي 100 ضعف الاشتراك.',
    },
    {
      id: 'x402-batch',
      nameAr: '1. التسوية المجمعة عبر قسائم x402',
      nameEn: 'x402 Off-Chain Batch Settlement',
      effectiveGasRatioPct: 5,
      gasMultiplierLabel: '1% – 10% عند التسوية عند عتبة 0.1–1 Pi',
      readinessStatusAr: 'جاهز على Testnet / تكييف Soroban',
      mechanismAr:
        'توقيع قسائم دفع خارج السلسلة بقيمة 0.0001 Pi/طلب ثم تسويتها مجمعة في معاملة واحدة.',
    },
    {
      id: 'pirc2-allowance',
      nameAr: '2. عقد الاشتراكات الذكي PiRC2 (سماحية ممتدة)',
      nameEn: 'PiRC2 Soroban Allowance Contract',
      effectiveGasRatioPct: 2,
      gasMultiplierLabel: 'غاز مقصور على التفويض ودورة السحب',
      readinessStatusAr: 'مواصفات Testnet منشورة (قيد التدقيق)',
      mechanismAr:
        'تفويض سماحية transfer_from في Soroban بأفق expiration ledger دون حجز الرصيد مقدماً.',
    },
    {
      id: 'prepaid-bundle',
      nameAr: '3. الدفع المجمع المسبق عبر Pi.createPayment',
      nameEn: 'Prepaid Pi SDK v2.0 Credit Bundle',
      effectiveGasRatioPct: 10,
      gasMultiplierLabel: '10% عند 0.1 Pi أو 1% عند 1 Pi',
      readinessStatusAr: 'جاهز للإنتاج الفوري على Mainnet',
      mechanismAr:
        'شحن رصيد استهلاك 0.1 Pi عبر تدفق U2A الثلاثي يغطي مئات الدورات الشهرية الدقيقة.',
    },
    {
      id: 'pi-ads-subsidy',
      nameAr: '4. التغطية الإعلانية الاختيارية (Pi.Ads)',
      nameEn: 'Rewarded Ads Verified Credit',
      effectiveGasRatioPct: 0,
      gasMultiplierLabel: '0% غاز عند تحقق mediator_ack_status',
      readinessStatusAr: 'مدعوم رسمياً في Pi Developer Ad Network',
      mechanismAr:
        'تغطية التجديد الشهري 0.0001 Pi بمشاهدة إعلان مكافأة يتحقق منه الخادم عبر Pi API.',
    },
  ];
  if (locale === 'ar') return base;
  const tr = FEE_STRATEGIES_I18N[locale];
  return base.map((item) => {
    const entry = tr?.[item.id];
    if (!entry) return item;
    return {
      ...item,
      nameAr: entry.name,
      gasMultiplierLabel: entry.gasLabel,
      readinessStatusAr: entry.status,
      mechanismAr: entry.mechanism,
    };
  });
}

export const PIRC_STANDARDS_SEPARATION = [
  {
    id: 'pirc2',
    name: 'PiRC2: Subscription Contract API',
    classification: 'official' as const,
    sourceRepo: 'PiNetwork/PiRC (رسمي)',
    statusAr: 'منشور على Testnet وقيد التدقيق الأمني للنشر على Mainnet',
    roleInAppAr:
      'المحرك المرجعي لعقود الاشتراكات المتميزة، وإدارة سماحية transfer_from وexpiration_ledger دون قفل الأموال.',
  },
  {
    id: 'pirc1',
    name: 'PiRC1: Ecosystem Token Design',
    classification: 'official' as const,
    sourceRepo: 'PiNetwork/PiRC (رسمي)',
    statusAr: 'إنفاذ مقاييس المنفعة الحقيقية وتكامل Launchpad / DEX',
    roleInAppAr:
      'قياس النشاط الموثق للمستخدمين (توثيق الإحداثيات، البث، تقارير المخاطر) لتأهيل التطبيق للسيولة الدائمة.',
  },
  {
    id: 'seven-layer',
    name: '7-Layer Pinework Architecture',
    classification: 'community' as const,
    sourceRepo: 'Ze0ro99/PiRC (مقترح مجتمعي)',
    statusAr: 'طبقة تنظيمية اختيارية وليست معياراً ملزماً من Pi Core Team',
    roleInAppAr:
      'فصل الكود والوثائق إلى 7 طبقات: البنية التحتية، البروتوكول، العقود، الخدمة، التشغيل البيني، التطبيق، والحوكمة.',
  },
  {
    id: 'ze0ro-proposals',
    name: 'PiRC-202 / 203 / 206 / 208 / 254',
    classification: 'community' as const,
    sourceRepo: 'Ze0ro99/PiRC (مقترحات مجتمعية)',
    statusAr: 'مفاهيم إلهامية مفصولة برمجياً عن مواصفات PiRC الرسمية',
    roleInAppAr:
      'تدرج الصلاحيات (202)، أوراكل التسعير (203)، مراقبة الصحة التشغيلية (206)، تدقيق AI (208)، وقواطع الدائرة (254).',
  },
  {
    id: 'economic-contract',
    name: 'ECONOMIC_ENGINE_API_CONTRACT',
    classification: 'community' as const,
    sourceRepo: 'Ze0ro99/project-unity-sphere',
    statusAr: 'ضوابط أمان تنفيذية للخادم',
    roleInAppAr:
      'رفض الأسعار أو الأهلية الواردة من المتصفح، منع مفاتيح التوقيع بالواجهة، وفرض Idempotency والتحقق البعدي.',
  },
];

export const THREAT_PRESETS: Record<
  RiskScenarioInput['threatCategory'],
  {
    labelAr: string;
    defaultTitleAr: string;
    mitigationsAr: string[];
  }
> = {
  supply_choke: {
    labelAr: 'اختناق سلاسل الإمداد والممرات البحرية',
    defaultTitleAr: 'اضطراب تخليص الموانئ وتعطل مسارات الطاقة الرقمية',
    mitigationsAr: [
      'تفعيل بوابات توجيه متعددة السحب وعزل أنظمة SCADA غير الأساسية تلقائياً.',
      'نشر عقد ضمان Soroban/PiRC2 لتجميد العقود الآجلة تلقائياً عند تجاوز التأخير 40%.',
      'تشغيل وكيل رصد SoloHost محلي على العقد لمراقبة تغيرات BGP والموانئ.',
    ],
  },
  web_exploit: {
    labelAr: 'استغلال ثغرات الويب الحرجة (PHP2Shell / CVE)',
    defaultTitleAr: 'موجة استغلال مؤتمتة لثغرات الخوادم ضمن توجيه BOD 22-01',
    mitigationsAr: [
      'تفعيل قاطع الدائرة PiRC-254 لحظر استدعاءات MCP غير الموقعة فور رصد شذوذ الحزم.',
      'عزل مفاتيح توقيع Pi Wallet خلف خادم التحقق مع فرض Idempotency Keys.',
      'ترقيع الخوادم الحرجة خلال 24 ساعة وتوثيق بصمة السجلات بـ SHA-256.',
    ],
  },
  ai_ransomware: {
    labelAr: 'هجمات الفدية المسرّعة بالذكاء الاصطناعي (SafePay)',
    defaultTitleAr: 'توسع هجمات التشفير المؤتمتة ضد مؤسسات البنية التحتية',
    mitigationsAr: [
      'تشغيل نسخ احتياطية معزولة (Immutable Air-Gap) مرتبطة بإنذارات تحالف CISA.',
      'فصل مستودع الوكلاء داخل بيئة SoloHost المعزولة مع حدود صلاحية PiRC-202.',
      'إلزام المصادقة الثنائية الموثقة بـ Pi KYC لجميع إجراءات الاسترداد الحرجة.',
    ],
  },
  payment_liquidity: {
    labelAr: 'اختلال سيولة المدفوعات وتباعد الأوراكل (PI/USD)',
    defaultTitleAr: 'اتساع الفارق السعري وتعطل تسويات الدفع الدقيقة (x402)',
    mitigationsAr: [
      'تفعيل وضع الفشل الآمن في أوراكل PiRC-203 عند تجاوز الفارق السعري 4.5%.',
      'ترحيل المدفوعات الدقيقة 0.0001 Pi إلى قسائم التجميع x402 batch-settlement.',
      'تحديد سقف ميزانية أقصى في سماحية Soroban transfer_from لحماية المشتركين.',
    ],
  },
};

/**
 * Computes composite risk %, PiRC-203 oracle hedge price in Pi, precautionary steps,
 * and exports genuine MCP Server, SoloHost Manifest, Soroban/PiRC2 Rust contract, and x402 Spec.
 */
export function analyzeThreatAndGenerateBundle(
  input: RiskScenarioInput,
  locale: AppLocale = 'ar'
): GeneratedSolutionBundle {
  const safeSeverity = Math.max(1, Math.min(10, input.severity));
  const safeProb = Math.max(1, Math.min(100, input.probabilityPct));
  const safeDep = Math.max(1, Math.min(10, input.dependencyFactor));
  const safeUsd = Math.max(10, input.estimatedUsdCost);
  const safePiPrice = Math.max(0.01, input.piUsdMedianPrice);

  // Weighted composite risk equation normalized to 1..99%
  const rawScore =
    safeProb * 0.48 + (safeSeverity * 10) * 0.34 + (safeDep * 10) * 0.18;
  const riskScorePct = Math.min(99, Math.max(5, Math.round(rawScore)));
  const riskLevel: GeneratedSolutionBundle['riskLevel'] =
    riskScorePct >= 72 ? 'critical' : riskScorePct >= 45 ? 'high' : 'moderate';

  const oracleStatus: GeneratedSolutionBundle['oracleStatus'] =
    input.oracleSpreadPct > 4.5 ? 'spread_warning' : 'healthy';

  // Cost hedged in Pi using PiRC-203 median Pi/USD oracle + risk contingency factor
  const contingencyFactor = 1 + riskScorePct / 250;
  const estimatedPiCost = Number(
    ((safeUsd * contingencyFactor) / safePiPrice).toFixed(2)
  );

  const presetMitigations =
    THREAT_PRESETS_I18N[locale]?.[input.threatCategory]?.mitigations ??
    THREAT_PRESETS[input.threatCategory].mitigationsAr;
  const slug =
    input.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || `${input.threatCategory}_guard`;

  const mcpAgentCode = `// MCP Server + x402 V2 Paid Tool (Generated for ${input.title})
import { createX402McpServer, withX402Client } from "@x402/mcp-pi";

export const server = createX402McpServer({
  name: "${slug}_defense_agent",
  network: "pi:testnet",
  facilitatorUrl: "https://api.minepi.com/x402/facilitator",
  circuitBreakerMaxRiskPct: ${riskScorePct},
});

server.paidTool(
  "mitigate_${input.threatCategory}",
  {
    description: "Executes precautionary containment for: ${input.title.replace(/"/g, "'")}",
    pricePi: "0.0001",
    scheme: "batch-settlement",
    oracleSpreadGuardPct: ${input.oracleSpreadPct.toFixed(2)},
  },
  async ({ targetNode, digestSha256 }) => {
    return {
      status: "${oracleStatus === 'spread_warning' ? 'safe_fallback' : 'armed'}",
      riskScorePct: ${riskScorePct},
      estimatedHedgePi: ${estimatedPiCost},
      targetNode,
      verifiedDigest: digestSha256,
    };
  }
);

// Exported agent wrapper for downstream Pi applications
export const clientWrapper = withX402Client({
  maxPerCallPi: "0.01",
  monthlyCapPi: "0.10",
});
`;

  const agentsMarkdown = `# agents.md — ${input.title}
- Agent ID: \`${slug}_defense_agent\`
- Threat Category: \`${input.threatCategory}\`
- Composite Risk Score: **${riskScorePct}%** (${riskLevel})
- PiRC-203 Oracle Hedge Budget: **${estimatedPiCost} Pi** (@ $${safePiPrice.toFixed(4)}/Pi)
- Payment Protocol: x402 V2 (\`/x402/mcp\`) + PiRC2 Subscription Allowance

## Precautionary Actions
${presetMitigations.map((m, i) => `${i + 1}. ${m}`).join('\n')}
`;

  const soloHostManifest = JSON.stringify(
    {
      schema: 'solohost.pi.agent/v1',
      agentId: `${slug}_solohost`,
      title: input.title,
      runtime: 'node20-isolated',
      privacyMode: 'local_node_inference',
      mcpEndpoint: '/x402/mcp',
      pirc203OraclePriceUsd: safePiPrice,
      pirc254CircuitBreaker: {
        enabled: true,
        haltOnOracleSpreadAbovePct: 4.5,
        currentSpreadPct: input.oracleSpreadPct,
      },
      estimatedBudgetPi: estimatedPiCost,
    },
    null,
    2
  );

  const sorobanContractCode = `// Soroban / PiRC2 Subscription + PiRC-254 Circuit Breaker Contract
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct SubscriptionGuard {
    pub subscriber: Address,
    pub monthly_micro_pi: i128, // 1_000 stroops = 0.0001 Pi (batch settled)
    pub max_budget_pi: i128,
    pub expiration_ledger: u32,
    pub circuit_halted: bool,
}

#[contract]
pub struct RiskDefenseSubscription;

#[contractimpl]
impl RiskDefenseSubscription {
    pub fn authorize_pirc2(
        env: Env,
        subscriber: Address,
        monthly_micro_pi: i128,
        max_budget_pi: i128,
        expiration_ledger: u32,
    ) -> SubscriptionGuard {
        subscriber.require_auth();
        SubscriptionGuard {
            subscriber,
            monthly_micro_pi,
            max_budget_pi,
            expiration_ledger,
            circuit_halted: ${oracleStatus === 'spread_warning' ? 'true' : 'false'},
        }
    }

    pub fn trigger_pirc254_breaker(env: Env, admin: Address, risk_pct: u32) -> Symbol {
        admin.require_auth();
        if risk_pct >= ${riskScorePct} {
            Symbol::new(&env, "HALTED")
        } else {
            Symbol::new(&env, "ACTIVE")
        }
    }
}
`;

  const subscriptionSpecJson = JSON.stringify(
    {
      standard: 'PiRC2 + x402-V2',
      planName: `${locale === 'ar' ? 'حماية' : 'Guard:'} ${input.title}`,
      microTierMonthlyPi: MICRO_SUBSCRIPTION_PI,
      premiumGeneratorPi: estimatedPiCost,
      mainnetBaseFeePi: PI_MAINNET_BASE_FEE,
      settlementStrategy: 'batch-settlement + PiRC2 transfer_from allowance',
      x402PaymentRequiredHeader: {
        x402Version: 2,
        scheme: 'batch-settlement',
        network: 'pi:testnet',
        maxAmountRequired: String(MICRO_SUBSCRIPTION_PI),
        resource: '/api/x402/mcp',
        asset: 'PI',
      },
    },
    null,
    2
  );

  return {
    riskScorePct,
    riskLevel,
    oracleStatus,
    estimatedPiCost,
    precautionarySteps: presetMitigations,
    mcpAgentCode,
    agentsMarkdown,
    soloHostManifest,
    sorobanContractCode,
    subscriptionSpecJson,
  };
}

export const INITIAL_GOVERNANCE_PROPOSALS: GovernanceProposal[] = [
  {
    id: 'prop-01',
    title: 'وكيل رصد ثغرات PHP2Shell وبوابات BGP على SoloHost',
    kind: 'mcp_agent',
    riskScorePct: 81,
    pricePi: 0.0001,
    status: 'voting',
    votesFor: 148,
    votesAgainst: 11,
    quorumRequired: 180,
    summary:
      'وكيل MCP محلي يطابق تنبيهات CISA BOD 22-01 مع قياسات BGP الحية ويصدر تنبيهات خضراء/حمراء موقعة.',
    artifactSnippet: 'server.paidTool("mitigate_web_exploit", { pricePi: "0.0001", scheme: "batch-settlement" })',
  },
  {
    id: 'prop-02',
    title: 'عقد الاشتراك التجميعي PiRC2 + قاطع الدائرة PiRC-254',
    kind: 'soroban_contract',
    riskScorePct: 68,
    pricePi: 0.1,
    status: 'staged_rollout',
    votesFor: 214,
    votesAgainst: 9,
    quorumRequired: 180,
    summary:
      'عقد Soroban يمنع استنزاف غاز 0.01 Pi على الاشتراكات الدقيقة ويوقف السحب عند اتساع الفارق السعري في الأوراكل.',
    artifactSnippet: 'authorize_pirc2(subscriber, monthly_micro_pi: 1000, expiration_ledger)',
  },
];

export function buildEventVerificationPayload(ev: LiveEvent): string {
  return JSON.stringify({
    id: ev.id,
    sequence: ev.sequence,
    timestamp: ev.timestamp,
    title: ev.title,
    lat: Number(ev.coordinates.lat.toFixed(4)),
    lng: Number(ev.coordinates.lng.toFixed(4)),
    sourceName: ev.sourceName,
    spofNode: ev.spofNode,
    epistemicTier: ev.epistemicTier ?? 'plausible',
  });
}
