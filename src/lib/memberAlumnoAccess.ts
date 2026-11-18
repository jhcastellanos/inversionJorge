import type { PlatformUserRow } from './platformUsers';
import { PlatformUser } from './platformUsers';
import { ensurePlatformUserAlumnoSchema } from './platformUserAlumnoSchema';
import { ALUMNO_PACKAGE_ACCESS_YEARS } from './alumnoPackageConfig';

/** IDs de cursos en Stripe/checkout que otorgan acceso Estudiante (env: `1,2,3`). */
export function parseAlumnoPackageCourseIds(): number[] {
  const raw = process.env.ALUMNO_PACKAGE_COURSE_IDS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function isAlumnoPackageCourseId(courseId: number): boolean {
  const ids = parseAlumnoPackageCourseIds();
  if (ids.length === 0) return false;
  return ids.includes(courseId);
}

export function userHasActiveAlumnoAccess(user: Pick<PlatformUserRow, 'alumno_access_until'>): boolean {
  const until = user.alumno_access_until;
  if (!until) return false;
  const end = until instanceof Date ? until : new Date(until);
  return end.getTime() > Date.now();
}

/** Extiende acceso estudiante hasta la fecha más lejana. */
export async function extendAlumnoAccessUntil(userId: number, accessUntil: Date): Promise<PlatformUserRow | null> {
  await ensurePlatformUserAlumnoSchema();
  const user = await PlatformUser.findById(userId);
  if (!user) return null;

  const current = user.alumno_access_until
    ? user.alumno_access_until instanceof Date
      ? user.alumno_access_until
      : new Date(user.alumno_access_until)
    : null;

  const target = current && current.getTime() > accessUntil.getTime() ? current : accessUntil;
  return PlatformUser.updateAlumnoAccessUntil(userId, target);
}

export async function extendAlumnoAccessByEmail(email: string, accessUntil: Date): Promise<PlatformUserRow | null> {
  const user = await PlatformUser.findByEmail(email);
  if (!user) return null;
  return extendAlumnoAccessUntil(user.id, accessUntil);
}

export function addAlumnoAccessYears(from: Date, years = ALUMNO_PACKAGE_ACCESS_YEARS): Date {
  const d = new Date(from);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d;
}

/** Producto Stripe paquete cursos: 1 año desde la fecha de compra. */
export async function grantAlumnoPackageFromPurchase(
  userId: number,
  purchasedAt: Date = new Date()
): Promise<PlatformUserRow | null> {
  const accessUntil = addAlumnoAccessYears(purchasedAt, ALUMNO_PACKAGE_ACCESS_YEARS);
  return extendAlumnoAccessUntil(userId, accessUntil);
}

/** @deprecated Compras legacy vía tabla Courses; preferir producto Stripe. */
export function alumnoAccessUntilFromCourse(course: {
  EndDate?: string | Date | null;
}): Date {
  if (course.EndDate) {
    const end = new Date(course.EndDate);
    if (!Number.isNaN(end.getTime())) return end;
  }
  return addAlumnoAccessYears(new Date(), ALUMNO_PACKAGE_ACCESS_YEARS);
}