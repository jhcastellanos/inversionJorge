import { requireMemberSession } from '../../lib/getCurrentMember';
import PlatformHomeHub from '../../components/platform/PlatformHomeHub';
import { PlatformCalendarEvent } from '../../lib/platformContent';
import {
  filterEventsByAccess,
  serializeEvent,
  splitLiveAndUpcoming,
} from '../../lib/platformEventDisplay';
import type { EventLevel } from '../../lib/platformRoles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AppHomePage() {
  const { user, access } = await requireMemberSession();

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

  const publishedVisible = isPlatformAdmin ? visible : visible.filter((e) => e.is_published);

  const { live, upcoming } = splitLiveAndUpcoming(publishedVisible);

  return (
    <PlatformHomeHub
      user={{ full_name: user.full_name, email: user.email }}
      isPlatformAdmin={isPlatformAdmin}
      live={live.map(serializeEvent)}
      upcoming={upcoming.map(serializeEvent)}
      adminEvents={rows.map(serializeEvent)}
    />
  );
}
