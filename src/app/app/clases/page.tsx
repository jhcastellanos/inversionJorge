import Link from 'next/link';
import { requireMemberSession } from '../../../lib/getCurrentMember';

export default async function ClasesPage() {
  const { access } = await requireMemberSession();

  if (!access.hasAccess) {
    return (
      <div className="max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-bold text-amber-900">Clases y Entrenamientos</h1>
        <p className="mt-3 text-amber-800">
          Necesitas una membresía activa en Stripe para acceder a este contenido.
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

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900">Clases y Entrenamientos</h1>
      <p className="text-gray-600 mt-2">
        Próximamente: biblioteca de videos organizada por secciones desde el admin.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
        El backend para subir y organizar videos se habilitará en la siguiente fase.
      </div>
    </div>
  );
}
