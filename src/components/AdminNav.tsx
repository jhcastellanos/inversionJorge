import Link from 'next/link';

type AdminNavProps = {
  active: 'courses' | 'memberships' | 'subscriptions' | 'referrals';
};

const linkClass = (isActive: boolean) =>
  isActive ? 'text-blue-900 font-semibold' : 'text-gray-600 hover:text-gray-900';

export default function AdminNav({ active }: AdminNavProps) {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
            <div className="flex gap-4">
              <Link href="/admin/dashboard" className={linkClass(active === 'courses')}>
                Cursos
              </Link>
              <Link href="/admin/memberships" className={linkClass(active === 'memberships')}>
                Membresías
              </Link>
              <Link href="/admin/subscriptions" className={linkClass(active === 'subscriptions')}>
                Suscripciones
              </Link>
              <Link href="/admin/referrals" className={linkClass(active === 'referrals')}>
                Referidos
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Ver sitio
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-sm text-red-600 hover:text-red-700">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
