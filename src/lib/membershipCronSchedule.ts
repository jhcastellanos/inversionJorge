const MIAMI_TZ = 'America/New_York';

/** Hora civil actual en Miami (ET/EDT). */
export function getMiamiHourMinute(now = new Date()): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MIAMI_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? -1);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? -1);
  return { hour, minute };
}

/** Ventana del cron diario: 19:00 hora Miami (7 pm ET/EDT). */
export function isMiamiDailyMembershipAuditTime(now = new Date()): boolean {
  const { hour, minute } = getMiamiHourMinute(now);
  return hour === 19 && minute < 10;
}