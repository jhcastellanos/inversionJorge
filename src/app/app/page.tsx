import { requireMemberSession } from '../../lib/getCurrentMember';
import PlatformHomeHub from '../../components/platform/PlatformHomeHub';
import StaffHomeAlerts from '../../components/platform/StaffHomeAlerts';
import MemberOneOnOneHomeAlert from '../../components/platform/MemberOneOnOneHomeAlert';
import { getStaffAlertCountsIfNeeded } from '../../lib/staffAlertCounts';
import { countMemberOneOnOneActions } from '../../lib/oneOnOneMemberAlerts';
import { isPlatformStaffRole } from '../../lib/platformRoles';
import { PlatformCalendarEvent } from '../../lib/platformContent';
import {
  filterEventsByMemberAccess,
  isEventVisibleOnHome,
  serializeEvent,
  splitLiveAndUpcoming,
} from '../../lib/platformEventDisplay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AppHomePage() {
  const { user, access } = await requireMemberSession();

  const isPlatformAdmin = access.role === 'admin';

  await PlatformCalendarEvent.autoExpireHomeEvents();

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

  const visible = filterEventsByMemberAccess(rows, access, { adminSeeAll: isPlatformAdmin });

  const now = new Date();
  const publishedVisible = (isPlatformAdmin ? visible : visible.filter((e) => e.is_published)).filter(
    (e) => isEventVisibleOnHome(e, now)
  );

  const { live, upcoming } = splitLiveAndUpcoming(publishedVisible, now);

  const staffAlertCounts = isPlatformStaffRole(access.role)
    ? await getStaffAlertCountsIfNeeded(access.role)
    : undefined;

  const memberOneOnOneActions =
    access.role !== 'admin' ? await countMemberOneOnOneActions(user.id) : 0;

  return (
    <>
      {staffAlertCounts && <StaffHomeAlerts counts={staffAlertCounts} />}
      {memberOneOnOneActions > 0 && <MemberOneOnOneHomeAlert count={memberOneOnOneActions} />}
      <PlatformHomeHub
        user={{ full_name: user.full_name, email: user.email }}
        contactSupportForRoleUpgrade={access.contactSupportForRoleUpgrade}
        live={live.map(serializeEvent)}
        upcoming={upcoming.map(serializeEvent)}
      />
    </>
  );
}
