import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PlatformHomeHub from '../components/platform/PlatformHomeHub';
import { verifyMemberJwt, MEMBER_COOKIE } from '../lib/memberAuth';
import { PlatformUser } from '../lib/platformUsers';
import { getMemberAccess } from '../lib/memberAccess';
import { syncOnboardingIfHasAccess } from '../lib/memberOnboarding';
import { PlatformCalendarEvent } from '../lib/platformContent';
import {
  filterEventsByAccess,
  serializeEvent,
  splitLiveAndUpcoming,
} from '../lib/platformEventDisplay';
import { canAccessEventLevel, type EventLevel } from '../lib/platformRoles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: { register?: string };
};

export default async function PlatformHomePage({ searchParams }: PageProps) {
  const authMode = searchParams?.register === '1' ? 'register' : 'login';

  const token = cookies().get(MEMBER_COOKIE)?.value;
  const session = token ? verifyMemberJwt(token) : null;

  if (!session) {
    return (
      <PlatformHomeHub
        user={null}
        hasAccess={false}
        isPlatformAdmin={false}
        live={[]}
        upcoming={[]}
        adminEvents={[]}
        authMode={authMode}
      />
    );
  }

  let user = await PlatformUser.findById(session.userId);
  if (!user) redirect('/');

  const access = await getMemberAccess(user);

  if (!access.hasAccess) {
    redirect('/onboarding');
  }

  user = await syncOnboardingIfHasAccess(user, access);

  const isPlatformAdmin = access.role === 'admin';

  let rows = isPlatformAdmin
    ? await PlatformCalendarEvent.findAllAdmin()
    : await PlatformCalendarEvent.findPublishedForHome();

  if (isPlatformAdmin) {
    rows = rows.filter(
      (e) =>
        e.is_published ||
        new Date(e.starts_at) >= new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    );
  }

  const visible = filterEventsByAccess(rows, (level) =>
    isPlatformAdmin ? true : access.contentAccess.events[level as EventLevel]
  );

  const publishedVisible = isPlatformAdmin
    ? visible
    : visible.filter((e) => e.is_published);

  const { live, upcoming } = splitLiveAndUpcoming(publishedVisible);

  return (
    <PlatformHomeHub
      user={{ full_name: user.full_name, email: user.email }}
      hasAccess={access.hasAccess}
      isPlatformAdmin={isPlatformAdmin}
      live={live.map(serializeEvent)}
      upcoming={upcoming.map(serializeEvent)}
      adminEvents={rows.map(serializeEvent)}
      authMode={authMode}
    />
  );
}
