'use client';

interface CourseCardProps {
  course: {
    Id: number;
    Title: string;
    Description: string;
    ImageUrl: string;
    Price: number;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
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
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {course.Title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.Description}</p>
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
