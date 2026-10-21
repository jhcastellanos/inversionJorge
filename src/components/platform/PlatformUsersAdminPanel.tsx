'use client';

import { useCallback, useEffect, useState } from 'react';
import { PLATFORM_ROLE_LABELS, PLATFORM_ROLES, type PlatformRole } from '../../lib/platformRoles';

type User = {
  id: number;
  email: string;
  full_name: string;
  stripe_customer_id: string | null;
  platform_role: string | null;
  onboarding_completed: boolean;
};

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

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">Jerarquía de roles</p>
        <p>
          <strong>Admin</strong> → todo · <strong>Soporte</strong> → panel admin sin CRUD clases/calendario ni
          eliminar usuarios · <strong>Inversor</strong> → Trader + Alumno · <strong>Trader</strong> → Alumno ·{' '}
          <strong>Alumno</strong> → contenido base. Asignar rol da acceso aunque Stripe no esté vinculado.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stripe</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Aún no hay usuarios registrados en la plataforma
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="align-top">
                  <td className="px-4 py-3 text-sm text-gray-500">{u.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <select
                        value={draftRole[u.id] ?? u.platform_role ?? 'none'}
                        onChange={(e) =>
                          setDraftRole((prev) => ({ ...prev, [u.id]: e.target.value }))
                        }
                        className="rounded border px-2 py-1 text-sm"
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
                        className="text-xs font-semibold text-blue-900 hover:underline text-left"
                      >
                        Guardar rol
                      </button>
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
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-mono text-gray-500 break-all">
                        {u.stripe_customer_id || '—'}
                      </p>
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
                        className="text-xs font-semibold text-blue-900 hover:underline text-left"
                      >
                        Vincular Stripe
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
