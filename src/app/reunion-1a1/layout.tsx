import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireMemberSession } from '../../lib/getCurrentMember';
import MarketingTopBar from '../../components/platform/MarketingTopBar';
import { canMemberRequestOneOnOne } from '../../lib/oneOnOneAccess';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function ReunionOneOnOneLayout({ children }: { children: React.ReactNode }) {
  const { user, access } = await requireMemberSession({ skipDiscordRequirement: true });

  if (!canMemberRequestOneOnOne(user.platform_role)) {
    redirect('/admin/reuniones-1a1');
  }

  return (
    <div className="min-h-screen ventic-bg ventic-text">
      <MarketingTopBar ctaHref="/planes" ctaLabel="Ver membresías" />
      <header className="max-w-3xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold ventic-text">Reunión 1-a-1 con la academia</h1>
          <p className="text-sm ventic-muted mt-1">
            Para visitantes y miembros: entrenamiento, dudas y acompañamiento personalizado.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/dudas" className="text-[var(--ventic-accent)] hover:underline">
            Dudas escritas
          </Link>
          {access.hasAccess && (
            <Link href="/app" className="ventic-muted hover:underline">
              Plataforma
            </Link>
          )}
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 pb-12">{children}</main>
    </div>
  );
}