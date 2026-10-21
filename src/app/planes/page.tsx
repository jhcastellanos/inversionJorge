import { Course, Membership } from '../../lib/models';
import Link from 'next/link';
import ResponsiveLanding from '../../components/ResponsiveLanding';

export const dynamic = 'force-dynamic';

export default async function PlanesPage() {
  const courses = await Course.findActive();
  const memberships = await Membership.findActive();

  const customOrder = [3, 9, 8];
  const sortedCourses = courses.sort((a: any, b: any) => {
    const indexA = customOrder.indexOf(a.Id);
    const indexB = customOrder.indexOf(b.Id);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent"
          >
            Inversión Real con Jorge y Guille
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-900">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="px-3 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          Planes y cursos
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Elige tu membresía o curso. Después de pagar, accede a la plataforma con tu cuenta.
        </p>
      </section>

      <ResponsiveLanding courses={sortedCourses} memberships={memberships} />

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2025 Inversión Real con Jorge y Guille. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
