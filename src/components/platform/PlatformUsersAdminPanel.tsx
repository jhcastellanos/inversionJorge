'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  PLATFORM_ROLE_LABELS,
  PLATFORM_ROLES,
  parsePlatformRole,
  type PlatformRole,
} from '../../lib/platformRoles';

type User = {
  id: number;
  email: string;
  full_name: string;
  stripe_customer_id: string | null;
  discord_user_id: string | null;
  platform_role: string | null;
  onboarding_completed: boolean;
};

function LinkBadge({ linked, label }: { linked: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        linked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {linked ? 'Sí' : 'No'} · {label}
    </span>
  );
}

function RoleBadge({ role }: { role: string | null }) {
  const parsed = parsePlatformRole(role);
  const label = parsed ? PLATFORM_ROLE_LABELS[parsed] : 'Sin rol';
  return (
    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
      {label}
    </span>
  );
}

export default function PlatformUsersAdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draftStripe, setDraftStripe] = useState<Record<number, string>>({});
  const [draftRole, setDraftRole] = useState<Record<number, string>>({});
  const [canDeleteUsers, setCanDeleteUsers] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/platform-users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setUsers(data.users ?? []);
      setCanDeleteUsers(Boolean(data.staff?.capabilities?.canDeletePlatformUsers));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const linkStripe = async (userId: number) => {
    const stripe_customer_id = draftStripe[userId]?.trim();
    if (!stripe_customer_id) return;
    setError(null);
    setSuccess(null);
    const res = await fetch(`/api/admin/platform-users/${userId}/link-stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripe_customer_id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Error al vincular Stripe');
      return;
    }
    setSuccess('Stripe vinculado correctamente');
    await load();
  };

  const assignRole = async (userId: number) => {
    const roleValue = draftRole[userId] ?? 'none';
    setError(null);
    setSuccess(null);
    const res = await fetch(`/api/admin/platform-users/${userId}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform_role: roleValue === 'none' ? null : roleValue,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Error al asignar rol');
      return;
    }
    setSuccess('Rol asignado correctamente');
    await load();
  };

  const deleteUser = async (userId: number, name: string) => {
    if (!confirm(`¿Eliminar permanentemente a ${name}?`)) return;
    setError(null);
    setSuccess(null);
    const res = await fetch(`/api/admin/platform-users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'No se pudo eliminar');
      return;
    }
    setSuccess('Usuario eliminado');
    await load();
  };

  const linkedDiscord = users.filter((u) => u.discord_user_id?.trim()).length;
  const linkedStripe = users.filter((u) => u.stripe_customer_id?.trim()).length;

  if (loading) return <p className="text-gray-500">Cargando usuarios...</p>;

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase text-gray-500">Total usuarios</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase text-gray-500">Discord vinculado</p>
          <p className="text-2xl font-bold text-gray-900">{linkedDiscord}</p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase text-gray-500">Stripe vinculado</p>
          <p className="text-2xl font-bold text-gray-900">{linkedStripe}</p>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">Jerarquía de roles</p>
        <p>
          <strong>Admin</strong> → todo · <strong>Soporte</strong> → panel admin limitado · <strong>Trader</strong> /
          <strong> Visitante</strong> según membresía Stripe · <strong>Alumno</strong> / <strong>Inversor</strong> manual.
          La columna <strong>Discord</strong> muestra si completó el paso obligatorio de vinculación.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol actual</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discord</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stripe</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Aún no hay usuarios registrados en la plataforma
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const hasDiscord = Boolean(u.discord_user_id?.trim());
                const hasStripe = Boolean(u.stripe_customer_id?.trim());
                return (
                  <tr key={u.id} className="align-top hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm text-gray-500">{u.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.platform_role} />
                    </td>
                    <td className="px-4 py-3">
                      <LinkBadge linked={hasDiscord} label="Discord" />
                      {hasDiscord && (
                        <p className="mt-1 text-xs font-mono text-gray-500 break-all">{u.discord_user_id}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <LinkBadge linked={hasStripe} label="Stripe" />
                      {hasStripe && (
                        <p className="mt-1 text-xs font-mono text-gray-500 break-all">{u.stripe_customer_id}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Cambiar rol</p>
                          <select
                            value={draftRole[u.id] ?? u.platform_role ?? 'none'}
                            onChange={(e) =>
                              setDraftRole((prev) => ({ ...prev, [u.id]: e.target.value }))
                            }
                            className="rounded border px-2 py-1 text-sm w-full max-w-[160px]"
                          >
                            <option value="none">Sin rol</option>
                            {PLATFORM_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {PLATFORM_ROLE_LABELS[r as PlatformRole]}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => assignRole(u.id)}
                            className="mt-1 text-xs font-semibold text-blue-900 hover:underline text-left block"
                          >
                            Guardar rol
                          </button>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Vincular Stripe</p>
                          <input
                            type="text"
                            placeholder="cus_..."
                            value={draftStripe[u.id] ?? u.stripe_customer_id ?? ''}
                            onChange={(e) =>
                              setDraftStripe((prev) => ({ ...prev, [u.id]: e.target.value }))
                            }
                            className="rounded border px-2 py-1 text-xs w-full max-w-[180px]"
                          />
                          <button
                            type="button"
                            onClick={() => linkStripe(u.id)}
                            className="mt-1 text-xs font-semibold text-blue-900 hover:underline text-left block"
                          >
                            Guardar Stripe
                          </button>
                        </div>
                        {canDeleteUsers && (
                          <button
                            type="button"
                            onClick={() => deleteUser(u.id, u.full_name)}
                            className="text-xs font-semibold text-red-700 hover:underline text-left"
                          >
                            Eliminar usuario
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}