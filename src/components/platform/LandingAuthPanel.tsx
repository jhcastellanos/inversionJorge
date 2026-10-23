'use client';

import { useState } from 'react';
import MemberAuthForm from './MemberAuthForm';

export default function LandingAuthPanel({
  initialMode = 'login',
}: {
  initialMode?: 'login' | 'register';
}) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
      active
        ? 'bg-[var(--ventic-accent)] text-white shadow-sm'
        : 'ventic-muted hover:bg-ventic-accent-soft hover:ventic-text'
    }`;

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-none">
      <div className="rounded-2xl border ventic-border ventic-surface p-6 sm:p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ventic-accent-muted)] mb-3">Acceso al CRM</p>
        <div className="flex gap-2 mb-6 p-1 rounded-xl border ventic-border bg-ventic-accent-soft/30">
          <button type="button" onClick={() => setMode('login')} className={tabClass(mode === 'login')}>
            Iniciar sesión
          </button>
          <button type="button" onClick={() => setMode('register')} className={tabClass(mode === 'register')}>
            Crear cuenta
          </button>
        </div>
        <h2 className="text-xl font-bold ventic-text mb-1">
          {mode === 'login' ? 'Entra a la plataforma' : 'Regístrate gratis'}
        </h2>
        <p className="text-sm ventic-muted mb-6">
          {mode === 'login'
            ? 'Con rol o membresía activa irás directo al calendario y clases en vivo.'
            : 'Después activa Stripe o pide a un admin que te asigne rol.'}
        </p>
        <MemberAuthForm mode={mode} variant="landing" />
      </div>
    </div>
  );
}
