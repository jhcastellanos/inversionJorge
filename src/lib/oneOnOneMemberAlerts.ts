import type { OneOnOneStatus } from './oneOnOneTypes';
import { oneOnOneMemberNeedsAction } from './oneOnOneTypes';
import { OneOnOneRequest, ensureOneOnOneSchema } from './oneOnOneMeetings';

export async function countMemberOneOnOneActions(userId: number): Promise<number> {
  await ensureOneOnOneSchema();
  const requests = await OneOnOneRequest.listByUserId(userId);
  return requests.filter((r) => oneOnOneMemberNeedsAction(r.status as OneOnOneStatus)).length;
}