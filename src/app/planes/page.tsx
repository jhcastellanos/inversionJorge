import { Course, Membership } from '../../lib/models';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ResponsiveLanding from '../../components/ResponsiveLanding';
import MarketingTopBar from '../../components/platform/MarketingTopBar';
import { verifyMemberJwt, MEMBER_COOKIE } from '../../lib/memberAuth';
import { PlatformUser } from '../../lib/platformUsers';
import { getMemberAccess } from '../../lib/memberAccess';

export const dynamic = 'force-dynamic';

export default async function PlanesPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const session = token ? verifyMemberJwt(token) : null;
  if (session) {
    const user = await PlatformUser.findById(session.userId);
    if (user) {
      const access = await getMemberAccess(user);
      if (access.hasAccess) redirect('/app/planes');
      redirect('/onboarding');
    }
  }

  const courses = await Course.findActive();
  const memberships = await Membership.findActive();

  const customOrder = [3, 9, 8];
  const sortedCourses = courses.sort((a: { Id: number }, b: { Id: number }) => {
    const indexA = customOrder.indexOf(a.Id);
    const indexB = customOrder.indexOf(b.Id);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen ventic-bg ventic-text">
      <MarketingTopBar ctaHref="/" ctaLabel="Entrar a la plataforma" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold ventic-text mb-4">Planes y cursos</h2>
        <p className="ventic-muted max-w-2xl mx-auto">
          Elige tu membresía o curso. Después de pagar, crea tu cuenta o inicia sesión para acceder al CRM.
        </p>
      </section>

      <ResponsiveLanding courses={sortedCourses} memberships={memberships} variant="ventic" />

      <footer className="ventic-surface border-t ventic-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center ventic-muted text-sm">
          <p>&copy; 2025 Inversión Real con Jorge y Guille. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
