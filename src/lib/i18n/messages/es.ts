export const es = {
  localeName: 'Español',
  nav: {
    home: 'Inicio',
    classes: 'Clases y Entrenamientos',
    calendar: 'Calendario',
    membership: 'Mi membresía',
    plans: 'Ver planes',
    admin: 'Admin',
    academyManager: 'Academy Manager',
    manageEvents: 'Gestionar eventos',
    logout: 'Cerrar sesión',
    logoutShort: 'Salir',
  },
  shell: {
    platform: 'Plataforma',
    brand: 'Inversión Real',
    hello: 'Hola',
    themeLight: 'Modo claro',
    themeDark: 'Modo oscuro',
    language: 'Idioma',
  },
  admin: {
    academy: {
      title: 'Academy Manager',
      subtitle:
        'Gestiona módulos, lecciones y contenido. Visible para usuarios activos con rol Estudiante o superior.',
    },
    events: {
      title: 'Gestionar eventos',
      subtitle:
        'Clases/retrospectivas, operativas de trading y sesiones avanzadas con reglas de membresía y rol.',
      add: 'Agregar evento',
    },
    themeToggle: 'Cambiar tema del panel',
  },
};

export type Messages = {
  localeName: string;
  nav: Record<string, string>;
  shell: Record<string, string>;
  admin: {
    academy: { title: string; subtitle: string };
    events: { title: string; subtitle: string; add: string };
    themeToggle: string;
  };
};
