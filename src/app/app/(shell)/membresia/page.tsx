import { requireMemberSession } from '../../../../lib/getCurrentMember';
import { Membership } from '../../../../lib/models';
import PlatformMembershipPanel from '../../../../components/platform/PlatformMembershipPanel';
import { getMonthlyBasePrice } from '../../../../lib/membershipPlans';

export default async function MembresiaPage() {
  const { access } = await requireMemberSession();
  const memberships = await Membership.findActive();
  const monthlyBasePrice = getMonthlyBasePrice(memberships);

  return (
    <PlatformMembershipPanel
      role={access.effectiveRole}
      subscriptionActive={access.subscriptionActive}
      subscriptions={access.subscriptions}
      membershipCatalog={memberships.map((m) => ({
        Name: m.Name,
        MonthlyPrice: m.MonthlyPrice,
        Description: m.Description,
      }))}
      monthlyBasePrice={monthlyBasePrice}
    />
  );
}
