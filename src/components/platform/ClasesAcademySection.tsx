'use client';

import AcademyLessonCard from './AcademyLessonCard';
import { usePlatformPreferences } from './PlatformPreferencesProvider';
import type { LessonType } from '../../lib/platformAcademy';

export type ClasesAcademyModule = {
  id: number;
  title: string;
  description: string | null;
  lessons: Array<{
    id: number;
    title: string;
    lesson_code: string;
    lesson_type: LessonType;
    file_url: string | null;
    duration_label: string | null;
  }>;
};

function actionLabel(type: LessonType, t: (key: string) => string) {
  if (type === 'pdf') return t('classes.viewPdf');
  if (type === 'video') return t('classes.watchVideo');
  return t('classes.openLink');
}

export default function ClasesAcademySection({
  modules,
  roleLabel,
}: {
  modules: ClasesAcademyModule[];
  roleLabel: string;
}) {
  const { t } = usePlatformPreferences();
  const subtitle = t('classes.subtitle').replace('{role}', roleLabel);

  if (modules.length === 0) {
    return (
      <>
        <p className="ventic-muted mt-2">{subtitle}</p>
        <div className="mt-8 rounded-2xl border border-dashed ventic-border ventic-surface p-10 text-center ventic-muted">
          {t('classes.emptyAcademy')}
        </div>
      </>
    );
  }

  return (
    <>
      <p className="ventic-muted mt-2">{subtitle}</p>
      <div className="mt-8 space-y-10">
        {modules.map((mod, idx) => (
          <section key={mod.id}>
            <h2 className="text-xl font-semibold ventic-text border-b ventic-border pb-2 flex items-center gap-2">
              <span className="text-sm font-bold text-white bg-[var(--ventic-accent)] rounded-full w-7 h-7 inline-flex items-center justify-center">
                {idx + 1}
              </span>
              {mod.title}
            </h2>
            {mod.description ? <p className="text-sm ventic-muted mt-2">{mod.description}</p> : null}
            <ul className="mt-4 space-y-3">
              {mod.lessons.map((lesson) => (
                <AcademyLessonCard
                  key={lesson.id}
                  title={lesson.title}
                  lessonCode={lesson.lesson_code}
                  durationLabel={lesson.duration_label}
                  lessonType={lesson.lesson_type}
                  fileUrl={lesson.file_url}
                  actionLabel={actionLabel(lesson.lesson_type, t)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
