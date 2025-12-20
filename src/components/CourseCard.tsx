'use client';

import { useState } from 'react';

interface CourseCardProps {
  course: {
    Id: number;
    Title: string;
    Description: string;
    ImageUrl: string;
    Price: number;
    StartDate?: string;
    EndDate?: string;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.Id })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error al procesar el checkout');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const hasDateInfo = course.StartDate || course.EndDate;

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {course.ImageUrl ? (
          <img 
            src={course.ImageUrl} 
            alt={course.Title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x200?text=Course+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      <div className="p-6">
        {/* Título con 2 líneas máximo */}
        <div className="mb-2">
          <h3 className={`text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors ${!showFullTitle ? 'line-clamp-2' : ''}`}>
            {course.Title}
          </h3>
          {course.Title.length > 60 && (
            <button
              onClick={() => setShowFullTitle(!showFullTitle)}
              className="text-sm text-blue-600 hover:text-blue-700 mt-1 font-medium"
            >
              {showFullTitle ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>

        {/* Descripción con 3 líneas máximo */}
        <div className="mb-4">
          <p className={`text-gray-600 ${!showFullDescription ? 'line-clamp-3' : ''}`}>
            {course.Description}
          </p>
          {course.Description.length > 120 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-sm text-blue-600 hover:text-blue-700 mt-1 font-medium"
            >
              {showFullDescription ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
        
        {hasDateInfo && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                {course.StartDate && (
                  <div><span className="font-medium">Inicio:</span> {formatDate(course.StartDate)}</div>
                )}
                {course.EndDate && (
                  <div><span className="font-medium">Fin:</span> {formatDate(course.EndDate)}</div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl font-bold text-gray-900">
            ${parseFloat(course.Price.toString()).toFixed(2)}
          </span>
        </div>
        <button 
          onClick={handleCheckout}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Inscribirse Ahora
        </button>
      </div>
    </div>
  );
}
