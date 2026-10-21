import Link from 'next/link';
import { requireMemberSession } from '../../lib/getCurrentMember';

export default async function AppDashboardPage() {
  const { user, access } = await requireMemberSession();

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">Bienvenido, {user.full_name}</h1>
      <p className="text-gray-600 mt-2">Panel principal de la plataforma.</p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Estado de membresía</h2>
          <p className={`mt-2 text-lg font-bold ${access.hasAccess ? 'text-green-700' : 'text-amber-700'}`}>
            {access.hasAccess ? 'Activa' : 'Sin acceso'}
          </p>
          {!access.hasAccess && (
            <Link href="/onboarding" className="text-sm text-blue-900 font-medium mt-2 inline-block">
              Completar onboarding →
            </Link>
          )}
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Clases y Entrenamientos</h2>
          <p className="text-sm text-gray-600 mt-2">
            Módulo en construcción. Aquí verás videos organizados por secciones.
          </p>
          <Link href="/app/clases" className="text-sm text-blue-900 font-medium mt-3 inline-block">
            Ir al módulo →
          </Link>
        </div>
      </div>
    </div>
  );
}
