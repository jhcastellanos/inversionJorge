export const es = {
  localeName: 'Español',
  nav: {
    home: 'Inicio',
    classes: 'Clases y Entrenamientos',
    calendar: 'Calendario',
    membership: 'Mi membresía',
    plans: 'Ver planes',
    admin: 'Admin',
    academyManager: 'Gestor de academia',
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
    liveNowTitle: 'EN VIVO AHORA',
    upcomingTitle: 'PRÓXIMOS EVENTOS',
    noMoreEvents: 'Sin más eventos programados.',
    join: 'Unirse',
    details: 'Detalles',
    calendar: 'Calendario',
  },
  classes: {
    subtitle: 'Academia para miembros activos ({role}). Módulos y lecciones publicados por el equipo.',
    emptyAcademy: 'Aún no hay módulos en la academia. Revisa más tarde.',
    watchVideo: 'Ver video',
    viewPdf: 'Ver PDF',
    openLink: 'Abrir enlace',
    additionalContent: 'Contenido adicional',
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
      title: 'Gestor de academia',
      subtitle:
        'Gestiona módulos, lecciones y contenido. Visible para usuarios activos con rol Estudiante o superior.',
      addModule: 'Agregar módulo',
      addAnotherModule: 'Agregar otro módulo',
      addLesson: 'Agregar lección',
      statsModules: 'Módulos',
      statsVideos: 'Videos',
      statsPdfs: 'PDFs',
      statsLinks: 'Enlaces',
      published: 'Publicado',
      lessons: 'lecciones',
      lessonOne: 'lección',
      noModules: 'No hay módulos. Usa «Agregar módulo» para crear el primero.',
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
  classes: {
    subtitle: string;
    emptyAcademy: string;
    watchVideo: string;
    viewPdf: string;
    openLink: string;
    additionalContent: string;
  };
  admin: {
    academy: {
      title: string;
      subtitle: string;
      addModule: string;
      addAnotherModule: string;
      addLesson: string;
      statsModules: string;
      statsVideos: string;
      statsPdfs: string;
      statsLinks: string;
      published: string;
      lessons: string;
      lessonOne: string;
      noModules: string;
    };
    events: { title: string; subtitle: string; add: string };
    themeToggle: string;
  };
};
