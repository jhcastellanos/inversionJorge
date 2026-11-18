import { requireMemberSession } from '../../lib/getCurrentMember';
import { canMemberRequestOneOnOne } from '../../lib/oneOnOneAccess';
import MarketingTopBar from '../../components/platform/MarketingTopBar';
import Link from 'next/link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DudasLayout({ children }: { children: React.ReactNode }) {
  const { user, access } = await requireMemberSession({ skipDiscordRequirement: true });
  const showOneOnOne = canMemberRequestOneOnOne(user.platform_role);

  return (
    <div className="min-h-screen ventic-bg ventic-text">
      <MarketingTopBar ctaHref="/planes" ctaLabel="Ver membresías" />
      <header className="max-w-3xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold ventic-text">Dudas e inquietudes</h1>
          <p className="text-sm ventic-muted mt-1">Escríbenos y revisa el estado de tus consultas en tu cuenta privada.</p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm font-semibold">
          {showOneOnOne && (
            <Link href="/reunion-1a1" className="text-[var(--ventic-accent)] hover:underline">
              Reunión 1-a-1
            </Link>
          )}
          {access.hasAccess ? (
            <Link href="/app/dudas" className="ventic-muted hover:underline">
              Vista en plataforma
            </Link>
          ) : (
            <Link href="/onboarding" className="ventic-muted hover:underline">
              Volver a configuración
            </Link>
          )}
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-4 pb-12">{children}</main>
    </div>
  );
}