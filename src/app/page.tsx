import Link from 'next/link';

export default function PlatformHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Plataforma CRM</p>
          <h1 className="text-xl sm:text-2xl font-bold">Inversión Real con Jorge y Guille</h1>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link
            href="/login"
            className="px-3 sm:px-4 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold hover:bg-blue-500"
          >
            Crear cuenta
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Tu academia de trading, en un solo lugar
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            Regístrate, elige tu membresía y accede a la plataforma con clases, entrenamientos y
            recursos. El acceso se mantiene activo mientras tu suscripción en Stripe esté al día.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/registro"
              className="inline-flex justify-center rounded-xl bg-white text-blue-950 px-6 py-3 font-bold hover:bg-slate-100"
            >
              Empezar — crear cuenta
            </Link>
            <Link
              href="/planes"
              className="inline-flex justify-center rounded-xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
            >
              Ver membresías y cursos
            </Link>
          </div>
        </div>

        <section className="mt-20 grid sm:grid-cols-3 gap-6">
          {[
            {
              title: '1. Registro',
              text: 'Cuenta con email o Google. Si ya pagaste en Stripe, el admin vincula tu customer ID.',
            },
            {
              title: '2. Membresía',
              text: 'Wizard para elegir plan y pagar. Stripe define tu acceso recurrente.',
            },
            {
              title: '3. Plataforma',
              text: 'Clases y entrenamientos organizados por módulos (contenido en expansión).',
            },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-bold text-lg">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{step.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-400">
        <Link href="/admin/login" className="hover:text-white">
          Admin
        </Link>
        <span className="mx-2">·</span>
        © 2025 Inversión Real con Jorge y Guille
      </footer>
    </div>
  );
}
