'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlatformPreferences } from './PlatformPreferencesProvider';
import type { LessonType } from '../../lib/platformAcademy';

export type AcademyViewerLesson = {
  id: number;
  title: string;
  lesson_code: string;
  lesson_type: LessonType;
  file_url: string | null;
  duration_label: string | null;
};

function lessonIcon(type: LessonType, done: boolean) {
  const base = done ? 'text-[var(--ventic-accent)]' : 'ventic-muted';
  if (type === 'video') return <span className={base} aria-hidden>▶</span>;
  if (type === 'pdf') return <span className={base} aria-hidden>📄</span>;
  return <span className={base} aria-hidden>🔗</span>;
}

function ProgressRing({ percent, label }: { percent: number; label: string }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2 py-4 border-b ventic-border">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-white/10" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="text-[var(--ventic-accent)] transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold ventic-text">{percent}%</span>
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-wider text-center ventic-muted px-2">{label}</p>
    </div>
  );
}

function LessonStage({
  lesson,
  watchLabel,
  viewPdfLabel,
  openLinkLabel,
  noFileMessage,
  onVideoEnded,
}: {
  lesson: AcademyViewerLesson;
  watchLabel: string;
  viewPdfLabel: string;
  openLinkLabel: string;
  noFileMessage: string;
  onVideoEnded: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
  }, [lesson.id, lesson.file_url]);

  if (!lesson.file_url) {
    return (
      <div className="aspect-video w-full bg-black/80 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center text-white/40 text-2xl">
          ▶
        </div>
        <p className="text-sm text-white/70 max-w-md">{noFileMessage}</p>
      </div>
    );
  }

  if (lesson.lesson_type === 'video') {
    return (
      <div className="bg-black">
        <video
          ref={videoRef}
          key={lesson.id}
          controls
          playsInline
          preload="metadata"
          className="w-full aspect-video max-h-[min(72vh,640px)]"
          src={lesson.file_url}
          onEnded={onVideoEnded}
        />
        <div className="px-4 py-2 border-t border-white/10 flex justify-end">
          <a
            href={lesson.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/60 hover:text-[var(--ventic-accent)]"
          >
            {watchLabel} ↗
          </a>
        </div>
      </div>
    );
  }

  if (lesson.lesson_type === 'pdf') {
    return (
      <div className="bg-[var(--ventic-bg)]">
        <iframe
          title={lesson.title}
          src={lesson.file_url}
          className="w-full min-h-[min(72vh,640px)] bg-white"
        />
        <div className="px-4 py-2 border-t ventic-border">
          <a
            href={lesson.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--ventic-accent)] hover:underline"
          >
            {viewPdfLabel} ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full bg-gradient-to-b from-black/90 to-[var(--ventic-bg)] flex flex-col items-center justify-center gap-6 p-8">
      <p className="text-lg font-semibold ventic-text text-center">{lesson.title}</p>
      <a
        href={lesson.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--ventic-accent)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--ventic-accent-hover)]"
      >
        {openLinkLabel} ↗
      </a>
    </div>
  );
}

export default function AcademyModuleViewer({
  moduleId,
  moduleTitle,
  moduleDescription,
  lessons,
}: {
  moduleId: number;
  moduleTitle: string;
  moduleDescription: string | null;
  lessons: AcademyViewerLesson[];
}) {
  const { t } = usePlatformPreferences();
  const [activeId, setActiveId] = useState(lessons[0]?.id ?? 0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    if (lessons.length === 0) return;
    if (!lessons.some((l) => l.id === activeId)) {
      setActiveId(lessons[0].id);
    }
  }, [lessons, activeId]);

  useEffect(() => {
    let cancelled = false;
    setLoadingProgress(true);
    void fetch(`/api/member/academy-progress?moduleId=${moduleId}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { completedLessonIds: [] }))
      .then((data) => {
        if (cancelled) return;
        const ids = Array.isArray(data.completedLessonIds) ? data.completedLessonIds : [];
        setCompleted(new Set(ids.map((id: unknown) => Number(id))));
      })
      .finally(() => {
        if (!cancelled) setLoadingProgress(false);
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  const active = useMemo(
    () => lessons.find((l) => l.id === activeId) ?? lessons[0] ?? null,
    [lessons, activeId]
  );

  const completedCount = useMemo(
    () => lessons.filter((l) => completed.has(l.id)).length,
    [lessons, completed]
  );
  const percent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const progressLabel = t('classes.progressSummary')
    .replace('{done}', String(completedCount))
    .replace('{total}', String(lessons.length));

  const markComplete = useCallback(
    async (lessonId: number, advance = true) => {
      setCompleted((prev) => {
        const nextSet = new Set(Array.from(prev).concat(lessonId));
        if (advance) {
          const idx = lessons.findIndex((l) => l.id === lessonId);
          const nextLesson = lessons.slice(idx + 1).find((l) => !nextSet.has(l.id));
          if (nextLesson) setActiveId(nextLesson.id);
        }
        return nextSet;
      });
      await fetch('/api/member/academy-progress', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });
    },
    [lessons]
  );

  if (lessons.length === 0) {
    return (
      <p className="text-sm ventic-muted mt-4 border border-dashed ventic-border rounded-xl p-6 text-center">
        {t('classes.emptyModuleLessons')}
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border ventic-border ventic-surface overflow-hidden shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {active && (
            <>
              <LessonStage
                lesson={active}
                watchLabel={t('classes.watchVideo')}
                viewPdfLabel={t('classes.viewPdf')}
                openLinkLabel={t('classes.openLink')}
                noFileMessage={t('classes.noVideoFile')}
                onVideoEnded={() => void markComplete(active.id)}
              />
              <div className="p-4 sm:p-5 border-t ventic-border">
                <p className="text-xs ventic-muted uppercase tracking-wide">{active.lesson_code}</p>
                <h3 className="text-lg font-bold ventic-text mt-1">{active.title}</h3>
                {active.duration_label ? (
                  <p className="text-sm ventic-muted mt-1">{active.duration_label}</p>
                ) : null}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    disabled={completed.has(active.id)}
                    onClick={() => void markComplete(active.id)}
                    className="rounded-lg bg-[var(--ventic-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--ventic-accent-hover)] disabled:opacity-50 disabled:cursor-default"
                  >
                    {completed.has(active.id) ? t('classes.lessonCompleted') : t('classes.markComplete')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l ventic-border bg-black/20">
          <div className="p-4 border-b ventic-border">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--ventic-accent-muted)]">
              {t('classes.moduleMaterials')}
            </p>
            <p className="font-bold ventic-text mt-1 uppercase text-sm tracking-wide">{moduleTitle}</p>
            {moduleDescription ? <p className="text-xs ventic-muted mt-1 line-clamp-2">{moduleDescription}</p> : null}
          </div>
          {!loadingProgress && (
            <ProgressRing percent={percent} label={progressLabel} />
          )}
          <ul className="max-h-[420px] overflow-y-auto py-2">
            {lessons.map((lesson, i) => {
              const isActive = lesson.id === activeId;
              const done = completed.has(lesson.id);
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(lesson.id)}
                    className={`w-full text-left px-4 py-3 flex gap-3 items-start transition-colors ${
                      isActive ? 'bg-[var(--ventic-accent)]/15 border-l-2 border-[var(--ventic-accent)]' : 'hover:bg-white/5 border-l-2 border-transparent'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                        done
                          ? 'border-[var(--ventic-accent)] bg-[var(--ventic-accent)] text-white'
                          : 'border-white/25 text-white/50'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        {lessonIcon(lesson.lesson_type, done)}
                        <span className={`text-sm font-medium leading-snug ${isActive ? 'ventic-text' : 'ventic-muted'}`}>
                          {lesson.title}
                        </span>
                      </span>
                      <span className="text-[10px] ventic-muted mt-0.5 block">{lesson.lesson_code}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
