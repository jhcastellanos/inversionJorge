'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Mode = 'login' | 'register';

export default function MemberAuthForm({
  mode,
  variant = 'default',
}: {
  mode: Mode;
  variant?: 'default' | 'dark' | 'landing';
}) {
  const onLanding = variant === 'landing' || variant === 'dark';
  const inputClass = onLanding
    ? 'w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-slate-400'
    : 'w-full rounded-lg border border-gray-300 px-3 py-2';
  const labelClass = onLanding
    ? 'block text-sm font-medium text-slate-200 mb-1'
    : 'block text-sm font-medium text-gray-700 mb-1';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleEnabled = true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === 'login' ? '/api/member/login' : '/api/member/register';
      const body =
        mode === 'login'
          ? { email, password }
          : { email, password, full_name: fullName };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');

      if (data.access?.hasAccess) {
        router.push('/app');
      } else {
        router.push('/onboarding');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className={labelClass}>Nombre completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Contraseña</label>
          <input
            type="password"
            required
            minLength={mode === 'register' ? 8 : 1}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={
            onLanding
              ? 'w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-500 disabled:opacity-50'
              : 'w-full rounded-lg bg-blue-900 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50'
          }
        >
          {loading
            ? 'Procesando...'
            : mode === 'login'
              ? 'Entrar al CRM'
              : 'Crear cuenta y continuar'}
        </button>
      </form>

      {googleEnabled && (
        <div className="mt-6">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">o continúa con</span>
            </div>
          </div>
          <a
            href="/api/member/auth/google"
            className={
              onLanding
                ? 'flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-3 font-medium text-white hover:bg-white/10'
                : 'flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-800 hover:bg-gray-50'
            }
          >
            Google
          </a>
        </div>
      )}

      {!onLanding && (
        <p className="mt-6 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <Link href="/?register=1" className="font-semibold text-blue-700 hover:underline">
                Regístrate
              </Link>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <Link href="/" className="font-semibold text-blue-900 hover:underline">
                Inicia sesión
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
