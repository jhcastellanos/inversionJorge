import { redirect } from 'next/navigation';
import type { PlatformUserRow } from './platformUsers';
import { PlatformUser } from './platformUsers';
import { ensurePlatformUserDiscordSchema } from './platformUserDiscordSchema';
import { getMemberAccess } from './memberAccess';

export function userHasDiscordLinked(user: Pick<PlatformUserRow, 'discord_user_id'>): boolean {
  return Boolean(user.discord_user_id?.trim());
}

export async function redirectIfDiscordRequired(
  user: PlatformUserRow,
  options?: { skip?: boolean }
): Promise<void> {
  if (options?.skip) return;
  await ensurePlatformUserDiscordSchema();
  const fresh = (await PlatformUser.findById(user.id)) ?? user;
  if (!userHasDiscordLinked(fresh)) {
    redirect('/conectar-discord');
  }
}

export async function postDiscordLinkDestination(userId: number): Promise<string> {
  const user = await PlatformUser.findById(userId);
  if (!user) return '/';
  const access = await getMemberAccess(user);
  return access.hasAccess ? '/app' : '/onboarding';
}