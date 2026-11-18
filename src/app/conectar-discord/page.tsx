import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MarketingTopBar from '../../components/platform/MarketingTopBar';
import { MEMBER_COOKIE, verifyMemberJwt } from '../../lib/memberAuth';
import { PlatformUser } from '../../lib/platformUsers';
import { ensurePlatformUserDiscordSchema } from '../../lib/platformUserDiscordSchema';
import {
  userHasDiscordLinked,
  postDiscordLinkDestination,
  safeMemberNextPath,
} from '../../lib/memberDiscordGate';
import { DISCORD_INVITE_URL } from '../../lib/communityLinks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ERROR_MESSAGES: Record<string, string> = {
  discord_not_configured: 'Discord OAuth no está configurado en el servidor. Avisa al equipo.',
  discord_denied: 'Cancelaste la autorización de Discord. Debes conectar para continuar.',
  discord_state: 'La sesión de vinculación expiró. Intenta de nuevo.',
  discord_save: 'No pudimos guardar tu usuario de Discord.',
  discord_callback: 'Error al conectar con Discord. Intenta otra vez.',
};

type PageProps = { searchParams?: { error?: string; next?: string } };

export default async function ConectarDiscordPage({ searchParams }: PageProps) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const session = token ? verifyMemberJwt(token) : null;
  if (!session) redirect('/');

  await ensurePlatformUserDiscordSchema();
  const user = await PlatformUser.findById(session.userId);
  if (!user) redirect('/');

  const nextPath = safeMemberNextPath(searchParams?.next);

  if (userHasDiscordLinked(user)) {
    redirect(await postDiscordLinkDestination(user.id, nextPath));
  }

  const discordAuthHref = nextPath
    ? `/api/member/auth/discord?next=${encodeURIComponent(nextPath)}`
    : '/api/member/auth/discord';

  const errKey = searchParams?.error;
  const errMsg = errKey ? ERROR_MESSAGES[errKey] ?? 'Error desconocido' : null;

  return (
    <div className="min-h-screen ventic-bg ventic-text">
      <MarketingTopBar ctaHref="/planes" ctaLabel="Ver membresías" />
      <main className="max-w-lg mx-auto px-4 py-12 sm:py-16">
        <div className="rounded-2xl ventic-surface border ventic-border p-8 sm:p-10 shadow-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#5865F2]/20 text-[#5865F2] text-2xl font-bold">
            D
          </div>
          <h1 className="text-2xl font-bold ventic-text">Comunidad Discord obligatoria</h1>
          <p className="mt-4 text-sm ventic-muted leading-relaxed">
            Para usar la plataforma debes vincular tu cuenta de Discord y unirte a la academia. Así
            guardamos tu ID de Discord en tu perfil (
            <span className="font-medium ventic-text">{user.email}</span>) y sincronizamos tu acceso.
          </p>

          {errMsg ? (
            <p className="mt-4 text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg px-3 py-2">
              {errMsg}
            </p>
          ) : null}

          <a
            href={discordAuthHref}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#4752C4]"
          >
            Conectar con Discord
          </a>

          <p className="mt-4 text-xs ventic-muted">
            También puedes entrar al servidor y volver aquí después:{' '}
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ventic-accent)] hover:underline"
            >
              invitación a Discord
            </a>
            . La vinculación con OAuth sigue siendo obligatoria.
          </p>

          <p className="mt-8 text-xs ventic-muted">
            <Link href="/api/member/logout" className="hover:text-[var(--ventic-accent)]">
              Cerrar sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}