'use client';

import type { LessonType } from '../../lib/platformAcademy';

type Props = {
  title: string;
  lessonCode: string;
  durationLabel: string | null;
  lessonType: LessonType;
  fileUrl: string | null;
  actionLabel: string;
};

export default function AcademyLessonCard({
  title,
  lessonCode,
  durationLabel,
  lessonType,
  fileUrl,
  actionLabel,
}: Props) {
  const meta = [lessonCode, durationLabel].filter(Boolean).join(' · ');

  return (
    <li className="rounded-xl ventic-surface border ventic-border p-4 shadow-sm">
      <p className="font-semibold ventic-text">{title}</p>
      {meta ? <p className="text-xs ventic-muted mt-1">{meta}</p> : null}

      {lessonType === 'video' && fileUrl ? (
        <div className="mt-4 space-y-2">
          <video
            controls
            playsInline
            preload="metadata"
            className="w-full rounded-lg bg-black max-h-[min(70vh,520px)]"
            src={fileUrl}
          />
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs ventic-muted hover:text-[var(--ventic-accent)] hover:underline"
          >
            {actionLabel} →
          </a>
        </div>
      ) : lessonType === 'pdf' && fileUrl ? (
        <div className="mt-4 space-y-2">
          <iframe
            title={title}
            src={fileUrl}
            className="w-full rounded-lg border ventic-border min-h-[420px] bg-white"
          />
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-[var(--ventic-accent)] hover:underline"
          >
            {actionLabel} →
          </a>
        </div>
      ) : fileUrl ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm font-medium text-[var(--ventic-accent)] hover:underline"
        >
          {actionLabel} →
        </a>
      ) : null}
    </li>
  );
}
