'use client';

import { useEffect, useMemo, useState } from 'react';
import AcademyModuleViewer from './AcademyModuleViewer';
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

export default function ClasesAcademySection({
  modules,
  roleLabel,
}: {
  modules: ClasesAcademyModule[];
  roleLabel: string;
}) {
  const { t } = usePlatformPreferences();
  const subtitle = t('classes.subtitle').replace('{role}', roleLabel);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(modules[0]?.id ?? null);

  useEffect(() => {
    if (modules.length === 0) {
      setActiveModuleId(null);
      return;
    }
    if (activeModuleId == null || !modules.some((m) => m.id === activeModuleId)) {
      setActiveModuleId(modules[0].id);
    }
  }, [modules, activeModuleId]);

  const activeModule = useMemo(
    () => modules.find((m) => m.id === activeModuleId) ?? modules[0] ?? null,
    [modules, activeModuleId]
  );

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

      <section className="mt-8 rounded-2xl border ventic-border ventic-surface overflow-hidden shadow-sm">
        <div className="border-b ventic-border px-3 py-3 sm:px-4 sm:py-4 bg-black/10">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--ventic-accent-muted)] mb-2 px-1">
            {t('classes.academyModules')}
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin"
            role="tablist"
            aria-label="Módulos"
          >
            {modules.map((mod, idx) => {
              const selected = mod.id === activeModuleId;
              return (
                <button
                  key={mod.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveModuleId(mod.id)}
                  className={`shrink-0 flex items-center gap-2 rounded-xl border px-3 py-2.5 sm:px-4 text-left transition-colors max-w-[min(100%,280px)] ${
                    selected
                      ? 'border-[var(--ventic-accent)] bg-[var(--ventic-accent)]/15 ventic-text shadow-sm'
                      : 'border-transparent ventic-muted hover:bg-ventic-accent-soft hover:ventic-text'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      selected ? 'bg-[var(--ventic-accent)] text-white' : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold leading-tight line-clamp-2">{mod.title}</span>
                </button>
              );
            })}
          </div>
          {activeModule?.description ? (
            <p className="text-sm ventic-muted mt-3 px-1">{activeModule.description}</p>
          ) : null}
        </div>

        {activeModule ? (
          <AcademyModuleViewer
            key={activeModule.id}
            moduleId={activeModule.id}
            moduleTitle={activeModule.title}
            moduleDescription={activeModule.description}
            lessons={activeModule.lessons}
            embedded
          />
        ) : null}
      </section>
    </>
  );
}