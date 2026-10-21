import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyMemberJwt, MEMBER_COOKIE } from '../../lib/memberAuth';
import { PlatformUser } from '../../lib/platformUsers';
import { getMemberAccess } from '../../lib/memberAccess';
import { syncOnboardingIfHasAccess } from '../../lib/memberOnboarding';
import OnboardingWizard from '../../components/platform/OnboardingWizard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const session = token ? verifyMemberJwt(token) : null;
  if (!session) redirect('/');

  const user = await PlatformUser.findById(session.userId);
  if (!user) redirect('/');

  const access = await getMemberAccess(user);
  if (access.hasAccess) {
    await syncOnboardingIfHasAccess(user, access);
    redirect('/app');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm font-semibold text-blue-900">
          Inversión Real con Jorge y Guille
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Configura tu acceso</h1>
        <p className="text-gray-600 mt-2">
          Paso a paso: elige una membresía o espera a que el admin vincule tu cuenta de Stripe si
          ya pagaste antes.
        </p>
      </header>
      <OnboardingWizard
        hasAccess={access.hasAccess}
        subscriptionActive={access.subscriptionActive}
        userId={user.id}
      />
    </div>
  );
}
