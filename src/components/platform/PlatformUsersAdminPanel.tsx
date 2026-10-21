'use client';

import { useCallback, useEffect, useState } from 'react';

type User = {
  id: number;
  email: string;
  full_name: string;
  stripe_customer_id: string | null;
  onboarding_completed: boolean;
};

export default function PlatformUsersAdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftStripe, setDraftStripe] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/platform-users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setUsers(data.users ?? []);
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
    const res = await fetch(`/api/admin/platform-users/${userId}/link-stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripe_customer_id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Error al vincular');
      return;
    }
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
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stripe Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Aún no hay usuarios registrados en la plataforma
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-sm">{u.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm font-mono text-xs">
                    {u.stripe_customer_id || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="cus_..."
                        value={draftStripe[u.id] ?? u.stripe_customer_id ?? ''}
                        onChange={(e) =>
                          setDraftStripe((prev) => ({ ...prev, [u.id]: e.target.value }))
                        }
                        className="rounded border px-2 py-1 text-xs w-40"
                      />
                      <button
                        type="button"
                        onClick={() => linkStripe(u.id)}
                        className="text-xs font-semibold text-blue-900 hover:underline"
                      >
                        Vincular
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
