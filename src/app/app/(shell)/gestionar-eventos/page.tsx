import { redirect } from 'next/navigation';
import { requireMemberSession } from '../../../../lib/getCurrentMember';
import PlatformEventsManagePanel from '../../../../components/platform/PlatformEventsManagePanel';
import { PlatformCalendarEvent } from '../../../../lib/platformContent';
import { serializeEvent } from '../../../../lib/platformEventDisplay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function GestionarEventosPage() {
  const { access } = await requireMemberSession();

  if (access.role !== 'admin') {
    redirect('/app');
  }

  const rows = await PlatformCalendarEvent.findAllAdmin();

  return <PlatformEventsManagePanel initialEvents={rows.map(serializeEvent)} />;
}
