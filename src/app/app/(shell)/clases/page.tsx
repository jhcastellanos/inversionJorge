import Link from 'next/link';
import { requireMemberSession } from '../../../../lib/getCurrentMember';
import { PlatformAcademyModule } from '../../../../lib/platformAcademy';
import { PlatformClass } from '../../../../lib/platformContent';
import {
  CLASS_LEVEL_LABELS,
  PLATFORM_ROLE_LABELS,
  type ClassLevel,
} from '../../../../lib/platformRoles';

function lessonActionLabel(type: string) {
  if (type === 'pdf') return 'Ver PDF';
  if (type === 'video') return 'Ver video';
  return 'Abrir enlace';
}

export default async function ClasesPage() {
  const { access } = await requireMemberSession();

  if (!access.hasAccess) {
    return (
      <div className="max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-bold text-amber-900">Clases y Entrenamientos</h1>
        <p className="mt-3 text-amber-800">
          Necesitas un rol asignado (mínimo Estudiante) para acceder a la academia.
        </p>
        <Link
          href="/onboarding"
          className="inline-block mt-6 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Activar acceso
        </Link>
      </div>
    );
  }

  const roleLabel = access.effectiveRole ? PLATFORM_ROLE_LABELS[access.effectiveRole] : 'Miembro';

  let academyModules: Awaited<ReturnType<typeof PlatformAcademyModule.findPublishedWithLessons>> = [];
  try {
    academyModules = await PlatformAcademyModule.findPublishedWithLessons();
  } catch {
    academyModules = [];
  }

  const allClasses = await PlatformClass.findPublished();
  const visibleLegacy = allClasses.filter((c) => access.contentAccess.classes[c.class_level as ClassLevel]);
  const lockedLegacy = allClasses.filter((c) => !access.contentAccess.classes[c.class_level as ClassLevel]);

  const bySection = visibleLegacy.reduce<Record<string, typeof visibleLegacy>>((acc, row) => {
    const key = row.section_name || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold ventic-text">Clases y Entrenamientos</h1>
      <p className="ventic-muted mt-2">
        Academia para miembros activos ({roleLabel}). Módulos y lecciones publicados por el equipo.
      </p>

      {academyModules.length > 0 ? (
        <div className="mt-8 space-y-10">
          {academyModules.map((mod, idx) => (
            <section key={mod.id}>
              <h2 className="text-xl font-semibold ventic-text border-b ventic-border pb-2 flex items-center gap-2">
                <span className="text-sm font-bold text-white bg-[var(--ventic-accent)] rounded-full w-7 h-7 inline-flex items-center justify-center">
                  {idx + 1}
                </span>
                {mod.title}
              </h2>
              {mod.description && <p className="text-sm ventic-muted mt-2">{mod.description}</p>}
              <ul className="mt-4 space-y-3">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id} className="rounded-xl ventic-surface border ventic-border p-4 shadow-sm">
                    <p className="font-semibold ventic-text">{lesson.title}</p>
                    <p className="text-xs ventic-muted mt-1">
                      {lesson.lesson_code}
                      {lesson.duration_label ? ` · ${lesson.duration_label}` : ''}
                    </p>
                    {lesson.file_url && (
                      <a
                        href={lesson.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-sm font-medium text-[var(--ventic-accent)] hover:underline"
                      >
                        {lessonActionLabel(lesson.lesson_type)} →
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed ventic-border ventic-surface p-10 text-center ventic-muted">
          Aún no hay módulos en la academia. Revisa más tarde.
        </div>
      )}

      {Object.keys(bySection).length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-800">Contenido adicional</h2>
          <div className="mt-6 space-y-10">
            {Object.entries(bySection).map(([section, items]) => (
              <section key={section}>
                <h3 className="text-md font-semibold text-gray-900 border-b pb-2">{section}</h3>
                <ul className="mt-4 space-y-4">
                  {items.map((c) => (
                    <li key={c.id} className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {CLASS_LEVEL_LABELS[c.class_level]}
                      </span>
                      <h3 className="font-semibold text-lg text-gray-900 mt-2">{c.title}</h3>
                      {c.video_url && (
                        <a
                          href={c.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-sm font-medium text-[var(--ventic-accent)] hover:underline"
                        >
                          Ver video →
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}

      {lockedLegacy.length > 0 && (
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-800">Clases avanzadas (requieren rol Inversor)</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {lockedLegacy.map((c) => (
              <li key={c.id} className="opacity-75">
                {c.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
