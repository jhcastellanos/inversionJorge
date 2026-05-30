'use client';

import { useState } from 'react';
import CourseCard from './CourseCard';
import MembershipCard from './MembershipCard';
import { getMonthlyBasePrice, sortMembershipsByPlanOrder } from '../lib/membershipPlans';

export default function ResponsiveLanding({ courses, memberships }: { courses: any[]; memberships: any[] }) {
  const [activeTab, setActiveTab] = useState<'memberships' | 'courses'>('memberships');
  const monthlyBasePrice = getMonthlyBasePrice(memberships);
  const orderedMemberships = sortMembershipsByPlanOrder(memberships);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Selector de sección (mismo en móvil y escritorio) */}
      <div className="sticky top-[73px] z-40 -mx-4 px-4 sm:mx-0 sm:px-0 pt-2 pb-6">
        <div className="mx-auto flex max-w-xl gap-2 rounded-2xl border-2 border-indigo-200 bg-white/95 p-2 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setActiveTab('memberships')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all duration-300 ${
              activeTab === 'memberships'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>Membresías</span>
            {memberships.length > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === 'memberships' ? 'bg-white/30 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {memberships.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all duration-300 ${
              activeTab === 'courses'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Cursos y Clases</span>
            {courses.length > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === 'courses' ? 'bg-white/30 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {courses.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sección: Membresías */}
      {activeTab === 'memberships' && (
        <section className="animate-fadeIn">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Membresías Exclusivas</h2>
            <p className="mt-3 text-gray-600">
              Elige el plan que mejor se adapta a ti. Mientras más largo, más ahorras.
            </p>
          </div>

          {orderedMemberships.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">No hay membresías disponibles</p>
            </div>
          ) : (
            <>
              <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-8">
                {orderedMemberships.map((membership: any) => (
                  <MembershipCard
                    key={membership.Id}
                    membership={membership}
                    monthlyBasePrice={monthlyBasePrice}
                  />
                ))}
              </div>
              <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-gray-500">
                Todos los pagos son recurrentes y <strong>no reembolsables</strong>. Elige bien tu plan
                antes de suscribirte.
              </p>
            </>
          )}
        </section>
      )}

      {/* Sección: Cursos y Clases Grabadas */}
      {activeTab === 'courses' && (
        <section className="animate-fadeIn">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Cursos y Clases Grabadas</h2>
            <p className="mt-3 text-gray-600">Pago único · Acceso de por vida al contenido.</p>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">No hay cursos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {courses.map((course: any) => (
                <CourseCard key={course.Id} course={course} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
