'use client';

import React, { useEffect, useState } from 'react';
import {
  Server,
  Activity,
  ShieldCheck,
  KeyRound,
  Lock,
  Award,
  FileCode2,
} from 'lucide-react';
import { PIRC_STANDARDS_SEPARATION } from '@/lib/pi-ecosystem-engine';
import {
  HACKATHON_BLUEPRINT_DOCS_I18N,
  PIRC_STANDARDS_I18N,
} from '@/lib/i18n-data';
import { AppLocale } from '@/lib/types';

declare global {
  interface Window {
    Pi?: {
      init: (options: { version: string; sandbox: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: unknown) => void
      ) => Promise<{ accessToken: string; user: { uid?: string; username?: string } }>;
    };
  }
}

interface HealthPayload {
  protocol: string;
  status: string;
  paidExecution: string;
  settlement: string;
  tools?: Array<{ name: string; description: string }>;
  note?: string;
}

interface GatewayStatusPayload {
  service: string;
  status: string;
  sandboxMode: boolean;
  paymentEnabled: boolean;
  paymentFlow: string;
}

interface ProtocolGatewayViewProps {
  locale: AppLocale;
  eventsCount: number;
  signalsCount: number;
}

const PROTOCOL_UI: Record<
  AppLocale,
  {
    mcpTitle: string;
    mcpDesc: string;
    probeLabel: string;
    btnList: string;
    btn402: string;
    btn200: string;
    pirc206Heading: string;
    srvStatus: string;
    circuitBreaker: string;
    piMedian: string;
    oracleSpread: string;
    healthyWord: string;
    readingGateway: string;
    mcpRespHeading: string;
    mcpPlaceholder: string;
    headerDecodedHeading: string;
    sdkSectionTitle: string;
    sdkDesc: string;
    btnAuthMe: string;
    btnU2AFlow: string;
    btnAdsVerify: string;
    btnTamper403: string;
    sdkRespHeading: string;
    sdkPlaceholder: string;
    pirc1Title: string;
    pirc1Sub: string;
    kpiEvents: string;
    kpiSignals: string;
    kpiAttestations: string;
    kpiSettled: string;
    timelineBadge: string;
    timelineText: string;
    pinetTitle: string;
    pinetSteps: { step: string; detail: string }[];
    separationTitle: string;
    docsSectionTitle: string;
    docsSectionSub: string;
  }
> = {
  ar: {
    mcpTitle: 'بوابة أدوات MCP — استكشاف للقراءة فقط',
    mcpDesc:
      'تتيح هذه الواجهة اكتشاف الأدوات وقراءة مخططاتها. تنفيذ الأدوات المدفوع والتسوية غير متاحين حتى دمج وسيط دفع موثوق والتحقق من التسوية.',
    probeLabel: 'معامل الاختبار (phrase → decode_gematria_audit)',
    btnList: '1. استكشاف tools/list (مجاني)',
    btn402: '2. محاولة تنفيذ مدفوع (مرفوضة بأمان)',
    btn200: '3. تنفيذ مدفوع: معطّل حتى اكتمال التكامل',
    pirc206Heading: 'حالة بوابة MCP الفعلية',
    srvStatus: 'حالة الخادم: ',
    circuitBreaker: 'قاطع الدائرة: ',
    piMedian: 'وسيط PI/USD: ',
    oracleSpread: 'فارق الأوراكل: ',
    healthyWord: 'سليم',
    readingGateway: 'جارٍ قراءة حالة البوابة...',
    mcpRespHeading: 'استجابة الخادم الفعلية من /api/x402/mcp',
    mcpPlaceholder: '// اضغط على أحد أزرار الاختبار لتشغيل استدعاء x402 / MCP الفعلي...',
    headerDecodedHeading: 'ترويسة x402 المفككة (PAYMENT-REQUIRED / PAYMENT-RESPONSE)',
    sdkSectionTitle: 'مختبر التحقق الخادمي Pi SDK v2.0 وعقد الأمان (ECONOMIC_ENGINE_API_CONTRACT)',
    sdkDesc:
      'ينفذ استدعاءات حقيقية ضد /api/pi/verify مع التحقق من /v2/me، ودورة U2A الثلاثية بمفاتيح Idempotency، وإعلانات Pi.Ads، وحظر التلاعب بالأسعار من المتصفح (HTTP 403).',
    btnAuthMe: '1. تحقق الهوية (/api/pi/verify · auth_me)',
    btnU2AFlow: '2. دورة الدفع معطّلة حتى إعداد سجل الطلبات',
    btnAdsVerify: '3. مكافآت الإعلانات معطّلة',
    btnTamper403: '4. اختبار العبث متاح ضمن اختبارات CI فقط',
    sdkRespHeading: 'مخرجات عقد التحقق الخادمي (/api/pi/verify)',
    sdkPlaceholder: '// اختر أحد اختبارات Pi SDK v2.0 أو حظر التلاعب لعرض استجابة الخادم...',
    pirc1Title: 'مؤشرات الاستخدام والجاهزية',
    pirc1Sub: 'عدادات الواجهة الحالية؛ لا تمثل اعتمادات أو تسويات مالية أو موافقات خارجية.',
    kpiEvents: 'الأحداث والإحداثيات المرصودة',
    kpiSignals: 'إشارات الاستشعار العالمية',
    kpiAttestations: 'السجلات المعروضة',
    kpiSettled: 'تهيئة مفتاح Pi',
    timelineBadge: 'حالة التكامل: مرحلية',
    timelineText:
      'التصفح العام متاح. وظائف Pi والمدفوعات والوكلاء السحابية تخضع لبوابات إعداد وتحقق مستقلة.',
    pinetTitle: 'تكامل المصادقة الخادمية (Pi SDK v2.0) ونمط الاستكشاف المفتوح عبر بوابة PiNet',
    pinetSteps: [
      {
        step: '1. تصفح مفتوح عبر PiNet',
        detail:
          'جميع الخرائط والأخبار الموثقة ومعاينات الوكلاء متاحة على نطاق .pinet.com من Chrome/Safari دون حجب بهبوط قسري.',
      },
      {
        step: '2. مصادقة وتحقق /me على الخادم',
        detail:
          'عند طلب الاشتراك أو التصويت تُرسل ترويسة Bearer accessToken للخادم للتحقق من api.minepi.com/v2/me ومعالجة المدفوعات المعلقة.',
      },
      {
        step: '3. دورة الدفع الثلاثية U2A',
        detail:
          'onReadyForServerApproval -> توقيع الرائد -> POST /payments/{id}/complete مع التحقق البعدي Read-back ومفاتيح Idempotency.',
      },
      {
        step: '4. البث والوصول الأصلي',
        detail:
          'فحص Pi.nativeFeaturesList() وبصمة SHA-256 لتوثيق الإحداثيات والمشاركة عبر Pi.openShareDialog.',
      },
    ],
    separationTitle:
      'الفصل المعماري الصريح: معايير PiNetwork/PiRC الرسمية مقابل مقترحات Ze0ro99/PiRC المجتمعية',
    docsSectionTitle: 'الوثائق الهندسية ومعايير الأمان المعتمدة (هاكاثون Pi Next)',
    docsSectionSub: 'أربع وثائق مرجعية تغطي الحدود المعمارية والاقتصاد المزدوج وحماية التسعير وخطة التسليم',
  },
  en: {
    mcpTitle: 'Live Protocol Endpoint: MCP Streamable HTTP + x402 V2 Payment Rail',
    mcpDesc:
      'Probe the live /api/x402/mcp endpoint directly: unsigned calls return HTTP 402 with PAYMENT-REQUIRED, while signed vouchers return 200 OK + PAYMENT-RESPONSE.',
    probeLabel: 'Probe Parameter (phrase → decode_gematria_audit)',
    btnList: '1. Discover tools/list (Free)',
    btn402: '2. Unpaid Call (HTTP 402)',
    btn200: '3. Signed PAYMENT-SIGNATURE (200 OK)',
    pirc206Heading: 'Live MCP Gateway Status',
    srvStatus: 'Server State: ',
    circuitBreaker: 'Circuit Breaker: ',
    piMedian: 'PI/USD Median: ',
    oracleSpread: 'Oracle Spread: ',
    healthyWord: 'Healthy',
    readingGateway: 'Reading gateway state...',
    mcpRespHeading: 'Live Server Response from /api/x402/mcp',
    mcpPlaceholder: '// Click any probe button above to execute a live x402 / MCP request...',
    headerDecodedHeading: 'Decoded x402 Header (PAYMENT-REQUIRED / PAYMENT-RESPONSE)',
    sdkSectionTitle: 'Pi SDK v2.0 & ECONOMIC_ENGINE_API_CONTRACT Verifier',
    sdkDesc:
      'Calls live /api/pi/verify to test server /v2/me authentication, 3-step U2A approve→complete with Idempotency Keys, Pi.Ads verification, and HTTP 403 client price tamper rejection.',
    btnAuthMe: '1. Verify Auth (/api/pi/verify · auth_me)',
    btnU2AFlow: '2. Payment flow disabled until order ledger is configured',
    btnAdsVerify: '3. Rewarded ads disabled',
    btnTamper403: '4. Price-tamper test runs in CI only',
    sdkRespHeading: 'Server Contract Verification Output (/api/pi/verify)',
    sdkPlaceholder: '// Trigger an action above to inspect server-authoritative responses...',
    pirc1Title: 'Usage and Integration Readiness',
    pirc1Sub: 'These are interface counters only, not attestations, financial settlements, or external approvals.',
    kpiEvents: 'Verified Map Events',
    kpiSignals: 'Global Sensor Signals',
    kpiAttestations: 'Displayed Records',
    kpiSettled: 'Pi Key Configuration',
    timelineBadge: 'Integration status: staged',
    timelineText:
      'Public browsing is available. Pi payments and cloud-agent actions remain gated on configuration and independent verification.',
    pinetTitle: 'Server-Authoritative Pi SDK v2.0 Flow & PiNet Open Exploration',
    pinetSteps: [
      {
        step: '1. Open PiNet Guest Access',
        detail:
          'All live maps, OSINT telemetry, and agent previews load immediately on .pinet.com across Chrome/Safari without a hard login wall.',
      },
      {
        step: '2. Server /v2/me Validation',
        detail:
          'Subscription upgrades and KYC voting send Bearer accessToken to /api/pi/verify so the server validates /v2/me and incomplete payments.',
      },
      {
        step: '3. 3-Step U2A Settlement',
        detail:
          'onReadyForServerApproval -> Pioneer signs -> payment_complete with Idempotency-Key & server read-back confirmation.',
      },
      {
        step: '4. Native Features & Digests',
        detail:
          'Checks Pi.nativeFeaturesList() (inline_media, request_permission) and produces SHA-256 coordinate proofs for sharing.',
      },
    ],
    separationTitle:
      'Explicit Architectural Separation: Official PiNetwork/PiRC vs Community Ze0ro99/PiRC',
    docsSectionTitle: 'Pi Next Engineering & Safety Reference Documents',
    docsSectionSub: 'Four core blueprints covering ecosystem boundaries, 0.0001 Pi economics, server contract hardening, and submission readiness',
  },
  fr: {
    mcpTitle: 'Passerelle Directe : MCP Streamable HTTP + Paiement x402 V2',
    mcpDesc:
      'Interrogez directement /api/x402/mcp : sans signature le serveur répond HTTP 402 (PAYMENT-REQUIRED), et avec signature il retourne 200 OK + PAYMENT-RESPONSE.',
    probeLabel: 'Paramètre de test (phrase → decode_gematria_audit)',
    btnList: '1. Explorer tools/list (Gratuit)',
    btn402: '2. Appel non payé (HTTP 402)',
    btn200: '3. Exécution payante désactivée',
    pirc206Heading: 'État réel de la passerelle MCP',
    srvStatus: 'État Serveur : ',
    circuitBreaker: 'Disjoncteur : ',
    piMedian: 'Médiane PI/USD : ',
    oracleSpread: 'Écart Oracle : ',
    healthyWord: 'Sain',
    readingGateway: 'Lecture de la passerelle...',
    mcpRespHeading: 'Réponse Serveur Directe de /api/x402/mcp',
    mcpPlaceholder: '// Cliquez sur un bouton ci-dessus pour exécuter un appel x402 / MCP...',
    headerDecodedHeading: 'En-tête x402 Décodé (PAYMENT-REQUIRED / PAYMENT-RESPONSE)',
    sdkSectionTitle: 'Vérificateur Pi SDK v2.0 & Contrat ECONOMIC_ENGINE_API_CONTRACT',
    sdkDesc:
      'Appelle /api/pi/verify pour tester /v2/me, le cycle U2A en 3 étapes avec Idempotency-Key, Pi.Ads et le rejet HTTP 403 des prix falsifiés côté navigateur.',
    btnAuthMe: '1. Vérifier Auth (/api/pi/verify · auth_me)',
    btnU2AFlow: '2. Paiement désactivé jusqu’à configuration du registre',
    btnAdsVerify: '3. Publicités récompensées désactivées',
    btnTamper403: '4. Test anti-manipulation réservé à CI',
    sdkRespHeading: 'Réponse Serveur Autoritaire (/api/pi/verify)',
    sdkPlaceholder: '// Lancez une vérification ci-dessus pour inspecter la réponse...',
    pirc1Title: 'Compteurs d’Utilité Réelle PiRC1 & Conformité Pi Next',
    pirc1Sub: 'Métriques d’activité vérifiées pour l’éligibilité Launchpad / DEX T1 2027',
    kpiEvents: 'Faits Cartographiés',
    kpiSignals: 'Signaux Mondiaux',
    kpiAttestations: 'Empreintes SHA-256',
    kpiSettled: 'Règlements Confirmés',
    timelineBadge: 'Lancement : 19 nov. 2026 → Clôture : 5 janv. 2027 (23:59 PST)',
    timelineText:
      'Accès invité ouvert sur .pinet.com sans écran de blocage, avec orchestration cloud SoloHost & Hermes sans PC.',
    pinetTitle: 'Flux Serveur Pi SDK v2.0 & Exploration Ouverte PiNet',
    pinetSteps: [
      {
        step: '1. Accès Invité PiNet',
        detail:
          'Toutes les cartes et prévisions sont accessibles sur .pinet.com sans mur de connexion forcé.',
      },
      {
        step: '2. Validation Serveur /v2/me',
        detail:
          'Les abonnements et votes KYC envoient Bearer accessToken au serveur pour validation Pi API.',
      },
      {
        step: '3. Règlement U2A en 3 Étapes',
        detail:
          'Approbation serveur -> Signature Pionnier -> Complétion avec Idempotency-Key et relecture.',
      },
      {
        step: '4. Fonctions Natives & Preuves',
        detail:
          'Détection Pi.nativeFeaturesList() et certification SHA-256 pour le partage sécurisé.',
      },
    ],
    separationTitle:
      'Séparation Architecturale : PiNetwork/PiRC Officiel vs Propositions Ze0ro99/PiRC',
    docsSectionTitle: 'Documents d’Architecture & Sécurité Hackathon Pi Next',
    docsSectionSub: 'Quatre références détaillant frontières, économie 0,0001 Pi, garde-fous serveur et livraison',
  },
  id: {
    mcpTitle: 'Endpoint Protokol Langsung: MCP Streamable HTTP + Rel Pembayaran x402 V2',
    mcpDesc:
      'Uji langsung /api/x402/mcp: tanpa tanda tangan server membalas HTTP 402 (PAYMENT-REQUIRED), sedangkan dengan tanda tangan membalas 200 OK + PAYMENT-RESPONSE.',
    probeLabel: 'Parameter Uji (phrase → decode_gematria_audit)',
    btnList: '1. Cek tools/list (Gratis)',
    btn402: '2. Panggilan Belum Dibayar (HTTP 402)',
    btn200: '3. Tanda Tangan PAYMENT-SIGNATURE (200 OK)',
    pirc206Heading: 'Status Gateway MCP',
    srvStatus: 'Status Server: ',
    circuitBreaker: 'Pemutus Sirkuit: ',
    piMedian: 'Median PI/USD: ',
    oracleSpread: 'Selisih Oracle: ',
    healthyWord: 'Sehat',
    readingGateway: 'Membaca status gateway...',
    mcpRespHeading: 'Respons Server Langsung dari /api/x402/mcp',
    mcpPlaceholder: '// Tekan salah satu tombol uji di atas untuk memanggil x402 / MCP...',
    headerDecodedHeading: 'Header x402 Terdekode (PAYMENT-REQUIRED / PAYMENT-RESPONSE)',
    sdkSectionTitle: 'Penguji Pi SDK v2.0 & Kontrak Keamanan (ECONOMIC_ENGINE_API_CONTRACT)',
    sdkDesc:
      'Menguji /api/pi/verify langsung untuk validasi /v2/me, alur 3-langkah U2A dengan Idempotency-Key, Pi.Ads, dan penolakan HTTP 403 atas manipulasi harga browser.',
    btnAuthMe: '1. Verifikasi Auth (/api/pi/verify · auth_me)',
    btnU2AFlow: '2. Alur Lengkap U2A (0.1 Pi Setuju → Selesai)',
    btnAdsVerify: '3. Rewarded ads dinonaktifkan',
    btnTamper403: '4. Uji Tolak Manipulasi Harga (HTTP 403)',
    sdkRespHeading: 'Output Verifikasi Kontrak Server (/api/pi/verify)',
    sdkPlaceholder: '// Pilih aksi uji di atas untuk melihat respons otoritatif server...',
    pirc1Title: 'Penghitung Utilitas Nyata PiRC1 & Kepatuhan Pi Next',
    pirc1Sub: 'Metrik aktivitas terverifikasi menuju kriteria Launchpad / DEX Q1 2027',
    kpiEvents: 'Kejadian Peta Terverifikasi',
    kpiSignals: 'Sinyal Sensor Global',
    kpiAttestations: 'Bukti Hash SHA-256',
    kpiSettled: 'Pembayaran Terkonfirmasi',
    timelineBadge: 'Mulai: 19 Nov 2026 → Batas Akhir: 5 Jan 2027 (23:59 PST)',
    timelineText:
      'Eksplorasi tamu terbuka di .pinet.com tanpa kunci login paksa, lengkap dengan orkestrasi cloud SoloHost & Hermes dari ponsel.',
    pinetTitle: 'Alur Server Pi SDK v2.0 & Eksplorasi Terbuka PiNet',
    pinetSteps: [
      {
        step: '1. Akses Tamu Terbuka PiNet',
        detail:
          'Semua peta dan pratinjau agen langsung terbuka di .pinet.com lewat Chrome/Safari tanpa layar login pemblokir.',
      },
      {
        step: '2. Validasi Server /v2/me',
        detail:
          'Permintaan langganan dan voting KYC mengirim Bearer accessToken ke server untuk verifikasi api.minepi.com/v2/me.',
      },
      {
        step: '3. Siklus U2A 3-Langkah',
        detail:
          'Persetujuan server -> tanda tangan Pioneer -> penyelesaian dengan Idempotency-Key dan pemeriksaan read-back.',
      },
      {
        step: '4. Fitur Native & Sidik Kriptografi',
        detail:
          'Memeriksa Pi.nativeFeaturesList() dan menyertakan hash SHA-256 saat berbagi lewat Pi.openShareDialog.',
      },
    ],
    separationTitle:
      'Pemisahan Arsitektur Tegas: Standar Resmi PiNetwork/PiRC vs Usulan Komunitas Ze0ro99/PiRC',
    docsSectionTitle: '4 Dokumen Referensi Teknis & Keamanan Hackathon Pi Next',
    docsSectionSub: 'Cetak biru pemisahan standar, ekonomi 0.0001 Pi, kontrak keamanan server, dan jadwal rilis',
  },
  vi: {
    mcpTitle: 'Cổng Giao Thức Trực Tiếp: MCP Streamable HTTP + Thanh Toán x402 V2',
    mcpDesc:
      'Kiểm tra trực tiếp /api/x402/mcp: gọi không chữ ký trả về HTTP 402 (PAYMENT-REQUIRED), có chữ ký trả về 200 OK kèm biên nhận PAYMENT-RESPONSE.',
    probeLabel: 'Tham Số Kiểm Thử (phrase → decode_gematria_audit)',
    btnList: '1. Khám Phá tools/list (Miễn Phí)',
    btn402: '2. Truy Vấn Chưa Trả Phí (HTTP 402)',
    btn200: '3. Thực thi trả phí đã tắt',
    pirc206Heading: 'Trạng thái cổng MCP',
    srvStatus: 'Trạng Thái Máy Chủ: ',
    circuitBreaker: 'Cầu Dao Ngắt Mạch: ',
    piMedian: 'Trung Vị PI/USD: ',
    oracleSpread: 'Biên Độ Oracle: ',
    healthyWord: 'Ổn Định',
    readingGateway: 'Đang đọc trạng thái cổng...',
    mcpRespHeading: 'Phản Hồi Thực Tế Từ /api/x402/mcp',
    mcpPlaceholder: '// Nhấn một nút kiểm tra ở trên để gọi trực tiếp x402 / MCP...',
    headerDecodedHeading: 'Header x402 Đã Giải Mã (PAYMENT-REQUIRED / PAYMENT-RESPONSE)',
    sdkSectionTitle: 'Trình Xác Thực Pi SDK v2.0 & Hợp Đồng ECONOMIC_ENGINE_API_CONTRACT',
    sdkDesc:
      'Gọi trực tiếp /api/pi/verify để kiểm tra xác thực /v2/me, quy trình U2A 3 bước kèm Idempotency-Key, Pi.Ads và chặn HTTP 403 khi trình duyệt sửa giá.',
    btnAuthMe: '1. Xác Thực /v2/me (/api/pi/verify)',
    btnU2AFlow: '2. Chu Trình U2A (0,1 Pi Duyệt → Hoàn Tất)',
    btnAdsVerify: '3. Quảng cáo thưởng đã tắt',
    btnTamper403: '4. Thử Chặn Sửa Giá Trình Duyệt (HTTP 403)',
    sdkRespHeading: 'Kết Quả Kiểm Tra Máy Chủ (/api/pi/verify)',
    sdkPlaceholder: '// Nhấn một nút ở trên để xem phản hồi thực của máy chủ...',
    pirc1Title: 'Bộ Đếm Tiện Ích Thực PiRC1 & Lộ Trình Hackathon Pi Next',
    pirc1Sub: 'Chỉ số hoạt động thực đã xác minh hướng tới chuẩn Launchpad / DEX Q1 2027',
    kpiEvents: 'Sự Kiện Bản Đồ Xác Minh',
    kpiSignals: 'Tín Hiệu Cảm Biến Toàn Cầu',
    kpiAttestations: 'Chữ Ký Băm SHA-256',
    kpiSettled: 'Giao Dịch Đã Tất Toán',
    timelineBadge: 'Khởi động: 19/11/2026 → Hạn chót: 05/01/2027 (23:59 PST)',
    timelineText:
      'Cho phép khách khám phá mở hoàn toàn trên .pinet.com không khóa đăng nhập, kết hợp chạy SoloHost & Hermes đám mây từ điện thoại.',
    pinetTitle: 'Tích Hợp Máy Chủ Pi SDK v2.0 & Mô Hình Khám Phá Mở PiNet',
    pinetSteps: [
      {
        step: '1. Truy Cập Mở PiNet',
        detail:
          'Mọi bản đồ và tác nhân đều mở sẵn trên .pinet.com qua Chrome/Safari không ép đăng nhập trước.',
      },
      {
        step: '2. Xác Minh /v2/me Trên Máy Chủ',
        detail:
          'Nâng cấp gói hoặc bỏ phiếu KYC gửi Bearer accessToken tới máy chủ để kiểm chứng với api.minepi.com/v2/me.',
      },
      {
        step: '3. Thanh Toán U2A 3 Bước',
        detail:
          'Duyệt máy chủ -> Pioneer ký ví -> hoàn tất giao dịch kèm Idempotency-Key và đọc lại xác nhận.',
      },
      {
        step: '4. Tính Năng Gốc & Băm SHA-256',
        detail:
          'Kiểm tra Pi.nativeFeaturesList() và đính kèm mã băm SHA-256 khi chia sẻ qua Pi.openShareDialog.',
      },
    ],
    separationTitle:
      'Phân Tách Kiến Trúc Rõ Ràng: Chuẩn Chính Thức PiNetwork/PiRC Với Đề Xuất Ze0ro99/PiRC',
    docsSectionTitle: '4 Tài Liệu Tham Chiếu Kỹ Thuật & An Toàn Hackathon Pi Next',
    docsSectionSub: 'Ranh giới tiêu chuẩn, kinh tế gói 0,0001 Pi, bảo mật hợp đồng máy chủ và kế hoạch bàn giao',
  },
};

export default function ProtocolGatewayView({
  locale,
  eventsCount,
  signalsCount,
}: ProtocolGatewayViewProps) {
  const ui = PROTOCOL_UI[locale];
  const pircI18n = PIRC_STANDARDS_I18N[locale];
  const blueprintDocs = HACKATHON_BLUEPRINT_DOCS_I18N[locale];

  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [piGatewayInfo, setPiGatewayInfo] = useState<GatewayStatusPayload | null>(null);
  const [probePhrase, setProbePhrase] = useState('PI NETWORK');
  const [lastHttpStatus, setLastHttpStatus] = useState<number | null>(null);
  const [lastResponseJson, setLastResponseJson] = useState<string>('');
  const [lastHeaderDecoded, setLastHeaderDecoded] = useState<string>('');
  const [loadingCall, setLoadingCall] = useState(false);

  const [sdkHttpStatus, setSdkHttpStatus] = useState<number | null>(null);
  const [sdkResponseJson, setSdkResponseJson] = useState<string>('');
  const [loadingSdkCall, setLoadingSdkCall] = useState(false);

  const refreshGateways = async () => {
    try {
      const [mcpRes, piRes] = await Promise.all([
        fetch('/api/x402/mcp'),
        fetch('/api/pi/verify'),
      ]);
      const [mcpData, piData] = await Promise.all([mcpRes.json(), piRes.json()]);
      setHealth(mcpData);
      setPiGatewayInfo(piData);
    } catch {
      // ignore cleanly
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mcpRes, piRes] = await Promise.all([
          fetch('/api/x402/mcp'),
          fetch('/api/pi/verify'),
        ]);
        const [mcpData, piData] = await Promise.all([mcpRes.json(), piRes.json()]);
        if (!cancelled) {
          setHealth(mcpData);
          setPiGatewayInfo(piData);
        }
      } catch {
        // ignore cleanly
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const decodeHeaderB64 = (val: string | null) => {
    if (!val) return '';
    try {
      return JSON.stringify(JSON.parse(atob(val)), null, 2);
    } catch {
      return val;
    }
  };

  const runMcpProbe = async (mode: 'list' | 'unpaid_402' | 'signed_200') => {
    setLoadingCall(true);
    try {
      const body =
        mode === 'list'
          ? { jsonrpc: '2.0', id: 1, method: 'tools/list' }
          : {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: 'decode_gematria_audit',
                arguments: { phrase: probePhrase, dayOffset: 17 },
              },
            };

      // The paid-execution probe deliberately sends no fabricated signature.
      // The server must reject execution until a real facilitator is configured.
      const res = await fetch('/api/x402/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setLastHttpStatus(res.status);
      const json = await res.json();
      setLastHeaderDecoded('');
      setLastResponseJson(JSON.stringify(json, null, 2));
      void refreshGateways();
    } catch {
      setLastResponseJson(JSON.stringify({ status: 'network_error' }, null, 2));
    } finally {
      setLoadingCall(false);
    }
  };

  const runPiVerifyProbe = async (
    mode: 'auth_me' | 'u2a_cycle' | 'rewarded_ad' | 'tamper_403'
  ) => {
    setLoadingSdkCall(true);
    try {
      if (mode !== 'auth_me') {
        setSdkHttpStatus(503);
        setSdkResponseJson(
          JSON.stringify(
            {
              status: 'not_ready',
              error:
                'This action is intentionally unavailable. Paid features require a durable order ledger; rewarded ads require a trusted provider callback; price-tamper tests must use automated security tests.',
            },
            null,
            2
          )
        );
        return;
      }

      if (!window.Pi) {
        setSdkHttpStatus(503);
        setSdkResponseJson(
          JSON.stringify(
            {
              status: 'pi_sdk_unavailable',
              error: 'Open this app inside Pi Browser after the official Pi SDK has loaded.',
            },
            null,
            2
          )
        );
        return;
      }

      window.Pi.init({
        version: '2.0',
        sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX_MODE !== 'false',
      });
      const auth = await window.Pi.authenticate(
        ['username', 'payments'],
        (payment) => {
          setSdkResponseJson(
            JSON.stringify(
              {
                status: 'incomplete_payment_found',
                note: 'An interrupted Pi payment was detected. It must be recovered against its server payment record before any entitlement is granted.',
                payment,
              },
              null,
              2
            )
          );
        }
      );

      const res = await fetch('/api/pi/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.accessToken,
        },
        body: JSON.stringify({ action: 'auth_me' }),
      });
      const data = await res.json();
      setSdkHttpStatus(res.status);
      setSdkResponseJson(
        JSON.stringify(
          {
            piSdkUser: {
              username: auth.user?.username ?? null,
              uid: auth.user?.uid ?? null,
            },
            serverVerification: data,
          },
          null,
          2
        )
      );
      void refreshGateways();
    } catch (error) {
      setSdkHttpStatus(502);
      setSdkResponseJson(
        JSON.stringify(
          {
            status: 'pi_auth_failed',
            error: error instanceof Error ? error.message : 'Pi authentication failed.',
          },
          null,
          2
        )
      );
    } finally {
      setLoadingSdkCall(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Live Interactive x402 V2 / MCP Endpoint Inspector */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2856] pb-3.5">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-[#C084FC]" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">{ui.mcpTitle}</h3>
          </div>
          <span className="font-latin-math text-xs text-[#4ADE80]">
            POST /api/x402/mcp · Read-only discovery
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-3 text-xs">
            <p className="leading-relaxed text-[#CBD5E1]">{ui.mcpDesc}</p>

            <div>
              <label htmlFor="x402-phrase" className="block font-semibold text-white">
                {ui.probeLabel}
              </label>
              <input
                id="x402-phrase"
                type="text"
                dir="ltr"
                value={probePhrase}
                onChange={(e) => setProbePhrase(e.target.value)}
                className="mt-1 w-full rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 font-latin-math text-xs text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loadingCall}
                onClick={() => void runMcpProbe('list')}
                className="rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 font-semibold text-[#E0E7FF] hover:border-[#7C3AED]"
              >
                {ui.btnList}
              </button>
              <button
                type="button"
                disabled={loadingCall}
                onClick={() => void runMcpProbe('unpaid_402')}
                className="rounded border border-[#E11D48] bg-[#2D0A18] px-3 py-2 font-semibold text-[#FDA4AF] hover:bg-[#E11D48]/30"
              >
                {ui.btn402}
              </button>
              <button
                type="button"
                disabled={loadingCall}
                onClick={() => void runMcpProbe('signed_200')}
                className="rounded bg-[#7C3AED] px-3.5 py-2 font-semibold text-white hover:bg-[#6D28D9]"
              >
                {ui.btn200}
              </button>
            </div>

            {/* PiRC-206 Live Operational Monitor */}
            <div className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Activity className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
                <span>{ui.pirc206Heading}</span>
              </div>
              {health ? (
                <div className="space-y-1 text-[11px] tabular-nums">
                  <div className="text-white">{health.protocol}</div>
                  <div className="text-[#A5B4FC]">
                    Status: <span className="font-latin-math text-[#FBBF24]">{health.status}</span>
                  </div>
                  <div className="text-[#A5B4FC]">
                    Paid execution: <span className="font-latin-math text-white">{health.paidExecution}</span>
                  </div>
                  <div className="text-[#A5B4FC]">
                    Settlement: <span className="font-latin-math text-white">{health.settlement}</span>
                  </div>
                  <div className="text-[#A5B4FC]">Discoverable tools: {health.tools?.length ?? 0}</div>
                </div>
              ) : (
                <div className="text-[11px] text-[#A5B4FC]">{ui.readingGateway}</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="rounded border border-[#2B2856] bg-[#0C0D16] p-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#1E1B4B] pb-2">
                <span className="font-semibold text-white">{ui.mcpRespHeading}</span>
                {lastHttpStatus !== null && (
                  <span
                    className={`font-latin-math font-bold ${
                      lastHttpStatus === 200
                        ? 'text-[#4ADE80]'
                        : lastHttpStatus === 402
                        ? 'text-[#FBBF24]'
                        : 'text-[#FDA4AF]'
                    }`}
                  >
                    HTTP {lastHttpStatus}
                  </span>
                )}
              </div>
              <pre
                dir="ltr"
                className="mt-2 max-h-[200px] overflow-auto font-latin-math text-[11px] text-[#E0E7FF]"
              >
                {lastResponseJson || ui.mcpPlaceholder}
              </pre>
            </div>

            {lastHeaderDecoded && (
              <div className="rounded border border-[#312E81] bg-[#121329] p-3 text-xs">
                <div className="font-semibold text-[#C084FC]">
                  {ui.headerDecodedHeading}
                </div>
                <pre
                  dir="ltr"
                  className="mt-1.5 max-h-[140px] overflow-auto font-latin-math text-[11px] text-[#CBD5E1]"
                >
                  {lastHeaderDecoded}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Interactive Pi SDK v2.0 & ECONOMIC_ENGINE_API_CONTRACT Verifier */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2856] pb-3.5">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#E11D48]" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">{ui.sdkSectionTitle}</h3>
          </div>
          <span className="font-latin-math text-xs text-[#C084FC]">
            POST /api/pi/verify · Server verification
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-3 text-xs">
            <p className="leading-relaxed text-[#CBD5E1]">{ui.sdkDesc}</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                disabled={loadingSdkCall}
                onClick={() => void runPiVerifyProbe('auth_me')}
                className="rounded border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-start font-semibold text-[#E0E7FF] hover:border-[#7C3AED]"
              >
                {ui.btnAuthMe}
              </button>
              <button
                type="button"
                disabled={true}
                onClick={() => void runPiVerifyProbe('u2a_cycle')}
                className="rounded border border-[#7C3AED] bg-[#2E1065] px-3 py-2 text-start font-semibold text-white hover:bg-[#4C1D95]"
              >
                {ui.btnU2AFlow}
              </button>
              <button
                type="button"
                disabled={true}
                onClick={() => void runPiVerifyProbe('rewarded_ad')}
                className="rounded border border-[#16A34A]/60 bg-[#052E16] px-3 py-2 text-start font-semibold text-[#4ADE80] hover:bg-[#16A34A]/20"
              >
                {ui.btnAdsVerify}
              </button>
              <button
                type="button"
                disabled={true}
                onClick={() => void runPiVerifyProbe('tamper_403')}
                className="rounded border border-[#E11D48] bg-[#2D0A18] px-3 py-2 text-start font-semibold text-[#FDA4AF] hover:bg-[#E11D48]/30"
              >
                {ui.btnTamper403}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded border border-[#2B2856] bg-[#0C0D16] p-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#1E1B4B] pb-2">
              <span className="font-semibold text-white">{ui.sdkRespHeading}</span>
              {sdkHttpStatus !== null && (
                <span
                  className={`font-latin-math font-bold ${
                    sdkHttpStatus === 200
                      ? 'text-[#4ADE80]'
                      : sdkHttpStatus === 403
                      ? 'text-[#FDA4AF]'
                      : 'text-[#FBBF24]'
                  }`}
                >
                  HTTP {sdkHttpStatus}
                </span>
              )}
            </div>
            <pre
              dir="ltr"
              className="mt-2 max-h-[220px] overflow-auto font-latin-math text-[11px] text-[#E0E7FF]"
            >
              {sdkResponseJson || ui.sdkPlaceholder}
            </pre>
          </div>
        </div>
      </section>

      {/* 3. PiRC1 Verified Utility Counters & Pi Next Hackathon Timeline */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2856] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#16A34A]" aria-hidden="true" />
              <h3 className="text-base font-bold text-white">{ui.pirc1Title}</h3>
            </div>
            <p className="mt-1 text-xs text-[#A5B4FC]">{ui.pirc1Sub}</p>
          </div>
          <span className="rounded border border-[#7C3AED] bg-[#2E1065]/60 px-2.5 py-1 text-[11px] font-semibold text-[#E0E7FF]">
            {ui.timelineBadge}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 text-xs tabular-nums">
          <div className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5">
            <div className="text-[#A5B4FC]">{ui.kpiEvents}</div>
            <div className="mt-1 font-latin-math text-xl font-bold text-white">
              {eventsCount}
            </div>
          </div>
          <div className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5">
            <div className="text-[#A5B4FC]">{ui.kpiSignals}</div>
            <div className="mt-1 font-latin-math text-xl font-bold text-[#C084FC]">
              {signalsCount}
            </div>
          </div>
          <div className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5">
            <div className="text-[#A5B4FC]">{ui.kpiAttestations}</div>
            <div className="mt-1 font-latin-math text-xl font-bold text-[#4ADE80]">
              {eventsCount + signalsCount}
            </div>
          </div>
          <div className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5">
            <div className="text-[#A5B4FC]">{ui.kpiSettled}</div>
            <div className="mt-1 font-latin-math text-xl font-bold text-[#FDA4AF]">
              {piGatewayInfo?.paymentEnabled ? 'Configured' : 'Not configured'}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#CBD5E1]">{ui.timelineText}</p>
      </section>

      {/* 4. Pi SDK v2.0 Auth + U2A + PiNet Open Exploration */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex items-center gap-2 border-b border-[#2B2856] pb-3">
          <KeyRound className="h-5 w-5 text-[#E11D48]" aria-hidden="true" />
          <h3 className="text-base font-bold text-white">{ui.pinetTitle}</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4 text-xs">
          {ui.pinetSteps.map((item) => (
            <div
              key={item.step}
              className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5 space-y-1.5"
            >
              <div className="font-bold text-white">{item.step}</div>
              <p className="leading-relaxed text-[#CBD5E1]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Clear Separation: Official PiNetwork/PiRC vs Community Ze0ro99/PiRC */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex items-center gap-2 border-b border-[#2B2856] pb-3">
          <ShieldCheck className="h-5 w-5 text-[#16A34A]" aria-hidden="true" />
          <h3 className="text-base font-bold text-white">{ui.separationTitle}</h3>
        </div>
        <div className="mt-4 space-y-2.5">
          {PIRC_STANDARDS_SEPARATION.map((item) => {
            const tr = pircI18n?.[item.id];
            return (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5 text-xs md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-latin-math font-bold text-white">
                      {item.name}
                    </span>
                    <span aria-hidden="true" className="text-[#6366F1]">
                      ·
                    </span>
                    <span
                      className={`font-semibold ${
                        item.classification === 'official'
                          ? 'text-[#4ADE80]'
                          : 'text-[#FBBF24]'
                      }`}
                    >
                      {tr ? tr.sourceRepo : item.sourceRepo}
                    </span>
                  </div>
                  <p className="text-[#CBD5E1]">
                    {tr ? tr.role : item.roleInAppAr}
                  </p>
                </div>
                <div className="shrink-0 text-[11px] text-[#A5B4FC]">
                  {tr ? tr.status : item.statusAr}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. 4 Engineering & Safety Reference Documents */}
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="border-b border-[#2B2856] pb-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-[#C084FC]" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">{ui.docsSectionTitle}</h3>
          </div>
          <p className="mt-1 text-xs text-[#A5B4FC]">{ui.docsSectionSub}</p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {blueprintDocs.map((doc) => (
            <article
              key={doc.id}
              className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-4 text-xs space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-latin-math font-bold text-[#C084FC]">
                  {doc.code}
                </span>
                <span className="font-bold text-white">{doc.title}</span>
              </div>
              <p className="leading-relaxed text-[#CBD5E1]">{doc.summary}</p>
              <ul className="space-y-1 border-t border-[#1E1B4B] pt-2 text-[11px] text-[#A5B4FC]">
                {doc.highlights.map((h, i) => (
                  <li key={i}>• {h}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
