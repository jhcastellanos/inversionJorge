export const PLATFORM_ROLES = ['admin', 'soporte', 'inversor', 'trader', 'alumno'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  admin: 'Admin',
  soporte: 'Soporte',
  inversor: 'Inversor',
  trader: 'Trader',
  alumno: 'Alumno',
};

export type PlatformPermissions = {
  /** Panel /admin y gestión total */
  admin: boolean;
  /** Panel /admin con restricciones (sin CRUD clases/eventos ni eliminar usuarios) */
  soporte: boolean;
  /** Herramientas de inversor + trader + alumno */
  inversor: boolean;
  /** Herramientas de trader + alumno */
  trader: boolean;
  /** Contenido base (clases, entrenamientos) */
  alumno: boolean;
};

export type StaffCapabilities = {
  canDeletePlatformUsers: boolean;
  canManagePlatformContent: boolean;
};

export function isPlatformStaffRole(role: PlatformRole | null): role is 'admin' | 'soporte' {
  return role === 'admin' || role === 'soporte';
}

/** Permisos de staff en panel admin (login admin JWT = admin completo) */
export function getStaffCapabilities(role: PlatformRole): StaffCapabilities {
  switch (role) {
    case 'admin':
      return { canDeletePlatformUsers: true, canManagePlatformContent: true };
    case 'soporte':
      return { canDeletePlatformUsers: false, canManagePlatformContent: false };
    default:
      return { canDeletePlatformUsers: false, canManagePlatformContent: false };
  }
}

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
    return {
      admin: false,
      soporte: false,
      inversor: false,
      trader: false,
      alumno: false,
    };
  }
  switch (role) {
    case 'admin':
      return { admin: true, soporte: false, inversor: true, trader: true, alumno: true };
    case 'soporte':
      return { admin: false, soporte: true, inversor: true, trader: true, alumno: true };
    case 'inversor':
      return { admin: false, soporte: false, inversor: true, trader: true, alumno: true };
    case 'trader':
      return { admin: false, soporte: false, inversor: false, trader: true, alumno: true };
    case 'alumno':
      return { admin: false, soporte: false, inversor: false, trader: false, alumno: true };
    default:
      return {
        admin: false,
        soporte: false,
        inversor: false,
        trader: false,
        alumno: false,
      };
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
    case 'soporte':
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
