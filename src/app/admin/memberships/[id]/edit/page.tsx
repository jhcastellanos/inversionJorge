'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EditMembershipPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    // Load membership data
    const loadData = async () => {
      try {
        const response = await fetch(`/api/memberships/${id}`);
        if (response.ok) {
          const data = await response.json();
          setMembership(data);
        } else {
          setError('No se pudo cargar la membresía');
        }
      } catch (err) {
        setError('Error al cargar la membresía');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch(`/api/memberships/${id}/update`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/admin/memberships');
      } else {
        const data = await response.json();
        setError(data.error || 'Error al actualizar la membresía');
      }
    } catch (err) {
      setError('Error al actualizar la membresía');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">No se encontró la membresía</p>
          <Link href="/admin/memberships" className="text-indigo-600 hover:text-indigo-700">
            Volver a Membresías
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
              <div className="flex gap-4">
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                  Cursos
                </Link>
                <Link href="/admin/memberships" className="text-indigo-600 font-semibold">
                  Membresías
                </Link>
                <Link href="/admin/subscriptions" className="text-gray-600 hover:text-gray-900">
                  Suscripciones
                </Link>
              </div>
            </div>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Ver sitio
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin/memberships" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Membresías
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Membresía</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Membresía *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={membership.Name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Comunidad Trading Pro"
                />
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Imagen
                </label>
                {membership.ImageUrl && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Imagen actual:</p>
                    <img 
                      src={membership.ImageUrl} 
                      alt={membership.Name}
                      className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  defaultValue={membership.ImageUrl || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {membership.ImageUrl ? 'Ingresa una nueva URL para cambiar la imagen (opcional)' : 'URL pública de la imagen (opcional)'}
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  defaultValue={membership.Description}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Acceso completo a nuestra comunidad exclusiva..."
                />
              </div>

              {/* Monthly Price */}
              <div>
                <label htmlFor="monthly_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Mensual (USD) *
                </label>
                <input
                  type="number"
                  id="monthly_price"
                  name="monthly_price"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={membership.MonthlyPrice}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="150.00"
                />
                <p className="text-sm text-gray-500 mt-1">Precio fijo mensual de la suscripción</p>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio (Opcional)
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  defaultValue={membership.StartDate ? new Date(membership.StartDate).toISOString().slice(0, 10) : ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Si se define, las compras antes de esta fecha entrarán en período de prueba sin cobro hasta la fecha de inicio
                </p>
              </div>

              {/* Benefits */}
              <div>
                <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficios *
                </label>
                <textarea
                  id="benefits"
                  name="benefits"
                  required
                  rows={8}
                  defaultValue={membership.Benefits}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent font-mono text-sm"
                  placeholder="Señales de trading en tiempo real&#10;Análisis técnico diario"
                />
                <p className="text-sm text-gray-500 mt-1">Escribe cada beneficio en una línea separada</p>
              </div>

              {/* Is Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={membership.IsActive}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Membresía activa (visible en el sitio)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <Link
                  href="/admin/memberships"
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
