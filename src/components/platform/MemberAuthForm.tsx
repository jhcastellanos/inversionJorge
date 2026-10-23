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
  const onLanding = variant === 'landing';
  const onDark = variant === 'dark';
  const inputClass =
    onLanding || onDark
      ? 'w-full rounded-lg border ventic-border bg-[var(--ventic-bg)] px-3 py-2 ventic-text placeholder:ventic-muted focus:outline-none focus:ring-2 focus:ring-[var(--ventic-accent)]/40'
      : 'w-full rounded-lg border border-gray-300 px-3 py-2';
  const labelClass =
    onLanding || onDark
      ? 'block text-sm font-medium ventic-muted mb-1'
      : 'block text-sm font-medium text-gray-700 mb-1';
  const primaryBtnClass =
    'w-full rounded-lg bg-[var(--ventic-accent)] py-3 font-semibold text-white hover:bg-[var(--ventic-accent-hover)] disabled:opacity-50';
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
            onLanding || onDark
              ? primaryBtnClass
              : 'w-full rounded-lg bg-[var(--ventic-accent)] py-3 font-semibold text-white hover:bg-[var(--ventic-accent-hover)] disabled:opacity-50'
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
              <div className="w-full border-t ventic-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="ventic-surface px-2 ventic-muted">o continúa con</span>
            </div>
          </div>
          <a
            href="/api/member/auth/google"
            className={
              onLanding || onDark
                ? 'flex w-full items-center justify-center gap-2 rounded-lg border ventic-border ventic-surface py-3 font-medium ventic-text hover:bg-ventic-accent-soft'
                : 'flex w-full items-center justify-center gap-2 rounded-lg border ventic-border ventic-surface py-3 font-medium ventic-text hover:bg-ventic-accent-soft'
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
