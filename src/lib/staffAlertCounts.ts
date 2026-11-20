import { isPlatformStaffRole, type PlatformRole } from './platformRoles';
import { SupportTicket } from './supportTickets';
import { OneOnOneRequest, ensureOneOnOneSchema } from './oneOnOneMeetings';

export type StaffAlertCounts = {
  openSupportTickets: number;
  pendingOneOnOne: number;
};

export async function getStaffAlertCounts(): Promise<StaffAlertCounts> {
  await ensureOneOnOneSchema();
  const [openSupportTickets, pendingOneOnOne] = await Promise.all([
    SupportTicket.countOpen(),
    OneOnOneRequest.countPendingAdmin(),
  ]);
  return { openSupportTickets, pendingOneOnOne };
}

export async function getStaffAlertCountsIfNeeded(
  role: PlatformRole | null
): Promise<StaffAlertCounts | undefined> {
  if (!isPlatformStaffRole(role)) return undefined;
  return getStaffAlertCounts();
}