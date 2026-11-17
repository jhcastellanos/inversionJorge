import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MarketingTopBar from '../../components/platform/MarketingTopBar';
import OnboardingWizard from '../../components/platform/OnboardingWizard';
import { verifyMemberJwt, MEMBER_COOKIE } from '../../lib/memberAuth';
import { PlatformUser } from '../../lib/platformUsers';
import { getMemberAccess } from '../../lib/memberAccess';
import { syncOnboardingIfHasAccess } from '../../lib/memberOnboarding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const session = token ? verifyMemberJwt(token) : null;
  if (!session) redirect('/');

  const user = await PlatformUser.findById(session.userId);
  if (!user) redirect('/');

  const { ensurePlatformUserDiscordSchema } = await import('../../lib/platformUserDiscordSchema');
  const { userHasDiscordLinked } = await import('../../lib/memberDiscordGate');
  await ensurePlatformUserDiscordSchema();
  const freshUser = (await PlatformUser.findById(user.id)) ?? user;
  if (!userHasDiscordLinked(freshUser)) {
    redirect('/conectar-discord');
  }

  const access = await getMemberAccess(freshUser);
  if (access.hasAccess) {
    await syncOnboardingIfHasAccess(freshUser, access);
    redirect('/app');
  }

  return (
    <div className="min-h-screen ventic-bg ventic-text">
      <MarketingTopBar ctaHref="/planes" ctaLabel="Ver membresías" />
      <header className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl font-bold ventic-text">Configura tu acceso</h1>
        <p className="ventic-muted mt-3 text-sm sm:text-base leading-relaxed">
          Para entrar al CRM necesitas una membresía activa. Paga tu plan y luego escribe a soporte para
          que finalicen tu inscripción.
        </p>
      </header>
      <OnboardingWizard subscriptionActive={access.subscriptionActive} userEmail={freshUser.email} />
    </div>
  );
}
