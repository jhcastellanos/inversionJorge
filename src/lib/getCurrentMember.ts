import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyMemberJwt, MEMBER_COOKIE } from './memberAuth';
import { PlatformUser } from './platformUsers';
import { getMemberAccess } from './memberAccess';

export async function requireMemberSession() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const session = token ? verifyMemberJwt(token) : null;
  if (!session) redirect('/');

  const user = await PlatformUser.findById(session.userId);
  if (!user) redirect('/');

  const access = await getMemberAccess(user);
  return { user, access, session };
}
