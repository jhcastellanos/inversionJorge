import { requireMemberSession } from '../../../../lib/getCurrentMember';
import PlatformSubscriptionsPanel from '../../../../components/platform/PlatformSubscriptionsPanel';

export default async function AppSuscripcionesPage() {
  const { user } = await requireMemberSession();
  return (
    <PlatformSubscriptionsPanel initialEmail={user.email} embedded allowEmailChange={false} />
  );
}
