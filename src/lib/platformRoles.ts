export const PLATFORM_ROLES = ['admin', 'inversor', 'trader', 'alumno'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  admin: 'Admin',
  inversor: 'Inversor',
  trader: 'Trader',
  alumno: 'Alumno',
};

export type PlatformPermissions = {
  /** Panel /admin y gestión total */
  admin: boolean;
  /** Herramientas de inversor + trader + alumno */
  inversor: boolean;
  /** Herramientas de trader + alumno */
  trader: boolean;
  /** Contenido base (clases, entrenamientos) */
  alumno: boolean;
};

export function parsePlatformRole(value: unknown): PlatformRole | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return PLATFORM_ROLES.includes(normalized as PlatformRole)
    ? (normalized as PlatformRole)
    : null;
}

/** Jerarquía: Admin ⊃ Inversor ⊃ Trader ⊃ Alumno */
export function getPermissionsForRole(role: PlatformRole | null): PlatformPermissions {
  if (!role) {
    return { admin: false, inversor: false, trader: false, alumno: false };
  }
  switch (role) {
    case 'admin':
      return { admin: true, inversor: true, trader: true, alumno: true };
    case 'inversor':
      return { admin: false, inversor: true, trader: true, alumno: true };
    case 'trader':
      return { admin: false, inversor: false, trader: true, alumno: true };
    case 'alumno':
      return { admin: false, inversor: false, trader: false, alumno: true };
    default:
      return { admin: false, inversor: false, trader: false, alumno: false };
  }
}

export type ClassLevel = 'basico' | 'avanzado';
export type EventLevel = 'basico' | 'medio' | 'avanzado';

export const CLASS_LEVEL_LABELS: Record<ClassLevel, string> = {
  basico: 'Básicas',
  avanzado: 'Avanzadas',
};

export const EVENT_LEVEL_LABELS: Record<EventLevel, string> = {
  basico: 'Eventos básicos',
  medio: 'Eventos medios',
  avanzado: 'Eventos avanzados',
};

export type ContentAccess = {
  classes: Record<ClassLevel, boolean>;
  events: Record<EventLevel, boolean>;
};

/** Acceso a tipos de clase y evento según rol de plataforma */
export function getContentAccessForRole(role: PlatformRole | null): ContentAccess {
  if (!role) {
    return {
      classes: { basico: false, avanzado: false },
      events: { basico: false, medio: false, avanzado: false },
    };
  }

  switch (role) {
    case 'admin':
    case 'inversor':
      return {
        classes: { basico: true, avanzado: true },
        events: { basico: true, medio: true, avanzado: true },
      };
    case 'trader':
      return {
        classes: { basico: true, avanzado: false },
        events: { basico: true, medio: true, avanzado: false },
      };
    case 'alumno':
      return {
        classes: { basico: true, avanzado: false },
        events: { basico: true, medio: false, avanzado: false },
      };
    default:
      return {
        classes: { basico: false, avanzado: false },
        events: { basico: false, medio: false, avanzado: false },
      };
  }
}

export function canAccessClassLevel(role: PlatformRole | null, level: ClassLevel): boolean {
  return getContentAccessForRole(role).classes[level];
}

export function canAccessEventLevel(role: PlatformRole | null, level: EventLevel): boolean {
  return getContentAccessForRole(role).events[level];
}
