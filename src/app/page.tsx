import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LandingAuthPanel from '../components/platform/LandingAuthPanel';
import MarketingTopBar from '../components/platform/MarketingTopBar';
import { verifyMemberJwt, MEMBER_COOKIE } from '../lib/memberAuth';
import { PlatformUser } from '../lib/platformUsers';
import { getMemberAccess } from '../lib/memberAccess';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: { register?: string };
};

export default async function LandingPage({ searchParams }: PageProps) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const session = token ? verifyMemberJwt(token) : null;

  if (session) {
    const user = await PlatformUser.findById(session.userId);
    if (user) {
      const access = await getMemberAccess(user);
      if (access.hasAccess) redirect('/app');
      redirect('/onboarding');
    }
  }

  const authMode = searchParams?.register === '1' ? 'register' : 'login';

  return (
    <div className="min-h-screen ventic-bg ventic-text">
      <MarketingTopBar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="pt-4 lg:pt-8">
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Tu academia de trading, en un solo lugar
            </h2>
            <p className="mt-6 text-lg ventic-muted leading-relaxed">
              Este es el punto de entrada: inicia sesión o crea cuenta para entrar al CRM (eventos en vivo,
              calendario y clases). Necesitas membresía Stripe o un rol asignado por el equipo.
            </p>

            <section className="mt-12 grid sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
              {[
                {
                  title: '1. Entra aquí',
                  text: 'Login o registro con email o Google en el panel de la derecha.',
                },
                {
                  title: '2. Activa acceso',
                  text: 'Membresía en Stripe o rol Admin / Alumno / Trader / Inversor.',
                },
                {
                  title: '3. CRM',
                  text: 'Calendario, clases en vivo y academia según tu nivel.',
                },
              ].map((step) => (
                <div key={step.title} className="rounded-xl border ventic-border ventic-surface p-4 shadow-sm">
                  <h3 className="font-bold ventic-text">{step.title}</h3>
                  <p className="mt-1 text-sm ventic-muted">{step.text}</p>
                </div>
              ))}
            </section>
          </div>

          <div className="lg:sticky lg:top-8">
            <LandingAuthPanel initialMode={authMode} />
          </div>
        </div>
      </main>

      <footer className="border-t ventic-border py-8 text-center text-sm ventic-muted">
        <Link href="/admin/login" className="hover:text-[var(--ventic-accent)]">
          Admin legacy
        </Link>
        <span className="mx-2">·</span>
        © 2025 Inversión Real con Jorge y Guille
      </footer>
    </div>
  );
}
