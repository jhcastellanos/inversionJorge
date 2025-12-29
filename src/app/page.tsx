import { Course, Membership } from '../lib/models';
import Link from 'next/link';
import ResponsiveLanding from '../components/ResponsiveLanding';

// Force dynamic rendering to access DATABASE_URL at runtime
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const courses = await Course.findActive();
  const memberships = await Membership.findActive();

  // Orden personalizado: ID 3, luego 9, luego 8, resto por fecha de creación
  const customOrder = [3, 9, 8];
  const sortedCourses = courses.sort((a: any, b: any) => {
    const indexA = customOrder.indexOf(a.Id);
    const indexB = customOrder.indexOf(b.Id);
    
    // Si ambos están en el orden personalizado, ordenar según ese orden
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // Si solo A está en el orden personalizado, va primero
    if (indexA !== -1) return -1;
    
    // Si solo B está en el orden personalizado, va primero
    if (indexB !== -1) return 1;
    
    // Si ninguno está en el orden personalizado, mantener orden original
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Inversión Real con Jorge</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/subscription/manage" 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Mis Suscripciones</span>
              <span className="sm:hidden">Cuenta</span>
            </Link>
            <Link href="/admin/login" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6">
          Domina la <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Bolsa de Valores</span>
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
          Aprende a invertir en la bolsa de valores con estrategias probadas y mentoría directa. Conviértete en un trader exitoso con cursos prácticos diseñados para el mercado real.
        </p>
      </section>

      {/* Responsive Two-Column Layout with Mobile Tabs */}
      <ResponsiveLanding courses={sortedCourses} memberships={memberships} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2025 Inversión Real con Jorge. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
