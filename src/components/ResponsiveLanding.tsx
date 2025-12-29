'use client';

import { useState } from 'react';
import CourseCard from './CourseCard';
import MembershipCard from './MembershipCard';

export default function ResponsiveLanding({ courses, memberships }: { courses: any[]; memberships: any[] }) {
  const [activeTab, setActiveTab] = useState<'memberships' | 'courses'>('memberships');

  return (
    <>
      {/* Mobile Tabs - Sticky con fondo y separación clara */}
      <div className="lg:hidden sticky top-[73px] z-40 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-6 pt-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex gap-3 bg-white/90 backdrop-blur-md rounded-2xl p-2 shadow-xl border-2 border-indigo-200">
          <button
            onClick={() => setActiveTab('memberships')}
            className={`flex-1 py-4 px-3 rounded-xl font-bold transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
              activeTab === 'memberships'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-105 transform'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-gray-100 hover:to-gray-200 hover:scale-102'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-extrabold">Membresías</span>
            {memberships.length > 0 && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                activeTab === 'memberships' 
                  ? 'bg-white/30 text-white' 
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {memberships.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-4 px-3 rounded-xl font-bold transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
              activeTab === 'courses'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-105 transform'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-gray-100 hover:to-gray-200 hover:scale-102'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-extrabold">Cursos</span>
            {courses.length > 0 && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                activeTab === 'courses' 
                  ? 'bg-white/30 text-white' 
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {courses.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Memberships Column */}
          <div>
            <div className="sticky top-[73px] z-30 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl text-white mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Membresías Exclusivas
              </h2>
              <p className="text-indigo-100 text-sm mt-2">
                Acceso mensual recurrente a beneficios exclusivos
              </p>
            </div>
            <div className="space-y-6">
              {memberships.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">No hay membresías disponibles</p>
                </div>
              ) : (
                memberships.map((membership: any) => (
                  <MembershipCard key={membership.Id} membership={membership} />
                ))
              )}
            </div>
          </div>

          {/* Courses Column */}
          <div>
            <div className="sticky top-[73px] z-30 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl text-white mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Cursos Disponibles
              </h2>
              <p className="text-indigo-100 text-sm mt-2">
                Pago único - Acceso de por vida
              </p>
            </div>
            <div className="space-y-6">
              {courses.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">No hay cursos disponibles</p>
                </div>
              ) : (
                courses.map((course: any) => (
                  <CourseCard key={course.Id} course={course} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Mobile Single Column with Tabs */}
        <div className="lg:hidden">
          {activeTab === 'memberships' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header de Sección */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl text-white mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Membresías Exclusivas
                </h2>
                <p className="text-indigo-100 text-sm">Acceso mensual recurrente a beneficios exclusivos</p>
              </div>

              {memberships.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">No hay membresías disponibles</p>
                </div>
              ) : (
                memberships.map((membership: any) => (
                  <MembershipCard key={membership.Id} membership={membership} />
                ))
              )}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header de Sección */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl text-white mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Cursos Disponibles
                </h2>
                <p className="text-indigo-100 text-sm">Pago único - Acceso de por vida</p>
              </div>

              {courses.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">No hay cursos disponibles</p>
                </div>
              ) : (
                courses.map((course: any) => (
                  <CourseCard key={course.Id} course={course} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
