
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
  const [finalPrice, setFinalPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
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
      });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title || !description || !imageUrl || !finalPrice) {
      setError('All fields are required');
      return;
    }
    const res = await fetch(`/api/courses/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, imageUrl, finalPrice: parseFloat(finalPrice), isActive }),
    });
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      const data = await res.json();
      setError(data.error || 'Error updating course');
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const res = await fetch(`/api/courses/${params.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Error deleting course');
    }
  }

  if (!course) return <div className="p-8">Loading...</div>;

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 rounded" required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2 rounded" required />
        <input type="text" placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="border p-2 rounded" required />
        <input type="number" placeholder="Final Price" value={finalPrice} onChange={e => setFinalPrice(e.target.value)} className="border p-2 rounded" required />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Active
        </label>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button type="button" onClick={() => router.push('/admin/dashboard')} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
          <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update</button>
        </div>
        <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
      </form>
    </main>
  );
}
