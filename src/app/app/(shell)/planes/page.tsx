import { Course, Membership } from '../../../../lib/models';
import { requireMemberSession } from '../../../../lib/getCurrentMember';
import PlatformPlansPanel from '../../../../components/platform/PlatformPlansPanel';
import { getMonthlyBasePrice } from '../../../../lib/membershipPlans';

export const dynamic = 'force-dynamic';

export default async function AppPlanesPage() {
  const { access } = await requireMemberSession();
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

  getMonthlyBasePrice(memberships);

  return (
    <PlatformPlansPanel
      courses={sortedCourses}
      memberships={memberships}
      role={access.effectiveRole}
      subscriptionActive={access.subscriptionActive}
      embedded
    />
  );
}
