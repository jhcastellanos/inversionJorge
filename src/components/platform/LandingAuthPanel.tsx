'use client';

import { useState } from 'react';
import MemberAuthForm from './MemberAuthForm';

export default function LandingAuthPanel({
  initialMode = 'login',
}: {
  initialMode?: 'login' | 'register';
}) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-none">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-300 mb-3">Acceso al CRM</p>
        <div className="flex gap-2 mb-6 p-1 rounded-lg bg-black/20">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              mode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Crear cuenta
          </button>
        </div>
        <h2 className="text-xl font-bold mb-1">
          {mode === 'login' ? 'Entra a la plataforma' : 'Regístrate gratis'}
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          {mode === 'login'
            ? 'Con rol o membresía activa irás directo al calendario y clases en vivo.'
            : 'Después activa Stripe o pide a un admin que te asigne rol.'}
        </p>
        <MemberAuthForm mode={mode} variant="landing" />
      </div>
    </div>
  );
}
