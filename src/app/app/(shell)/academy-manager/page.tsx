import { redirect } from 'next/navigation';
import { requireMemberSession } from '../../../../lib/getCurrentMember';
import AcademyManagerPanel from '../../../../components/platform/AcademyManagerPanel';
import { PlatformAcademyModule } from '../../../../lib/platformAcademy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AcademyManagerPage() {
  const { access } = await requireMemberSession();
  if (access.role !== 'admin') redirect('/app');

  let modules: Awaited<ReturnType<typeof PlatformAcademyModule.findAllAdminWithLessons>> = [];
  try {
    modules = await PlatformAcademyModule.findAllAdminWithLessons();
  } catch {
    modules = [];
  }

  return <AcademyManagerPanel initialModules={modules} />;
}
