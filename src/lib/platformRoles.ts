export const PLATFORM_ROLES = ['admin', 'soporte', 'inversor', 'trader', 'alumno'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  admin: 'Admin',
  soporte: 'Soporte',
  inversor: 'Inversor',
  trader: 'Trader',
  alumno: 'Estudiante',
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

/** Tipo de evento en vivo (reglas de membresía + rol) */
export const LIVE_EVENT_TIERS = [
  'clase_retrospectiva',
  'operativa_trading',
  'avanzado',
] as const;
export type LiveEventTier = (typeof LIVE_EVENT_TIERS)[number];

export const LIVE_EVENT_TIER_LABELS: Record<LiveEventTier, string> = {
  clase_retrospectiva: 'Clase en vivo / retrospectiva',
  operativa_trading: 'Operativa de trading',
  avanzado: 'Operativas y clases avanzadas',
};

export const LIVE_EVENT_TIER_AUDIENCE: Record<LiveEventTier, string> = {
  clase_retrospectiva: 'Usuarios activos con rol Estudiante o superior',
  operativa_trading: 'Membresía activa + rol Trader o Inversor',
  avanzado: 'Membresía activa + rol Inversor',
};

export function parseLiveEventTier(value: unknown): LiveEventTier {
  if (typeof value !== 'string') return 'clase_retrospectiva';
  const n = value.trim().toLowerCase();
  return LIVE_EVENT_TIERS.includes(n as LiveEventTier) ? (n as LiveEventTier) : 'clase_retrospectiva';
}

/** Formato del evento en calendario / inicio */
export const EVENT_KINDS = ['clase_en_vivo', 'operativa_en_vivo'] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  clase_en_vivo: 'Clase en vivo',
  operativa_en_vivo: 'Operativa en vivo',
};

export function parseEventKind(value: unknown): EventKind {
  if (typeof value !== 'string') return 'clase_en_vivo';
  const normalized = value.trim().toLowerCase();
  return EVENT_KINDS.includes(normalized as EventKind) ? (normalized as EventKind) : 'clase_en_vivo';
}

/** Sincroniza columnas legacy al guardar */
export function legacyFieldsFromEventTier(tier: LiveEventTier): {
  event_kind: EventKind;
  event_level: EventLevel;
} {
  switch (tier) {
    case 'operativa_trading':
      return { event_kind: 'operativa_en_vivo', event_level: 'medio' };
    case 'avanzado':
      return { event_kind: 'operativa_en_vivo', event_level: 'avanzado' };
    default:
      return { event_kind: 'clase_en_vivo', event_level: 'basico' };
  }
}

export const CLASS_LEVEL_LABELS: Record<ClassLevel, string> = {
  basico: 'Básicas',
  avanzado: 'Avanzadas',
};

export const EVENT_LEVEL_LABELS: Record<EventLevel, string> = {
  basico: 'Básico — Estudiante',
  medio: 'Medio — Trader',
  avanzado: 'Avanzado — Inversor',
};

/** Quién ve cada tipo de evento en inicio/calendario */
export const EVENT_LEVEL_AUDIENCE: Record<EventLevel, string> = {
  basico: 'Estudiante y roles superiores',
  medio: 'Trader, Inversor, Admin y Soporte',
  avanzado: 'Inversor, Admin y Soporte',
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
