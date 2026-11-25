const DAY_MS = 24 * 60 * 60 * 1000;

function safeDate(value) {
  if (!value) return null;
  const millis = Date.parse(value);
  return Number.isFinite(millis) ? millis : null;
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function sourceFreshness(source, nowMs) {
  const millis = safeDate(source.last_success_at);
  if (millis === null) return "unknown";
  const age = Math.max(0, nowMs - millis);
  if (age <= 6 * 60 * 60 * 1000) return "recent";
  if (age <= DAY_MS) return "aging";
  return "stale";
}

function localize(locale, ar, en) {
  return locale === "ar" ? ar : en;
}

export function buildAgentRunSummary(templateKey, dataset = {}, options = {}) {
  const locale = options.locale === "ar" ? "ar" : "en";
  const observedAt = options.observedAt || new Date().toISOString();
  const nowMs = safeDate(observedAt) ?? Date.now();
  const sources = Array.isArray(dataset.sources) ? dataset.sources.filter((item) => item && item.enabled === true) : [];
  const news = Array.isArray(dataset.news) ? dataset.news : [];
  const hazards = Array.isArray(dataset.hazards) ? dataset.hazards : [];
  const risks = Array.isArray(dataset.risks) ? dataset.risks : [];
  const scenarios = Array.isArray(dataset.scenarios) ? dataset.scenarios : [];
  const telemetry = dataset.piTelemetry ?? null;
  const sourceCoverage = sources.map((source) => ({
    key: String(source.source_key || "unknown"),
    name: String(source.display_name || source.source_key || "Source"),
    sourceType: String(source.source_type || "unknown"),
    lastSuccessAt: source.last_success_at || null,
    freshness: sourceFreshness(source, nowMs),
    coverageNote: String(source.coverage_note || ""),
  }));

  let relevantNews = [];
  let relevantHazards = [];
  let relevantSources = [];
  let expected = [];
  let recommendations = [];
  let summaryEn = "";
  let summaryAr = "";
  let status = "unavailable";
  let findings = [];
  let dataCount = 0;
  const limits = [
    localize(locale, "هذه جولة تحليل ومحاكاة للقراءة فقط؛ لا يتم تعديل أنظمة أو إرسال معاملات.", "This is a read-only analysis simulation; it does not modify systems or submit transactions."),
    localize(locale, "التغطية محدودة بالمصادر المتصلة وسجلاتها؛ غياب السجل لا يثبت غياب الحدث.", "Coverage is limited to connected sources and their records; an empty feed does not prove an event did not occur."),
  ];

  switch (templateKey) {
    case "cyber-threat-watch":
      relevantNews = news.filter((item) => item.category === "cyber");
      relevantSources = sourceCoverage.filter((source) => source.key === "gdelt-doc");
      expected = ["gdelt-doc"];
      dataCount = relevantNews.length;
      summaryEn = dataCount
        ? "Found " + dataCount + " source-indexed cyber report(s). These are reports for triage, not confirmation that an attack is active."
        : "No cyber reports are currently stored in the connected news index. Incident status is unavailable, not clear or safe.";
      summaryAr = dataCount
        ? "تم العثور على " + dataCount + " تقريرًا سيبرانيًا مفهرسًا بمصدر. هذه بلاغات للفرز وليست تأكيدًا على وجود هجوم نشط."
        : "لا توجد حاليًا تقارير سيبرانية محفوظة في فهرس الأخبار المتصل. حالة الحوادث غير متاحة، وهذا لا يعني أن البيئة آمنة.";
      recommendations = locale === "ar"
        ? ["احفظ سجلات الهوية والشبكة والتطبيقات مع الطوابع الزمنية وبصمات سلامة الأدلة.", "تحقق من المؤشرات عبر مصدر مستقل قبل إعلان الاختراق أو نسبته إلى جهة.", "اعزل الأصول التي تملكها أو تديرها بتفويض، مع الحفاظ على مسار استعادة موثق.", "راجع الإصدارات المكشوفة، وطبّق التصحيحات المعتمدة، ودوّر بيانات الاعتماد بعد التحقق.", "استعد الخدمات من نسخة سليمة معزولة، واطلب موافقة مسؤول الحادث قبل أي تغيير خارجي."]
        : ["Preserve identity, network, and application logs with timestamps and evidence-integrity hashes.", "Corroborate indicators with an independent source before declaring or attributing an incident.", "Contain only assets you own or are explicitly authorized to administer, with a documented recovery path.", "Review exposed versions, apply approved patches, and rotate credentials after validation.", "Restore services from a clean isolated backup; require incident-owner approval for external changes."];
      break;

    case "global-disaster-watch":
      relevantHazards = hazards;
      relevantSources = sourceCoverage.filter((source) => source.key === "usgs-earthquakes" || source.key === "nasa-eonet");
      expected = ["usgs-earthquakes", "nasa-eonet"];
      dataCount = relevantHazards.length;
      summaryEn = dataCount
        ? "The connected hazard feeds contain " + dataCount + " active or recently observed event record(s). Severity and local coverage vary by source."
        : "No hazard records are currently available from the connected feeds. This is a coverage gap, not an all-clear.";
      summaryAr = dataCount
        ? "تحتوي مصادر المخاطر الطبيعية المتصلة على " + dataCount + " سجلًا نشطًا أو مرصودًا حديثًا. تختلف الشدة والتغطية المحلية حسب المصدر."
        : "لا تتوفر حاليًا سجلات مخاطر طبيعية من المصادر المتصلة. هذه فجوة تغطية وليست إعلانًا عن خلو المخاطر.";
      recommendations = locale === "ar"
        ? ["تحقق من التنبيهات الرسمية المحلية قبل اتخاذ قرارات الإخلاء أو السلامة.", "قارن توقيت الحدث وموقعه مع الجهة الناشرة، ولا تستنتج شدة غير منشورة."]
        : ["Check local official alerts before making evacuation or safety decisions.", "Compare event time and location with the publishing agency; do not infer an unpublished severity."];
      break;

    case "news-source-verifier":
      relevantNews = news;
      relevantSources = sourceCoverage.filter((source) => source.sourceType === "news");
      expected = ["gdelt-doc"];
      dataCount = relevantNews.length;
      summaryEn = dataCount
        ? "Reviewed " + dataCount + " indexed news item(s). The index provides discovery, not independent corroboration or a truth verdict."
        : "No indexed news items are currently available. The system cannot verify a story without attributable records.";
      summaryAr = dataCount
        ? "تمت مراجعة " + dataCount + " مادة إخبارية مفهرسة. يوفّر الفهرس الاكتشاف، لا التحقق المستقل أو حكمًا نهائيًا بالحقيقة."
        : "لا تتوفر مواد إخبارية مفهرسة حاليًا. لا يستطيع النظام التحقق من قصة دون سجلات منسوبة إلى مصادر.";
      recommendations = locale === "ar"
        ? ["افحص الناشر الأصلي وتاريخ النشر والرابط canonical.", "اطلب مصدرًا مستقلًا ثانيًا قبل رفع التصنيف إلى مؤكد.", "افصل بين الخبر المنشور وتحليل النموذج."]
        : ["Check the original publisher, publication time, and canonical link.", "Require a second independent source before upgrading a claim to corroborated.", "Separate the published report from model interpretation."];
      break;

    case "market-risk-monitor":
      relevantNews = news.filter((item) => ["economy", "energy"].includes(item.category));
      relevantSources = sourceCoverage.filter((source) => source.sourceType === "research" || source.sourceType === "news");
      expected = ["licensed-market-price-feed", "macro-economic-series"];
      dataCount = 0;
      summaryEn = "Live, timestamped market-price and macroeconomic time-series connectors are not configured. No price, return forecast, crash probability, or trade signal is generated.";
      summaryAr = "لم يتم إعداد موصلات أسعار سوق وسلاسل اقتصادية كلية مؤرخة وموثوقة. لن يتم إنشاء سعر أو توقع عائد أو احتمال انهيار أو إشارة تداول.";
      recommendations = locale === "ar"
        ? ["اربط مصدر أسعار مرخصًا وسلسلة تاريخية موثوقة لكل أصل.", "استخدم سيناريوهات متعددة وفواصل عدم يقين بعد اكتمال البيانات، لا توقعًا مضمونًا."]
        : ["Connect a licensed price feed and reliable history for each asset.", "Use multiple scenarios and uncertainty intervals once data is complete, never a guaranteed forecast."];
      break;

    case "space-anomaly-observer":
      relevantNews = news.filter((item) => item.category === "science");
      relevantSources = sourceCoverage.filter((source) => source.sourceType === "research" || source.sourceType === "news");
      expected = ["attributed-space-science-source"];
      dataCount = relevantNews.length;
      summaryEn = dataCount
        ? "Found " + dataCount + " science/space report(s). Unusual claims remain unverified unless independently confirmed by primary observations."
        : "No dedicated space-object or anomaly feed is connected. Extraordinary claims remain unassessed.";
      summaryAr = dataCount
        ? "تم العثور على " + dataCount + " تقريرًا علميًا أو فضائيًا. تبقى الادعاءات غير المعتادة غير متحققة ما لم تؤكدها ملاحظات أولية مستقلة."
        : "لا يوجد مصدر متخصص متصل للأجسام الفضائية أو الظواهر غير المعتادة. تبقى الادعاءات الاستثنائية دون تقييم.";
      recommendations = locale === "ar"
        ? ["ميّز بين رصد منشور وتفسير علمي وادعاء متنازع عليه أو رمزي.", "لا تصف ظاهرة بأنها فضائية أو خارقة دون دليل أولي قابل لإعادة الفحص."]
        : ["Distinguish a published observation from scientific interpretation, disputed claims, and symbolism.", "Do not label an event extraterrestrial or extraordinary without reproducible primary evidence."];
      break;

    case "public-health-watch":
      relevantNews = news.filter((item) => item.category === "health");
      relevantSources = sourceCoverage.filter((source) => source.sourceType === "news" || source.sourceType === "research");
      expected = ["official-public-health-feed"];
      dataCount = relevantNews.length;
      summaryEn = dataCount
        ? "Found " + dataCount + " public-health report(s). This is situational awareness only; case counts and guidance must be checked with health authorities."
        : "No public-health reports are currently indexed. This is not evidence that no outbreak exists.";
      summaryAr = dataCount
        ? "تم العثور على " + dataCount + " تقريرًا للصحة العامة. هذه متابعة للمشهد فقط؛ يجب التحقق من أعداد الحالات والإرشادات لدى الجهات الصحية."
        : "لا توجد تقارير صحة عامة مفهرسة حاليًا. هذا ليس دليلًا على عدم وجود تفشٍ.";
      recommendations = locale === "ar"
        ? ["اعتمد إرشادات السلطات الصحية الرسمية فقط.", "لا تُحوّل تقارير الأخبار إلى تشخيص أو نصيحة طبية."]
        : ["Use official public-health authority guidance.", "Do not turn news reports into a diagnosis or medical advice."];
      break;

    case "pi-testnet-observer":
      relevantSources = sourceCoverage.filter((source) => source.key === "pi-testnet-horizon");
      expected = ["pi-testnet-horizon"];
      if (telemetry && telemetry.status === "connected") {
        status = "ok";
        dataCount = 1;
        summaryEn = "Pi Testnet Horizon is responding. Latest ledger sequence: " + String(telemetry.sequence) + ". This observer is read-only.";
        summaryAr = "يستجيب Pi Testnet Horizon. تسلسل آخر دفتر: " + String(telemetry.sequence) + ". هذه المراقبة للقراءة فقط.";
        findings = [{
          title: locale === "ar" ? "آخر دفتر في Pi Testnet" : "Latest Pi Testnet ledger",
          detail: "#" + String(telemetry.sequence) + " · base fee " + String(telemetry.baseFeeStroops) + " stroops",
          evidenceClass: "network_observation",
          sourceUrl: "https://api.testnet.minepi.com/ledgers",
          observedAt: telemetry.closedAt || observedAt,
        }];
      } else {
        summaryEn = "Pi Testnet Horizon could not be reached. Ledger and fee telemetry are unavailable for this run.";
        summaryAr = "تعذر الوصول إلى Pi Testnet Horizon. بيانات الدفتر والرسوم غير متاحة في هذه الجولة.";
      }
      recommendations = locale === "ar"
        ? ["أعد المحاولة لاحقًا عند توفر Horizon.", "لا توقّع معاملات أو ترسل تحويلات من وكيل المراقبة."]
        : ["Retry later when Horizon is available.", "Do not sign transactions or submit transfers from an observer agent."];
      break;

    default:
      relevantNews = news;
      relevantHazards = hazards;
      dataCount = relevantNews.length + relevantHazards.length + risks.length + scenarios.length;
      summaryEn = "This template has no specialized data connector yet. Available records are shown without extrapolating missing data.";
      summaryAr = "لا يملك هذا القالب موصل بيانات متخصصًا بعد. تُعرض السجلات المتاحة دون استنتاج بيانات مفقودة.";
      recommendations = locale === "ar"
        ? ["أضف مصدرًا موثوقًا مع الإسناد والطابع الزمني قبل تفعيل التحليل."]
        : ["Add a trusted source with attribution and timestamps before enabling analysis."];
  }

  if (templateKey !== "pi-testnet-observer") status = dataCount > 0 ? "partial" : "unavailable";

  if (relevantNews.length > 0) {
    findings.push(...relevantNews.slice(0, 8).map((item) => ({
      title: String(item.title || "Untitled report").slice(0, 240),
      detail: String(item.source_domain || "Source unavailable"),
      evidenceClass: String(item.evidence_class || "unverified"),
      sourceUrl: safeUrl(item.canonical_url),
      observedAt: item.observed_at || item.published_at || null,
    })));
  }
  if (relevantHazards.length > 0) {
    findings.push(...relevantHazards.slice(0, 8).map((item) => ({
      title: String(item.title || "Hazard event").slice(0, 240),
      detail: [item.hazard_type, item.location_label, item.severity_label].filter(Boolean).join(" · ").slice(0, 240),
      evidenceClass: "source_attributed_hazard_record",
      sourceUrl: safeUrl(item.source_url),
      observedAt: item.occurred_at || item.observed_at || null,
    })));
  }
  if (templateKey === "news-source-verifier" && findings.length > 0) {
    findings = findings.map((finding) => ({ ...finding, verification: "single_index_record_only" }));
  }

  const freshness = sourceCoverage.reduce((acc, source) => {
    acc[source.freshness] = (acc[source.freshness] || 0) + 1;
    return acc;
  }, {});
  const connectedExpected = expected.filter((key) => sourceCoverage.some((source) => source.key === key));
  const missingSources = expected.filter((key) => !sourceCoverage.some((source) => source.key === key));

  return {
    status,
    executionMode: "simulation",
    templateKey,
    observedAt,
    summary: localize(locale, summaryAr, summaryEn),
    coverage: {
      status: status === "ok" ? "connected" : status,
      recordsReviewed: dataCount,
      sources: relevantSources.length ? relevantSources : sourceCoverage,
      expectedSources: expected,
      connectedExpectedSources: connectedExpected,
      missingSources,
      freshness,
      marketRiskAssessmentsAvailable: risks.length,
      savedScenarioSnapshotsAvailable: scenarios.length,
    },
    findings: findings.slice(0, 12),
    recommendations,
    limits,
    riskScore: null,
    forecast: null,
    externalActionsExecuted: 0,
    transactionsSubmitted: 0,
    entitlementsGranted: 0,
  };
}
