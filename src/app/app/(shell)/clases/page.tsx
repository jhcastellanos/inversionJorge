import Link from 'next/link';
import ClasesAcademySection from '../../../../components/platform/ClasesAcademySection';
import { requireMemberSession } from '../../../../lib/getCurrentMember';
import { PlatformAcademyModule } from '../../../../lib/platformAcademy';
import { PlatformClass } from '../../../../lib/platformContent';
import {
  CLASS_LEVEL_LABELS,
  PLATFORM_ROLE_LABELS,
  type ClassLevel,
} from '../../../../lib/platformRoles';

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
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold ventic-text">Clases y Entrenamientos</h1>
      <ClasesAcademySection
        roleLabel={roleLabel}
        modules={academyModules.map((mod) => ({
          id: mod.id,
          title: mod.title,
          description: mod.description,
          lessons: mod.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            lesson_code: lesson.lesson_code,
            lesson_type: lesson.lesson_type,
            file_url: lesson.file_url,
            duration_label: lesson.duration_label,
          })),
        }))}
      />

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
