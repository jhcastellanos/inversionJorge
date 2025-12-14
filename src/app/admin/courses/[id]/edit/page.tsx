
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/courses/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        setTitle(data.Title || '');
        setDescription(data.Description || '');
        setImageUrl(data.ImageUrl || '');
        setFinalPrice(data.Price?.toString() || '');
        setIsActive(data.IsActive ?? true);
        // Convertir timestamp a formato date input (YYYY-MM-DD)
        if (data.StartDate) {
          const date = new Date(data.StartDate);
          setStartDate(date.toISOString().split('T')[0]);
        }
        if (data.EndDate) {
          const date = new Date(data.EndDate);
          setEndDate(date.toISOString().split('T')[0]);
        }
      });
  }, [params.id]);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Upload failed');
        return;
      }
      
      const data = await res.json();
      setImageUrl(data.url);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title || !description || !imageUrl || !finalPrice) {
      setError('Todos los campos son requeridos');
      return;
    }
    const res = await fetch(`/api/courses/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        description, 
        imageUrl, 
        finalPrice: parseFloat(finalPrice), 
        isActive,
        startDate: startDate || null,
        endDate: endDate || null
      }),
    });
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      const data = await res.json();
      setError(data.error || 'Error al actualizar curso');
    }
  }

  async function handleDelete() {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;
    const res = await fetch(`/api/courses/${params.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Error al eliminar curso');
    }
  }

  if (!course) return <div className="p-8">Cargando...</div>;

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Editar Curso</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Título" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="border p-2 rounded" 
          required 
        />
        <textarea 
          placeholder="Descripción" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          className="border p-2 rounded h-24" 
          required 
        />
        
        {/* File Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Imagen del Curso</label>
          <div className="flex flex-col gap-2">
            <label 
              htmlFor="image-upload" 
              className="relative cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors bg-gray-50 hover:bg-blue-50"
            >
              <div className="flex flex-col items-center">
                {uploading ? (
                  <div className="text-blue-600 text-sm">Subiendo imagen...</div>
                ) : imageUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-green-600 text-sm flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Imagen cargada
                    </div>
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="mt-2 max-w-full h-32 object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Haz clic para seleccionar una imagen</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP hasta 5MB</p>
                  </div>
                )}
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        <input 
          type="number" 
          placeholder="Precio Final" 
          value={finalPrice} 
          onChange={e => setFinalPrice(e.target.value)} 
          className="border p-2 rounded" 
          required 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={e => setIsActive(e.target.checked)} 
          /> 
          Activo
        </label>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={() => router.push('/admin/dashboard')} 
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={uploading}
          >
            {uploading ? 'Subiendo...' : 'Actualizar'}
          </button>
        </div>
        <button 
          type="button" 
          onClick={handleDelete} 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Eliminar
        </button>
      </form>
    </main>
  );
}
