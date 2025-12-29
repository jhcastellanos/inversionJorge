'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function CreateMembershipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/memberships/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/admin/memberships');
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear la membresía');
      }
    } catch (err) {
      setError('Error al crear la membresía');
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Membresía</h2>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Ej: Comunidad Trading Pro"
                />
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Imagen
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">URL pública de la imagen (opcional)</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Describe los beneficios principales de la membresía..."
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent font-mono text-sm"
                  placeholder="Señales de trading en tiempo real&#10;Análisis técnico diario&#10;Grupo privado de Telegram&#10;Soporte personalizado 24/7"
                />
                <p className="text-sm text-gray-500 mt-1">Escribe cada beneficio en una línea separada</p>
              </div>

              {/* Is Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked
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
                  {loading ? 'Creando...' : 'Crear Membresía'}
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
