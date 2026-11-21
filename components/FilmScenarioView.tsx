'use client';

import React, { useState } from 'react';
import { Film, Copy, Check, Download } from 'lucide-react';
import { AppLocale, FilmSceneBeat, LiveEvent, ScenarioProbabilities } from '@/lib/types';
import {
  SCENARIO_META,
  generateFilmBeatFromEvent,
} from '@/lib/trajectory-engine';
import { getScenarioCopy } from '@/lib/i18n';

interface FilmScenarioViewProps {
  locale: AppLocale;
  events: LiveEvent[];
  probabilities: ScenarioProbabilities;
  onSelectEventOnMap: (eventId: string) => void;
}

const FILM_I18N: Record<
  AppLocale,
  {
    kicker: string;
    heading: string;
    subtitlePre: string;
    copyBtn: string;
    copiedBtn: string;
    exportBtn: string;
    allActs: string;
    act1: string;
    act2: string;
    act3: string;
    endingPrefix: string;
    actWord: string;
    sceneWord: string;
    trackOnMap: string;
    protagonistsLabel: string;
    sceneTrajectoryLabel: string;
    realityHeading: string;
    conflictHeading: string;
    mdHeader: string;
    mdDominant: string;
    mdResilience: string;
    mdLocation: string;
    mdCharacters: string;
    mdReality: string;
    mdConflict: string;
  }
> = {
  ar: {
    kicker: 'الإسقاط الدرامي والتشويقي المتزامن مع الخريطتين والمعادلات',
    heading: 'سيناريو الفيلم العالمي: «خط الصدع الرقمي» (Digital Faultline)',
    subtitlePre:
      'معالجة إثارة وغموض واقعية تُبنى لحظياً من تدفق الأحداث وتحليل الخريطتين؛ كل مسار جديد على الخريطة يولّد مشهداً يعكس الاتجاه المرجّح حالياً',
    copyBtn: 'نسخ السيناريو',
    copiedBtn: 'تم النسخ',
    exportBtn: 'تصدير Markdown',
    allActs: 'جميع الفصول',
    act1: 'الفصل الأول: الشرارة الصامتة',
    act2: 'الفصل الثاني: العدوى والتضليل',
    act3: 'الفصل الثالث: مفترق الاستقرار',
    endingPrefix: 'خاتمة الفصل الثالث تتشكل وفق المسار:',
    actWord: 'الفصل',
    sceneWord: 'المشهد',
    trackOnMap: 'تتبع الحدث على الخريطة',
    protagonistsLabel: 'الشخصيات المحورية:',
    sceneTrajectoryLabel: 'اتجاه المسار في هذا المشهد:',
    realityHeading: 'الأساس التقني والواقعي (بدون تضخيم)',
    conflictHeading: 'المعضلة الدرامية وقرارات غرفة الأزمة',
    mdHeader: 'سيناريو الفيلم العالمي: خط الصدع الرقمي (Digital Faultline)',
    mdDominant: 'المسار الاستشرافي المهيمن لحظياً',
    mdResilience: 'مؤشر المرونة المؤسسية',
    mdLocation: 'الموقع',
    mdCharacters: 'الشخصيات',
    mdReality: 'الواقع التقني المؤسسي',
    mdConflict: 'الصراع الدرامي',
  },
  en: {
    kicker: 'Dramatic Thriller Projection Synchronized with Dual Maps & π Equations',
    heading: 'Global Film Script: "Digital Faultline"',
    subtitlePre:
      'Realistic geopolitical & cyber thriller script synthesized live from incoming telemetry and dual maps; every node generates a synchronized scene reflecting the leading trajectory',
    copyBtn: 'Copy Script',
    copiedBtn: 'Copied',
    exportBtn: 'Export Markdown',
    allActs: 'All Acts',
    act1: 'Act I: Silent Spark',
    act2: 'Act II: Contagion & Noise',
    act3: 'Act III: Stability Fork',
    endingPrefix: 'Act III climax follows trajectory:',
    actWord: 'Act',
    sceneWord: 'Scene',
    trackOnMap: 'Locate Event on Map',
    protagonistsLabel: 'Key Characters:',
    sceneTrajectoryLabel: 'Beat Trajectory:',
    realityHeading: 'Grounded Technical Reality (Zero Sensationalism)',
    conflictHeading: 'Dramatic Conflict & Crisis Room Choice',
    mdHeader: 'Global Film Script: Digital Faultline',
    mdDominant: 'Live Dominant Trajectory',
    mdResilience: 'Institutional Resilience Index',
    mdLocation: 'Location',
    mdCharacters: 'Characters',
    mdReality: 'Technical Reality',
    mdConflict: 'Dramatic Conflict',
  },
  fr: {
    kicker: 'Projection Cinématographique Synchronisée avec les 2 Cartes & Équations π',
    heading: 'Scénario du Film Mondial : « Ligne de Fracture Numérique » (Digital Faultline)',
    subtitlePre:
      'Traitement thriller réaliste généré en direct depuis les événements et les deux cartes ; chaque trajectoire produit une scène reflétant le scénario dominant',
    copyBtn: 'Copier le script',
    copiedBtn: 'Copié',
    exportBtn: 'Exporter Markdown',
    allActs: 'Tous les Actes',
    act1: 'Acte I : L’Étincelle Silencieuse',
    act2: 'Acte II : Contagion & Désinfo',
    act3: 'Acte III : Bifurcation',
    endingPrefix: 'Le dénouement de l’Acte III suit :',
    actWord: 'Acte',
    sceneWord: 'Scène',
    trackOnMap: 'Voir sur la carte',
    protagonistsLabel: 'Personnages clés :',
    sceneTrajectoryLabel: 'Trajectoire :',
    realityHeading: 'Fondement Technique & Réel',
    conflictHeading: 'Dilemme Dramatique & Cellule de Crise',
    mdHeader: 'Scénario du Film Mondial : Digital Faultline',
    mdDominant: 'Trajectoire Dominante',
    mdResilience: 'Indice de Résilience',
    mdLocation: 'Lieu',
    mdCharacters: 'Personnages',
    mdReality: 'Réalité Technique',
    mdConflict: 'Conflit Dramatique',
  },
  id: {
    kicker: 'Proyeksi Skenario Thriller Tersinkronisasi dengan Peta Ganda & Rumus π',
    heading: 'Naskah Film Global: "Garis Sesar Digital" (Digital Faultline)',
    subtitlePre:
      'Skenario thriller geopolitik & siber realistis yang dibangun langsung dari aliran data; tiap lintasan menghasilkan adegan sesuai jalur dominan saat ini',
    copyBtn: 'Salin Naskah',
    copiedBtn: 'Tersalin',
    exportBtn: 'Ekspor Markdown',
    allActs: 'Semua Babak',
    act1: 'Babak I: Percikan Senyap',
    act2: 'Babak II: Penularan & Disinfo',
    act3: 'Babak III: Persimpangan Stabilitas',
    endingPrefix: 'Klimaks Babak III mengikuti jalur:',
    actWord: 'Babak',
    sceneWord: 'Adegan',
    trackOnMap: 'Lacak di Peta',
    protagonistsLabel: 'Tokoh Utama:',
    sceneTrajectoryLabel: 'Arah Lintasan:',
    realityHeading: 'Dasar Teknis & Fakta Nyata',
    conflictHeading: 'Konflik Dramatis & Keputusan Ruang Krisis',
    mdHeader: 'Naskah Film Global: Digital Faultline',
    mdDominant: 'Lintasan Dominan Langsung',
    mdResilience: 'Indeks Ketahanan Institusional',
    mdLocation: 'Lokasi',
    mdCharacters: 'Tokoh',
    mdReality: 'Realitas Teknis',
    mdConflict: 'Konflik Dramatis',
  },
  vi: {
    kicker: 'Kịch Bản Phim Kịch Tính Đồng Bộ Với Bản Đồ Kép & Công Thức π',
    heading: 'Kịch Bản Phim Toàn Cầu: "Đứt Gãy Số" (Digital Faultline)',
    subtitlePre:
      'Kịch bản điều tra địa chính trị & an ninh mạng chân thực được dựng trực tiếp từ dòng sự kiện và hai bản đồ; mỗi diễn biến tạo phân cảnh theo xu hướng chủ đạo',
    copyBtn: 'Sao Chép Kịch Bản',
    copiedBtn: 'Đã chép',
    exportBtn: 'Xuất Markdown',
    allActs: 'Tất Cả Hồi',
    act1: 'Hồi I: Tia Lửa Thầm Lặng',
    act2: 'Hồi II: Lây Lan & Tin Giả',
    act3: 'Hồi III: Ngã Rẽ Ổn Định',
    endingPrefix: 'Kết thúc Hồi III đi theo hướng:',
    actWord: 'Hồi',
    sceneWord: 'Cảnh',
    trackOnMap: 'Theo Dõi Trên Bản Đồ',
    protagonistsLabel: 'Nhân Vật Chính:',
    sceneTrajectoryLabel: 'Hướng Quỹ Đạo:',
    realityHeading: 'Cơ Sở Kỹ Thuật Thực Tế',
    conflictHeading: 'Xung Đột Kịch Tính & Quyết Định Phòng Khủng Hoảng',
    mdHeader: 'Kịch Bản Phim Toàn Cầu: Digital Faultline',
    mdDominant: 'Quỹ Đạo Chủ Đạo',
    mdResilience: 'Chỉ Số Chống Chịu',
    mdLocation: 'Địa điểm',
    mdCharacters: 'Nhân vật',
    mdReality: 'Thực tế kỹ thuật',
    mdConflict: 'Xung đột kịch tính',
  },
};

export default function FilmScenarioView({
  locale,
  events,
  probabilities,
  onSelectEventOnMap,
}: FilmScenarioViewProps) {
  const t = FILM_I18N[locale];
  const [actFilter, setActFilter] = useState<'ALL' | 'I' | 'II' | 'III'>('ALL');
  const [copied, setCopied] = useState(false);

  const scenes: FilmSceneBeat[] = events.map((ev, index) => {
    if (ev.filmScene) return ev.filmScene;
    return generateFilmBeatFromEvent(ev, probabilities, index + 1, locale);
  });

  const filteredScenes =
    actFilter === 'ALL' ? scenes : scenes.filter((s) => s.act === actFilter);

  const dominantTitle = getScenarioCopy(probabilities.dominant, locale).title;

  const buildMarkdownExport = () => {
    const header = `# ${t.mdHeader}\n\n${t.mdDominant}: ${dominantTitle} (${probabilities[probabilities.dominant]}%)\n${t.mdResilience}: ${probabilities.resilienceIndex}%\n\n---\n\n`;
    const body = scenes
      .map(
        (s) =>
          `## ${t.actWord} ${s.act} — ${t.sceneWord} ${s.sceneNumber}: ${s.title} (${s.timecode})\n**${t.mdLocation}:** ${s.location}\n**${t.mdCharacters}:** ${s.protagonists}\n**${t.mdReality}:** ${s.groundedReality}\n**${t.mdConflict}:** ${s.dramaticConflict}\n> ${s.dialogueExcerpt}\n`
      )
      .join('\n---\n\n');
    return header + body;
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdownExport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked in some contexts
    }
  };

  const handleDownloadScript = () => {
    const blob = new Blob([buildMarkdownExport()], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-faultline-script-${locale}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#2B2856] bg-[#101124] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#2B2856] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C084FC]">
              <Film className="h-4 w-4" aria-hidden="true" />
              <span>{t.kicker}</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">{t.heading}</h2>
            <p className="mt-1 text-sm text-[#A5B4FC]">
              {t.subtitlePre} ({dominantTitle} — {probabilities[probabilities.dominant]}%).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-[#312E81] bg-[#0C0D16] px-3 py-2 text-xs font-medium text-white hover:border-[#7C3AED]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#34D399]" aria-hidden="true" />
                  <span>{t.copiedBtn}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.copyBtn}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadScript}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md bg-[#DC2626] px-3 py-2 text-xs font-semibold text-white hover:bg-[#B91C1C]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.exportBtn}</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 rounded-md bg-[#0C0D16] p-1 border border-[#1E1B4B]">
            {(
              [
                { id: 'ALL', label: `${t.allActs} (${scenes.length})` },
                { id: 'I', label: t.act1 },
                { id: 'II', label: t.act2 },
                { id: 'III', label: t.act3 },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActFilter(tab.id)}
                className={`whitespace-nowrap shrink-0 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  actFilter === tab.id
                    ? 'bg-[#7C3AED] text-white font-semibold'
                    : 'text-[#A5B4FC] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#A5B4FC] tabular-nums">
            {t.endingPrefix} <strong className="text-white">{dominantTitle}</strong>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {filteredScenes.map((scene) => {
          const beatScenario = SCENARIO_META[scene.dominantScenarioAtBeat];
          const beatTitle = getScenarioCopy(scene.dominantScenarioAtBeat, locale).title;
          return (
            <article
              key={scene.id}
              className="rounded-lg border border-[#2B2856] bg-[#101124] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E1B4B] pb-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#A5B4FC]">
                  <span className="font-bold text-[#FB7185]">
                    {t.actWord} {scene.act} · {t.sceneWord} {scene.sceneNumber}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-latin-math">{scene.timecode}</span>
                  <span aria-hidden="true">·</span>
                  <span>{scene.location}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectEventOnMap(scene.linkedEventId)}
                  className="text-xs font-semibold text-[#C084FC] underline decoration-[#7C3AED] underline-offset-4 hover:text-white"
                >
                  {t.trackOnMap}
                </button>
              </div>

              <h3 className="mt-3 text-lg font-bold text-white">{scene.title}</h3>
              <div className="mt-1 text-xs text-[#A5B4FC]">
                {t.protagonistsLabel} {scene.protagonists} · {t.sceneTrajectoryLabel}{' '}
                <span style={{ color: beatScenario.color }} className="font-semibold">
                  {beatTitle}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5 text-xs leading-relaxed">
                  <div className="font-bold text-white">{t.realityHeading}</div>
                  <p className="mt-1.5 text-[#CBD5E1]">{scene.groundedReality}</p>
                </div>
                <div className="rounded border border-[#1E1B4B] bg-[#0C0D16] p-3.5 text-xs leading-relaxed">
                  <div className="font-bold text-white">{t.conflictHeading}</div>
                  <p className="mt-1.5 text-[#CBD5E1]">{scene.dramaticConflict}</p>
                </div>
              </div>

              <blockquote className="mt-4 rounded border border-[#2B2856] bg-[#121329] px-4 py-3 text-sm font-medium text-white">
                {scene.dialogueExcerpt}
              </blockquote>
            </article>
          );
        })}
      </div>
    </div>
  );
}
