import { Course } from '../lib/models';
import Link from 'next/link';
import CourseCard from '../components/CourseCard';

// Force dynamic rendering to access DATABASE_URL at runtime
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const courses = await Course.findActive();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Inversión Real con Jorge</h1>
          <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Admin</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
          Domina la <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Bolsa de Valores</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Aprende a invertir en la bolsa de valores con estrategias probadas y mentoría directa. Conviértete en un trader exitoso con cursos prácticos diseñados para el mercado real.
        </p>
      </section>

      {/* Courses Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course: any) => (
            <CourseCard key={course.Id} course={course} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2025 Inversión Real con Jorge. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
