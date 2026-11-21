import {
  AppLocale,
  EncryptedMapNode,
  EpistemicTier,
  GovernanceProposal,
  HypothesisId,
  LiveEvent,
  PlatformLayerId,
  QKeyDomainId,
  RegionViewKey,
  ReliabilityGrade,
  ResearchTrack,
  ScenarioId,
  SectorType,
  SemioticMarker,
  ThreatMechanismId,
} from './types';
import {
  ENCRYPTED_NODES_I18N,
  EPISTEMIC_I18N,
  GOVERNANCE_PROPOSALS_I18N,
  HYPOTHESIS_I18N,
  PLATFORM_I18N,
  QKEY_I18N,
  REGION_LABELS_I18N,
  RELIABILITY_I18N,
  SCENARIO_I18N,
  SECTOR_I18N,
  SEED_EVENTS_I18N,
  SEMIOTIC_I18N,
  THREAT_I18N,
  TRACK_I18N,
} from './i18n-data';

export const LOCALE_OPTIONS: {
  code: AppLocale;
  nativeLabel: string;
  dir: 'rtl' | 'ltr';
}[] = [
  { code: 'ar', nativeLabel: 'العربية (AR)', dir: 'rtl' },
  { code: 'en', nativeLabel: 'English (EN)', dir: 'ltr' },
  { code: 'fr', nativeLabel: 'Français (FR)', dir: 'ltr' },
  { code: 'id', nativeLabel: 'Indonesia (ID)', dir: 'ltr' },
  { code: 'vi', nativeLabel: 'Tiếng Việt (VI)', dir: 'ltr' },
];

export interface FullUiCopy {
  brandTitle: string;
  dominantLabel: string;
  backendBtn: string;
  addEventBtnShort: string;
  addEventBtnTail: string;
  filterAll: string;
  filterEvents: string;
  filterForecasts: string;
  streamStart: string;
  streamPause: string;
  nextEvent: string;
  simulateGemini: string;
  simulatingGemini: string;
  resetMap: string;
  mapHintPre: string;
  mapHintEvents: string;
  mapHintOr: string;
  mapHintForecasts: string;
  mapHintPost: string;
  feedHeader: string;
  feedLegend: string;
  backToMap: string;
  backendModalTitle: string;
  tabSemiotics: string;
  tabAch: string;
  tabRiskGen: string;
  tabProtocol: string;
  tabCloudAgent: string;
  tabFilm: string;
  cloudAgentShort: string;
  autoSenseOn: string;
  autoSenseOff: string;
  scanNow: string;
  layerEvents: string;
  layerGlobal: string;
  layerCables: string;
  layerEncrypted: string;
  liveShort: string;
  pausedShort: string;
  cloudShort: string;
  layersShort: string;
  forecastTag: string;
  languageLabel: string;
  closeLabel: string;
  scenarioPrefix: string;
  drawerSummaryHeading: string;
  drawerPlatformLabel: string;
  drawerThreatLabel: string;
  drawerStagesHeading: string;
  drawerVerifyHeading: string;
  drawerMainTrigger: string;
  drawerEarlyWarning: string;
  drawerDualMapLink: string;
  drawerEpistemicTierLabel: string;
  drawerShaButton: string;
  drawerFilmHeading: string;
  drawerActPrefix: string;
  drawerBackendSummary: string;
  drawerOpenBackendBtn: string;
  drawerDeepenGemini: string;
  drawerUpdatingGemini: string;
  drawerPredictGemini: string;
  drawerPredictingGemini: string;
  addModalTitle: string;
  addTitleLabel: string;
  addTitlePh: string;
  addSummaryLabel: string;
  addSummaryPh: string;
  addSectorLabel: string;
  addTrackLabel: string;
  addThreatLabel: string;
  addPlatformLabel: string;
  addCityLabel: string;
  addLatLabel: string;
  addLngLabel: string;
  addSourceLabel: string;
  addSourcePh: string;
  addGradeLabel: string;
  addSpofLabel: string;
  addSpofPh: string;
  addParentLabel: string;
  addParentIndependent: string;
  addLatencyLabel: string;
  addBpsLabel: string;
  addDisinfoLabel: string;
  addEpistemicLabel: string;
  addQKeyLabel: string;
  addAiCheckbox: string;
  addCancelBtn: string;
  addSubmitBtn: string;
  addSubmittingBtn: string;
  geminiErrTitle: string;
  geminiErrConnect: string;
}

export const UI_COPY: Record<AppLocale, FullUiCopy> = {
  ar: {
    brandTitle: 'مرصد المسارات الاستشرافي',
    dominantLabel: 'المسار المرجّح الآن:',
    backendBtn: 'الآليات الخلفية',
    addEventBtnShort: 'إضافة خبر',
    addEventBtnTail: 'أو حدث',
    filterAll: 'الكل',
    filterEvents: 'الأخبار المرصودة',
    filterForecasts: 'التوقعات القادمة',
    streamStart: 'تشغيل التدفق',
    streamPause: 'إيقاف التحديث',
    nextEvent: 'الخبر التالي',
    simulateGemini: 'توقع المسار القادم (Gemini)',
    simulatingGemini: 'جارٍ التوقع...',
    resetMap: 'إعادة',
    mapHintPre: 'اضغط على أي',
    mapHintEvents: 'خبر مرصود',
    mapHintOr: 'أو',
    mapHintForecasts: 'توقع قادم',
    mapHintPost: 'أو إحداثي عالمي/مشفر لعرض السيناريو الكامل بالتفصيل',
    feedHeader: 'التدفق العالمي الموحّد والخرائط المشفرة والتوقعات (اضغط لعرض السيناريو الكامل)',
    feedLegend: 'خطوط متصلة: أخبار فعلية · متقطعة: مسارات متوقعة · ماسية: خرائط مشفرة',
    backToMap: 'عودة للخريطة',
    backendModalTitle: 'الآليات الخلفية للتحليل والشفرات ومنظومة Pi / x402 والسحابة',
    tabSemiotics: 'الخريطتان والشفرات (π)',
    tabAch: 'مصفوفة ACH ومقياس الأدلة',
    tabRiskGen: 'توليد الوكلاء والعقود والمخاطر',
    tabProtocol: 'بوابة Pi / x402 وخطط Pi Next',
    tabCloudAgent: 'SoloHost & Hermes السحابي (بدون حاسوب)',
    tabFilm: 'نص سيناريو الفيلم',
    cloudAgentShort: 'تشغيل سحابي (SoloHost/Hermes)',
    autoSenseOn: 'استشعار دوري (كل 45 ثانية): فعّال',
    autoSenseOff: 'استشعار دوري: متوقف',
    scanNow: 'فحص عالمي الآن',
    layerEvents: 'الأخبار والتوقعات',
    layerGlobal: 'أحداث عالمية حية',
    layerCables: 'الكابلات والممرات',
    layerEncrypted: 'الخرائط المشفرة (π / Q)',
    liveShort: 'رصد حي',
    pausedShort: 'متوقف',
    cloudShort: 'سحابي',
    layersShort: 'الطبقات',
    forecastTag: 'توقع',
    languageLabel: 'اختيار لغة التطبيق',
    closeLabel: 'إغلاق',
    scenarioPrefix: 'مسار',
    drawerSummaryHeading: 'ملخص السيناريو الكامل',
    drawerPlatformLabel: 'القطاع والمنصة: ',
    drawerThreatLabel: 'آلية التهديد: ',
    drawerStagesHeading: 'تطور السيناريو خطوة بخطوة',
    drawerVerifyHeading: 'شرط التحقق ومقياس الأدلة والتوثيق التشفيري',
    drawerMainTrigger: 'المُحرّك الرئيسي: ',
    drawerEarlyWarning: 'مؤشر الإنذار المبكر: ',
    drawerDualMapLink: 'ربط الخريطتين: ',
    drawerEpistemicTierLabel: 'التصنيف المعرفي',
    drawerShaButton: 'توثيق البصمة التشفيرية للإحداثي والحدث (SHA-256)',
    drawerFilmHeading: 'المشهد السينمائي المتكامل',
    drawerActPrefix: 'الفصل',
    drawerBackendSummary: 'تفاصيل الحسابات الخلفية والتحقق العلمي (π و ACH و Pi/x402)',
    drawerOpenBackendBtn: 'فتح وحدة الآليات الخلفية ومختبر الشفرات',
    drawerDeepenGemini: 'تعميق وتحديث هذا السيناريو عبر Gemini',
    drawerUpdatingGemini: 'جارٍ تحديث السيناريو...',
    drawerPredictGemini: 'توليد المسار القادم المتوقع عبر Gemini',
    drawerPredictingGemini: 'جارٍ استنتاج المسار القادم...',
    addModalTitle: 'إدخال حدث لحظي جديد في خريطة المسارات والتهديدات',
    addTitleLabel: 'عنوان الحدث اللحظي *',
    addTitlePh: 'مثال: تعثر تسوية عقود الطاقة الآجلة في بورصة إقليمية',
    addSummaryLabel: 'الوصف التفصيلي والمعطيات الأولية *',
    addSummaryPh: 'صف المؤشرات التقنية أو المالية أو السردية المرصودة...',
    addSectorLabel: 'القطاع المتأثر',
    addTrackLabel: 'المسار البحثي',
    addThreatLabel: 'آلية التهديد',
    addPlatformLabel: 'طبقة المنصة المستهدفة',
    addCityLabel: 'المدينة',
    addLatLabel: 'خط العرض',
    addLngLabel: 'خط الطول',
    addSourceLabel: 'المصدر المبلّغ *',
    addSourcePh: 'مثال: سجل RIPE BGP أو بيان المصرف المركزي',
    addGradeLabel: 'درجة موثوقية المصدر (OSINT)',
    addSpofLabel: 'نقطة الفشل / العقدة المرتبطة (SPOF) *',
    addSpofPh: 'مثال: عقدة التوجيه السحابي Core-IAM-EU',
    addParentLabel: 'الحدث المسبِّب (الربط السببي على الخريطة)',
    addParentIndependent: 'حدث مستقل (بداية مسار جديد)',
    addLatencyLabel: 'زمن الاستجابة (+ms)',
    addBpsLabel: 'الأثر المالي (bps)',
    addDisinfoLabel: 'ضغط التضليل (%)',
    addEpistemicLabel: 'تصنيف الأدلة المنهجي (5 مستويات)',
    addQKeyLabel: 'تصنيف المجال السردي (Q-KEY)',
    addAiCheckbox: 'توليد تحليل معمق مجاني عبر Gemini (ربط الخريطتين + معادلات π + مشهد الفيلم)',
    addCancelBtn: 'إلغاء',
    addSubmitBtn: 'إدراج ورسم المسار اللحظي',
    addSubmittingBtn: 'جارٍ التحليل والإدراج...',
    geminiErrTitle: 'تعذر إتمام التحليل عبر Gemini، أعد المحاولة.',
    geminiErrConnect: 'فشل الاتصال بخدمة التحليل.',
  },
  en: {
    brandTitle: 'Strategic Trajectory Observatory',
    dominantLabel: 'Leading Trajectory:',
    backendBtn: 'Backend Mechanics',
    addEventBtnShort: 'Add News',
    addEventBtnTail: '/ Event',
    filterAll: 'All',
    filterEvents: 'Observed News',
    filterForecasts: 'Forecasts',
    streamStart: 'Start Stream',
    streamPause: 'Pause Stream',
    nextEvent: 'Next Event',
    simulateGemini: 'Forecast Next (Gemini)',
    simulatingGemini: 'Forecasting...',
    resetMap: 'Reset',
    mapHintPre: 'Click any',
    mapHintEvents: 'observed news event',
    mapHintOr: 'or',
    mapHintForecasts: 'upcoming forecast',
    mapHintPost: 'or global/encrypted node on the map to inspect the full scenario',
    feedHeader: 'Unified Global Feed, Encrypted Nodes & Forecasts (Click for Full Scenario)',
    feedLegend: 'Solid arcs: live events · Dashed arcs: forecasts · Diamonds: encrypted map',
    backToMap: 'Back to Map',
    backendModalTitle: 'Backend Mechanics, Decoder Lab, Cloud Agents & Pi Next Studio',
    tabSemiotics: 'Dual Maps & Decoders (π)',
    tabAch: 'ACH & Epistemic Matrix',
    tabRiskGen: 'Risk, Agents & Soroban',
    tabProtocol: 'Pi / x402 & Pi Next Plan',
    tabCloudAgent: 'Cloud SoloHost & Hermes (No PC)',
    tabFilm: 'Film Script',
    cloudAgentShort: 'Cloud SoloHost/Hermes',
    autoSenseOn: 'Periodic Polling (45s): ON',
    autoSenseOff: 'Periodic Polling: PAUSED',
    scanNow: 'Sense Global Now',
    layerEvents: 'News & Forecasts',
    layerGlobal: 'Live Global Sensors',
    layerCables: 'Cables & Chokepoints',
    layerEncrypted: 'Encrypted Maps (π / Q)',
    liveShort: 'Live',
    pausedShort: 'Paused',
    cloudShort: 'Cloud',
    layersShort: 'Layers',
    forecastTag: 'Forecast',
    languageLabel: 'Application language',
    closeLabel: 'Close',
    scenarioPrefix: 'Trajectory:',
    drawerSummaryHeading: 'Complete Scenario Brief',
    drawerPlatformLabel: 'Sector & Platform: ',
    drawerThreatLabel: 'Threat Mechanism: ',
    drawerStagesHeading: 'Step-by-Step Scenario Progression',
    drawerVerifyHeading: 'Verification, Epistemic Tier & SHA-256 Digest',
    drawerMainTrigger: 'Primary Driver: ',
    drawerEarlyWarning: 'Early Warning Indicator: ',
    drawerDualMapLink: 'Dual-Map Link: ',
    drawerEpistemicTierLabel: 'Epistemic Tier',
    drawerShaButton: 'Compute Cryptographic Digest (SHA-256)',
    drawerFilmHeading: 'Synchronized Film Scene',
    drawerActPrefix: 'Act',
    drawerBackendSummary: 'Backend Mathematics & Verification Details (π, ACH, Pi/x402)',
    drawerOpenBackendBtn: 'Open Backend Mechanics & Decoder Lab',
    drawerDeepenGemini: 'Deepen & Update Scenario via Gemini',
    drawerUpdatingGemini: 'Updating Scenario...',
    drawerPredictGemini: 'Generate Next Trajectory via Gemini',
    drawerPredictingGemini: 'Forecasting Next...',
    addModalTitle: 'Ingest Live News / Event into Trajectory & Threat Map',
    addTitleLabel: 'Event Headline *',
    addTitlePh: 'e.g. Clearing halt across regional energy futures exchange',
    addSummaryLabel: 'Detailed Summary & Initial Telemetry *',
    addSummaryPh: 'Describe observed technical, financial, or narrative signals...',
    addSectorLabel: 'Affected Sector',
    addTrackLabel: 'Research Track',
    addThreatLabel: 'Threat Mechanism',
    addPlatformLabel: 'Target Platform Layer',
    addCityLabel: 'City',
    addLatLabel: 'Latitude',
    addLngLabel: 'Longitude',
    addSourceLabel: 'Reporting Source *',
    addSourcePh: 'e.g. RIPE BGP Telemetry or Central Bank Filing',
    addGradeLabel: 'OSINT Source Reliability Grade',
    addSpofLabel: 'Single Point of Failure / Node (SPOF) *',
    addSpofPh: 'e.g. Core-IAM-EU Cloud Node',
    addParentLabel: 'Causal Parent Event (Arc Link)',
    addParentIndependent: 'Independent Event (New Trajectory Origin)',
    addLatencyLabel: 'Latency Spike (+ms)',
    addBpsLabel: 'Market Impact (bps)',
    addDisinfoLabel: 'Disinfo Velocity (%)',
    addEpistemicLabel: 'Epistemic Evidence Tier (5-Level)',
    addQKeyLabel: 'Narrative Domain (Q-KEY)',
    addAiCheckbox: 'Generate free deep Gemini analysis (Dual-Map + Pi math + Film scene)',
    addCancelBtn: 'Cancel',
    addSubmitBtn: 'Ingest & Plot Trajectory',
    addSubmittingBtn: 'Analyzing & Plotting...',
    geminiErrTitle: 'Unable to complete Gemini analysis. Please retry.',
    geminiErrConnect: 'Failed to reach analysis backend.',
  },
  fr: {
    brandTitle: 'Observatoire Stratégique des Trajectoires',
    dominantLabel: 'Trajectoire Dominante :',
    backendBtn: 'Moteurs & Protocoles',
    addEventBtnShort: 'Ajouter',
    addEventBtnTail: 'un événement',
    filterAll: 'Tout',
    filterEvents: 'Faits observés',
    filterForecasts: 'Prévisions',
    streamStart: 'Démarrer le flux',
    streamPause: 'Pause du flux',
    nextEvent: 'Événement suivant',
    simulateGemini: 'Prédire la suite (Gemini)',
    simulatingGemini: 'Prédiction...',
    resetMap: 'Réinit.',
    mapHintPre: 'Cliquez sur un',
    mapHintEvents: 'fait observé',
    mapHintOr: 'ou',
    mapHintForecasts: 'scénario prévu',
    mapHintPost: 'ou nœud mondial/chiffré pour inspecter l’analyse complète',
    feedHeader: 'Flux Mondial Unifié, Nœuds Chiffrés & Prévisions (Cliquer pour détails)',
    feedLegend: 'Lignes pleines : faits réels · Pointillés : prévisions · Losanges : cartes chiffrées',
    backToMap: 'Retour à la carte',
    backendModalTitle: 'Moteurs Arrière-Plan, Décodeur π, Cloud Agents & Pi Next',
    tabSemiotics: 'Cartes & Décodeur (π)',
    tabAch: 'Matrice ACH & Preuves',
    tabRiskGen: 'Risques, Agents & Soroban',
    tabProtocol: 'Passerelle Pi / x402 & Pi Next',
    tabCloudAgent: 'SoloHost & Hermes Cloud (Sans PC)',
    tabFilm: 'Scénario du Film',
    cloudAgentShort: 'SoloHost/Hermes Cloud',
    autoSenseOn: 'Interrogation périodique (45 s) : ACTIVE',
    autoSenseOff: 'Interrogation périodique : PAUSE',
    scanNow: 'Scanner maintenant',
    layerEvents: 'Faits & Prévisions',
    layerGlobal: 'Capteurs Mondiaux',
    layerCables: 'Câbles & Détroits',
    layerEncrypted: 'Cartes Chiffrées (π / Q)',
    liveShort: 'Direct',
    pausedShort: 'Pause',
    cloudShort: 'Cloud',
    layersShort: 'Couches',
    forecastTag: 'Prévision',
    languageLabel: 'Langue de l’application',
    closeLabel: 'Fermer',
    scenarioPrefix: 'Trajectoire :',
    drawerSummaryHeading: 'Synthèse Complète du Scénario',
    drawerPlatformLabel: 'Secteur & Plateforme : ',
    drawerThreatLabel: 'Mécanisme de Menace : ',
    drawerStagesHeading: 'Progression Étape par Étape',
    drawerVerifyHeading: 'Vérification, Rang Épistémique & Empreinte SHA-256',
    drawerMainTrigger: 'Facteur Principal : ',
    drawerEarlyWarning: 'Signal d’Alerte Précoce : ',
    drawerDualMapLink: 'Corrélation des 2 Cartes : ',
    drawerEpistemicTierLabel: 'Niveau de Preuve',
    drawerShaButton: 'Certifier Empreinte Cryptographique (SHA-256)',
    drawerFilmHeading: 'Séquence Cinématographique',
    drawerActPrefix: 'Acte',
    drawerBackendSummary: 'Détails Mathématiques & Protocoles (π, ACH, Pi/x402)',
    drawerOpenBackendBtn: 'Ouvrir les Moteurs & le Laboratoire de Décodage',
    drawerDeepenGemini: 'Approfondir ce Scénario avec Gemini',
    drawerUpdatingGemini: 'Mise à jour...',
    drawerPredictGemini: 'Générer la Prochaine Trajectoire via Gemini',
    drawerPredictingGemini: 'Calcul en cours...',
    addModalTitle: 'Injecter un Nouvel Événement dans la Carte des Trajectoires',
    addTitleLabel: 'Titre de l’événement *',
    addTitlePh: 'ex. Blocage des compensations énergétiques régionales',
    addSummaryLabel: 'Description détaillée et mesures initiales *',
    addSummaryPh: 'Décrivez les signaux techniques, financiers ou narratifs...',
    addSectorLabel: 'Secteur concerné',
    addTrackLabel: 'Voie analytique',
    addThreatLabel: 'Mécanisme de menace',
    addPlatformLabel: 'Couche plateforme ciblée',
    addCityLabel: 'Ville',
    addLatLabel: 'Latitude',
    addLngLabel: 'Longitude',
    addSourceLabel: 'Source signalante *',
    addSourcePh: 'ex. Télémétrie RIPE BGP ou communiqué officiel',
    addGradeLabel: 'Fiabilité OSINT de la source',
    addSpofLabel: 'Point de défaillance (SPOF) *',
    addSpofPh: 'ex. Nœud Cloud Core-IAM-EU',
    addParentLabel: 'Événement parent causal',
    addParentIndependent: 'Événement indépendant (nouvelle trajectoire)',
    addLatencyLabel: 'Pic de latence (+ms)',
    addBpsLabel: 'Impact marché (bps)',
    addDisinfoLabel: 'Vélocité désinfo (%)',
    addEpistemicLabel: 'Échelle de preuve (5 niveaux)',
    addQKeyLabel: 'Domaine narratif (Q-KEY)',
    addAiCheckbox: 'Générer une analyse Gemini gratuite (2 cartes + maths π + scène)',
    addCancelBtn: 'Annuler',
    addSubmitBtn: 'Ajouter et Tracer',
    addSubmittingBtn: 'Analyse en cours...',
    geminiErrTitle: 'Impossible de terminer l’analyse Gemini.',
    geminiErrConnect: 'Échec de connexion au serveur d’analyse.',
  },
  id: {
    brandTitle: 'Observatorium Lintasan Strategis',
    dominantLabel: 'Lintasan Dominan:',
    backendBtn: 'Mekanisme Latar',
    addEventBtnShort: 'Tambah',
    addEventBtnTail: 'Berita / Kejadian',
    filterAll: 'Semua',
    filterEvents: 'Berita Terpantau',
    filterForecasts: 'Proyeksi',
    streamStart: 'Putar Aliran',
    streamPause: 'Jeda Aliran',
    nextEvent: 'Kejadian Berikutnya',
    simulateGemini: 'Prediksi Berikutnya (Gemini)',
    simulatingGemini: 'Memprediksi...',
    resetMap: 'Ulang',
    mapHintPre: 'Klik',
    mapHintEvents: 'berita terpantau',
    mapHintOr: 'atau',
    mapHintForecasts: 'proyeksi mendatang',
    mapHintPost: 'atau simpul global/terenkripsi di peta untuk melihat skenario lengkap',
    feedHeader: 'Aliran Global Terpadu, Simpul Terenkripsi & Proyeksi (Klik untuk Detail)',
    feedLegend: 'Garis utuh: kejadian nyata · Putus-putus: proyeksi · Berlian: peta sandi',
    backToMap: 'Kembali ke Peta',
    backendModalTitle: 'Mekanisme Latar, Dekoder π, Agen Cloud & Studio Pi Next',
    tabSemiotics: 'Peta Ganda & Dekoder (π)',
    tabAch: 'Matriks ACH & Skala Bukti',
    tabRiskGen: 'Risiko, Agen & Soroban',
    tabProtocol: 'Gateway Pi / x402 & Pi Next',
    tabCloudAgent: 'SoloHost & Hermes Cloud (Tanpa PC)',
    tabFilm: 'Naskah Film',
    cloudAgentShort: 'SoloHost/Hermes Cloud',
    autoSenseOn: 'Polling Berkala (45 dtk): AKTIF',
    autoSenseOff: 'Polling Berkala: JEDA',
    scanNow: 'Pindai Global Sekarang',
    layerEvents: 'Berita & Proyeksi',
    layerGlobal: 'Sensor Global Langsung',
    layerCables: 'Kabel Laut & Selat',
    layerEncrypted: 'Peta Sandi (π / Q)',
    liveShort: 'Langsung',
    pausedShort: 'Jeda',
    cloudShort: 'Cloud',
    layersShort: 'Lapisan',
    forecastTag: 'Proyeksi',
    languageLabel: 'Bahasa aplikasi',
    closeLabel: 'Tutup',
    scenarioPrefix: 'Jalur:',
    drawerSummaryHeading: 'Ringkasan Lengkap Skenario',
    drawerPlatformLabel: 'Sektor & Platform: ',
    drawerThreatLabel: 'Mekanisme Ancaman: ',
    drawerStagesHeading: 'Perkembangan Skenario Tahap demi Tahap',
    drawerVerifyHeading: 'Verifikasi, Tingkat Epistemik & Hash SHA-256',
    drawerMainTrigger: 'Pemicu Utama: ',
    drawerEarlyWarning: 'Indikator Peringatan Dini: ',
    drawerDualMapLink: 'Korelasi Peta Ganda: ',
    drawerEpistemicTierLabel: 'Tingkat Bukti',
    drawerShaButton: 'Buat Sidik Kriptografi (SHA-256)',
    drawerFilmHeading: 'Adegan Film Tersinkronisasi',
    drawerActPrefix: 'Babak',
    drawerBackendSummary: 'Rincian Matematika & Protokol (π, ACH, Pi/x402)',
    drawerOpenBackendBtn: 'Buka Mekanisme Latar & Lab Dekoder',
    drawerDeepenGemini: 'Perdalam & Perbarui Skenario via Gemini',
    drawerUpdatingGemini: 'Memperbarui...',
    drawerPredictGemini: 'Buat Lintasan Berikutnya via Gemini',
    drawerPredictingGemini: 'Membuat Proyeksi...',
    addModalTitle: 'Masukkan Berita / Kejadian Baru ke Peta Ancaman',
    addTitleLabel: 'Judul Kejadian *',
    addTitlePh: 'cth. Gangguan kliring kontrak energi berjangka regional',
    addSummaryLabel: 'Ringkasan Terperinci & Data Awal *',
    addSummaryPh: 'Jelaskan indikator teknis, finansial, atau naratif...',
    addSectorLabel: 'Sektor Terdampak',
    addTrackLabel: 'Jalur Riset',
    addThreatLabel: 'Mekanisme Ancaman',
    addPlatformLabel: 'Lapisan Platform Target',
    addCityLabel: 'Kota',
    addLatLabel: 'Lintang (Lat)',
    addLngLabel: 'Bujur (Lng)',
    addSourceLabel: 'Sumber Pelapor *',
    addSourcePh: 'cth. Telemetri RIPE BGP atau Rilis Bank Sentral',
    addGradeLabel: 'Peringkat Keandalan Sumber OSINT',
    addSpofLabel: 'Titik Kegagalan / Simpul Terkait (SPOF) *',
    addSpofPh: 'cth. Node Cloud Core-IAM-EU',
    addParentLabel: 'Kejadian Induk Penyebab (Tautan Kausal)',
    addParentIndependent: 'Kejadian Mandiri (Awal Lintasan Baru)',
    addLatencyLabel: 'Lonjakan Latensi (+ms)',
    addBpsLabel: 'Dampak Pasar (bps)',
    addDisinfoLabel: 'Tekanan Disinformasi (%)',
    addEpistemicLabel: 'Klasifikasi Bukti 5 Tingkat',
    addQKeyLabel: 'Domain Narasi (Q-KEY)',
    addAiCheckbox: 'Hasilkan analisis mendalam Gemini gratis (Peta Ganda + π + Adegan Film)',
    addCancelBtn: 'Batal',
    addSubmitBtn: 'Masukkan & Gambar Lintasan',
    addSubmittingBtn: 'Menganalisis...',
    geminiErrTitle: 'Gagal menyelesaikan analisis Gemini. Coba lagi.',
    geminiErrConnect: 'Gagal terhubung ke layanan analisis.',
  },
  vi: {
    brandTitle: 'Đài Quan Sát Quỹ Đạo Chiến Lược',
    dominantLabel: 'Quỹ Đạo Chủ Đạo:',
    backendBtn: 'Cơ Chế Hệ Thống',
    addEventBtnShort: 'Thêm Tin',
    addEventBtnTail: '/ Sự Kiện',
    filterAll: 'Tất Cả',
    filterEvents: 'Tin Đã Ghi Nhận',
    filterForecasts: 'Dự Báo Sắp Tới',
    streamStart: 'Chạy Dòng Tin',
    streamPause: 'Tạm Dừng',
    nextEvent: 'Sự Kiện Tiếp',
    simulateGemini: 'Dự Báo Tiếp (Gemini)',
    simulatingGemini: 'Đang dự báo...',
    resetMap: 'Đặt Lại',
    mapHintPre: 'Nhấn vào bất kỳ',
    mapHintEvents: 'sự kiện thực tế',
    mapHintOr: 'hoặc',
    mapHintForecasts: 'dự báo sắp tới',
    mapHintPost: 'hoặc nút toàn cầu/mã hóa trên bản đồ để xem trọn kịch bản',
    feedHeader: 'Luồng Toàn Cầu Hợp Nhất, Nút Mã Hóa & Dự Báo (Nhấn Để Xem Kịch Bản)',
    feedLegend: 'Đường liền: sự kiện thật · Nét đứt: dự báo · Hình thoi: bản đồ mã hóa',
    backToMap: 'Quay Lại Bản Đồ',
    backendModalTitle: 'Cơ Chế Phân Tích, Phòng Giải Mã π, Tác Nhân Cloud & Pi Next',
    tabSemiotics: 'Bản Đồ Kép & Giải Mã (π)',
    tabAch: 'Ma Trận ACH & Bằng Chứng',
    tabRiskGen: 'Rủi Ro, Tác Nhân & Soroban',
    tabProtocol: 'Cổng Pi / x402 & Pi Next',
    tabCloudAgent: 'SoloHost & Hermes Cloud (Không Cần PC)',
    tabFilm: 'Kịch Bản Phim',
    cloudAgentShort: 'SoloHost/Hermes Cloud',
    autoSenseOn: 'Thăm dò định kỳ (45 giây): BẬT',
    autoSenseOff: 'Thăm dò định kỳ: TẠM DỪNG',
    scanNow: 'Quét Toàn Cầu Ngay',
    layerEvents: 'Tin Tức & Dự Báo',
    layerGlobal: 'Cảm Biến Toàn Cầu',
    layerCables: 'Cáp Biển & Eo Biển',
    layerEncrypted: 'Bản Đồ Mã Hóa (π / Q)',
    liveShort: 'Trực tiếp',
    pausedShort: 'Tạm dừng',
    cloudShort: 'Đám mây',
    layersShort: 'Lớp',
    forecastTag: 'Dự báo',
    languageLabel: 'Ngôn ngữ ứng dụng',
    closeLabel: 'Đóng',
    scenarioPrefix: 'Hướng:',
    drawerSummaryHeading: 'Tóm Tắt Kịch Bản Toàn Diện',
    drawerPlatformLabel: 'Lĩnh Vực & Nền Tảng: ',
    drawerThreatLabel: 'Cơ Chế Đe Dọa: ',
    drawerStagesHeading: 'Diễn Biến Kịch Bản Từng Bước',
    drawerVerifyHeading: 'Xác Minh, Cấp Bằng Chứng & Dấu Vân Tay SHA-256',
    drawerMainTrigger: 'Tác Nhân Chính: ',
    drawerEarlyWarning: 'Chỉ Báo Cảnh Báo Sớm: ',
    drawerDualMapLink: 'Liên Kết Bản Đồ Kép: ',
    drawerEpistemicTierLabel: 'Cấp Bằng Chứng',
    drawerShaButton: 'Tạo Dấu Vân Tay Mật Mã (SHA-256)',
    drawerFilmHeading: 'Phân Cảnh Phim Đồng Bộ',
    drawerActPrefix: 'Hồi',
    drawerBackendSummary: 'Chi Tiết Toán Học & Giao Thức (π, ACH, Pi/x402)',
    drawerOpenBackendBtn: 'Mở Cơ Chế Hệ Thống & Phòng Giải Mã',
    drawerDeepenGemini: 'Phân Tích Sâu & Cập Nhật Qua Gemini',
    drawerUpdatingGemini: 'Đang cập nhật...',
    drawerPredictGemini: 'Tạo Quỹ Đạo Tiếp Theo Qua Gemini',
    drawerPredictingGemini: 'Đang suy luận...',
    addModalTitle: 'Nhập Sự Kiện Mới Vào Bản Đồ Quỹ Đạo & Mối Đe Dọa',
    addTitleLabel: 'Tiêu Đề Sự Kiện *',
    addTitlePh: 'vd. Gián đoạn thanh toán hợp đồng năng lượng khu vực',
    addSummaryLabel: 'Mô Tả Chi Tiết & Dữ Liệu Ban Đầu *',
    addSummaryPh: 'Mô tả các tín hiệu kỹ thuật, tài chính hoặc dư luận...',
    addSectorLabel: 'Lĩnh Vực Ảnh Hưởng',
    addTrackLabel: 'Luồng Nghiên Cứu',
    addThreatLabel: 'Cơ Chế Đe Dọa',
    addPlatformLabel: 'Tầng Nền Tảng Mục Tiêu',
    addCityLabel: 'Thành Phố',
    addLatLabel: 'Vĩ Độ',
    addLngLabel: 'Kinh Độ',
    addSourceLabel: 'Nguồn Báo Cáo *',
    addSourcePh: 'vd. Dữ liệu RIPE BGP hoặc thông cáo Ngân hàng Trung ương',
    addGradeLabel: 'Độ Tin Cậy Nguồn OSINT',
    addSpofLabel: 'Điểm Lỗi Đơn / Nút Liên Kết (SPOF) *',
    addSpofPh: 'vd. Nút Đám Mây Core-IAM-EU',
    addParentLabel: 'Sự Kiện Gốc Gây Ra (Liên Kết Nhân Quả)',
    addParentIndependent: 'Sự Kiện Độc Lập (Khởi Đầu Quỹ Đạo Mới)',
    addLatencyLabel: 'Độ Trễ Tăng (+ms)',
    addBpsLabel: 'Tác Động Thị Trường (bps)',
    addDisinfoLabel: 'Áp Lực Tin Giả (%)',
    addEpistemicLabel: 'Phân Loại Bằng Chứng 5 Cấp',
    addQKeyLabel: 'Miền Tường Thuật (Q-KEY)',
    addAiCheckbox: 'Tạo phân tích chuyên sâu miễn phí qua Gemini (2 bản đồ + π + cảnh phim)',
    addCancelBtn: 'Hủy',
    addSubmitBtn: 'Nhập & Vẽ Quỹ Đạo',
    addSubmittingBtn: 'Đang phân tích...',
    geminiErrTitle: 'Không thể hoàn tất phân tích Gemini. Vui lòng thử lại.',
    geminiErrConnect: 'Không thể kết nối máy chủ phân tích.',
  },
};

export function getScenarioCopy(id: ScenarioId, locale: AppLocale) {
  return SCENARIO_I18N[locale][id];
}

export function getSectorCopy(id: SectorType, locale: AppLocale) {
  return SECTOR_I18N[locale][id];
}

export function getTrackCopy(id: ResearchTrack, locale: AppLocale) {
  return TRACK_I18N[locale][id];
}

export function getThreatCopy(id: ThreatMechanismId, locale: AppLocale) {
  return THREAT_I18N[locale][id];
}

export function getPlatformCopy(id: PlatformLayerId, locale: AppLocale) {
  return PLATFORM_I18N[locale][id];
}

export function getHypothesisCopy(id: HypothesisId, locale: AppLocale) {
  return HYPOTHESIS_I18N[locale][id];
}

export function getReliabilityCopy(grade: ReliabilityGrade, locale: AppLocale) {
  return RELIABILITY_I18N[locale][grade];
}

export function getEpistemicCopy(tier: EpistemicTier, locale: AppLocale) {
  return EPISTEMIC_I18N[locale][tier];
}

export function getQKeyCopy(id: QKeyDomainId, locale: AppLocale) {
  return QKEY_I18N[locale][id];
}

export function getRegionLabel(key: RegionViewKey, locale: AppLocale) {
  return REGION_LABELS_I18N[locale][key];
}

export function getEncryptedNodeCopy(node: EncryptedMapNode, locale: AppLocale) {
  const tr = ENCRYPTED_NODES_I18N[locale][node.id];
  if (!tr) {
    return {
      title: locale === 'ar' ? node.titleAr : node.titleEn,
      city: node.city,
      infraFact: node.verifiedInfraFactAr,
      narrative: node.codedNarrativeReadingAr,
    };
  }
  return tr;
}

export function localizeEvent(ev: LiveEvent, locale: AppLocale): LiveEvent {
  if (locale === 'ar' || ev.aiAnalyzed) return ev;
  const tr = SEED_EVENTS_I18N[locale]?.[ev.id];
  if (!tr) return ev;

  return {
    ...ev,
    title: tr.title,
    summary: tr.summary,
    technicalDetails: tr.technicalDetails,
    coordinates: {
      ...ev.coordinates,
      city: tr.city,
    },
    sourceName: tr.sourceName,
    spofNode: tr.spofNode,
    redTeamCounter: tr.redTeamCounter,
    achEvidence: {
      human_error: { ...ev.achEvidence.human_error, note: tr.achNotes.human_error },
      infra_failure: { ...ev.achEvidence.infra_failure, note: tr.achNotes.infra_failure },
      cyber_attack: { ...ev.achEvidence.cyber_attack, note: tr.achNotes.cyber_attack },
      disinfo_cascade: { ...ev.achEvidence.disinfo_cascade, note: tr.achNotes.disinfo_cascade },
    },
    filmScene: ev.filmScene
      ? {
          ...ev.filmScene,
          title: tr.filmTitle,
          location: tr.filmLocation,
          protagonists: tr.filmProtagonists,
          groundedReality: tr.filmReality,
          dramaticConflict: tr.filmConflict,
          dialogueExcerpt: tr.filmDialogue,
        }
      : undefined,
  };
}

export function localizeMarker(m: SemioticMarker, locale: AppLocale): SemioticMarker {
  if (locale === 'ar') return m;
  const tr = SEMIOTIC_I18N[locale]?.[m.id];
  if (!tr) return m;
  return {
    ...m,
    title: tr.title,
    visualElement: tr.visual,
    institutionalMeaning: tr.meaning,
    macroIndicator: tr.macro,
  };
}

export function localizeGovernanceProposal(
  p: GovernanceProposal,
  locale: AppLocale
): GovernanceProposal {
  if (locale === 'ar') return p;
  const tr = GOVERNANCE_PROPOSALS_I18N[locale]?.[p.id];
  if (!tr) return p;
  return {
    ...p,
    title: tr.title,
    summary: tr.summary,
  };
}
