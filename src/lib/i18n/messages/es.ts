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
  home: {
    liveBadge: 'EN VIVO',
    nextBadge: 'PRÓXIMO',
    noEvents: 'No hay eventos en vivo ni próximos. Revisa el calendario más adelante.',
    upcomingTitle: 'PRÓXIMOS EVENTOS',
    noMoreEvents: 'Sin más eventos programados.',
    join: 'Unirse',
    details: 'Detalles',
    calendar: 'Calendario',
  },
  subscriptions: {
    title: 'Mis suscripciones',
    account: 'Cuenta',
    changeAccount: 'Cambiar cuenta',
    backToApp: 'Volver a la plataforma',
    loading: 'Cargando suscripciones…',
    emailPrompt: 'Ingresa tu email para ver y gestionar tus suscripciones',
    emailLabel: 'Correo electrónico',
    submit: 'Ver mis suscripciones',
    emailTip: 'Usa el mismo email que utilizaste al realizar tu suscripción.',
    empty: 'No tienes suscripciones activas',
    explore: 'Explorar membresías',
    active: 'Activa',
    cancelAtEnd: 'Se cancela al final del período',
    price: 'Precio',
    nextCharge: 'Próximo cobro',
    manage: 'Gestionar suscripción',
    cancel: 'Cancelar suscripción',
    redirecting: 'Redirigiendo…',
    canceling: 'Cancelando…',
    portalTitle: 'Portal de gestión',
    scrollTermsHint: 'Desplázate hasta el final de los términos para continuar.',
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
  home: Record<string, string>;
  subscriptions: Record<string, string>;
  admin: {
    academy: { title: string; subtitle: string };
    events: { title: string; subtitle: string; add: string };
    themeToggle: string;
  };
};
