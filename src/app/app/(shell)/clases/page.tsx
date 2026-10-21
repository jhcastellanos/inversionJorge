import Link from 'next/link';
import { requireMemberSession } from '../../../../lib/getCurrentMember';
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
          Necesitas una membresía activa en Stripe o un rol asignado para acceder a este contenido.
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

  const allClasses = await PlatformClass.findPublished();
  const roleLabel = access.effectiveRole ? PLATFORM_ROLE_LABELS[access.effectiveRole] : 'Miembro';

  const visible = allClasses.filter((c) => access.contentAccess.classes[c.class_level as ClassLevel]);
  const locked = allClasses.filter((c) => !access.contentAccess.classes[c.class_level as ClassLevel]);

  const bySection = visible.reduce<Record<string, typeof visible>>((acc, row) => {
    const key = row.section_name || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900">Clases y Entrenamientos</h1>
      <p className="text-gray-600 mt-2">
        Acceso ({roleLabel}):{' '}
        {(Object.keys(CLASS_LEVEL_LABELS) as ClassLevel[])
          .filter((k) => access.contentAccess.classes[k])
          .map((k) => CLASS_LEVEL_LABELS[k])
          .join(' y ') || 'sin clases'}
        .
      </p>

      {Object.keys(bySection).length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          Aún no hay clases publicadas para tu nivel.
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {Object.entries(bySection).map(([section, items]) => (
            <section key={section}>
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">{section}</h2>
              <ul className="mt-4 space-y-4">
                {items.map((c) => (
                  <li key={c.id} className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {CLASS_LEVEL_LABELS[c.class_level]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mt-2">{c.title}</h3>
                    {c.description && (
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{c.description}</p>
                    )}
                    {c.video_url && (
                      <a
                        href={c.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-sm font-medium text-blue-900 hover:underline"
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
      )}

      {locked.length > 0 && (
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-800">Clases avanzadas (requieren rol Inversor)</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {locked.map((c) => (
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
